import { BadRequestException } from "@nestjs/common";
import { XMLParser } from "fast-xml-parser";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse");

export interface ParsedInvoiceItem {
  code: string;
  barcode?: string;
  name: string;
  ncm?: string;
  quantity: number;
  unitValue: number;
  totalValue: number;
}

export interface ParsedInvoice {
  supplierName?: string;
  supplierDocument?: string;
  sourceType: "XML" | "PDF";
  items: ParsedInvoiceItem[];
  warnings: string[];
}

function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function toNumber(value: unknown, fallback = 0): number {
  if (value === undefined || value === null) return fallback;
  const n = parseFloat(String(value).replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Lê o XML padrão de NF-e (leiaute da SEFAZ) — sem depender de IA, porque o
 * formato já é estruturado. Aceita tanto o XML "processado" (nfeProc) quanto
 * o XML "puro" da NFe.
 */
export function parseNfeXml(buffer: Buffer): ParsedInvoice {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_", trimValues: true });
  let xml: any;
  try {
    xml = parser.parse(buffer.toString("utf-8"));
  } catch {
    throw new BadRequestException("Não foi possível ler este arquivo como XML.");
  }

  const infNFe = xml?.nfeProc?.NFe?.infNFe ?? xml?.NFe?.infNFe ?? xml?.infNFe;
  if (!infNFe) {
    throw new BadRequestException(
      "Este XML não parece ser uma NF-e válida (tag <infNFe> não encontrada).",
    );
  }

  const emit = infNFe.emit ?? {};
  const detList = toArray(infNFe.det);

  const items: ParsedInvoiceItem[] = detList.map((det: any) => {
    const prod = det?.prod ?? {};
    const quantity = toNumber(prod.qCom);
    const unitValue = toNumber(prod.vUnCom);
    const totalValue = toNumber(prod.vProd, quantity * unitValue);
    const rawBarcode = prod.cEAN ? String(prod.cEAN).trim() : "";

    return {
      code: String(prod.cProd ?? "").trim(),
      barcode: rawBarcode && rawBarcode.toUpperCase() !== "SEM GTIN" ? rawBarcode : undefined,
      name: String(prod.xProd ?? "Item sem nome").trim(),
      ncm: prod.NCM ? String(prod.NCM).trim() : undefined,
      quantity,
      unitValue,
      totalValue,
    };
  });

  return {
    supplierName: emit.xNome ? String(emit.xNome).trim() : undefined,
    supplierDocument: emit.CNPJ ? String(emit.CNPJ).trim() : emit.CPF ? String(emit.CPF).trim() : undefined,
    sourceType: "XML",
    items,
    warnings: items.length === 0 ? ["Nenhum item (<det>) encontrado dentro do XML."] : [],
  };
}

/**
 * Extração best-effort de PDF: a maioria dos DANFEs perde alinhamento de
 * coluna quando o texto é extraído, então isto é heurístico — funciona bem
 * para PDFs de pedido/nota simples em lista, mas não é tão confiável quanto
 * o XML. Sempre avisa o usuário quando a confiança é baixa.
 */
export async function parseInvoicePdf(buffer: Buffer): Promise<ParsedInvoice> {
  let text = "";
  try {
    const result = await pdfParse(buffer);
    text = result.text ?? "";
  } catch {
    throw new BadRequestException("Não foi possível ler o conteúdo deste PDF.");
  }

  const lines = text
    .split("\n")
    .map((l: string) => l.trim())
    .filter(Boolean);

  // Padrão heurístico: "<descrição> <quantidade> <valor unitário> <valor total>"
  // valores no formato brasileiro (1.234,56) ou simples (12,50 / 12.50).
  const lineItemPattern =
    /^(.{3,80}?)\s+(\d{1,4}(?:[.,]\d{1,3})?)\s+(?:UN|UND|PC|CX|KG|PAR|M2?)?\s*[Rr]?\$?\s*(\d{1,3}(?:\.\d{3})*,\d{2}|\d+\.\d{2})\s+[Rr]?\$?\s*(\d{1,3}(?:\.\d{3})*,\d{2}|\d+\.\d{2})\s*$/;

  const items: ParsedInvoiceItem[] = [];
  for (const line of lines) {
    const match = line.match(lineItemPattern);
    if (!match) continue;

    const [, rawName, rawQty, rawUnit, rawTotal] = match;
    const quantity = toNumber(rawQty);
    const unitValue = toNumber(rawUnit.replace(/\./g, "").replace(",", "."));
    const totalValue = toNumber(rawTotal.replace(/\./g, "").replace(",", "."));

    if (quantity <= 0 || unitValue <= 0) continue;

    items.push({
      code: "",
      name: rawName.trim(),
      quantity,
      unitValue,
      totalValue,
    });
  }

  const warnings: string[] = [];
  if (items.length === 0) {
    warnings.push(
      "Não conseguimos identificar itens automaticamente neste PDF. Layouts de DANFE variam muito — " +
        "se o fornecedor puder exportar o XML da nota, o resultado é bem mais confiável.",
    );
  } else {
    warnings.push(
      "Extração de PDF é heurística (best-effort) — confira quantidade e valores antes de confirmar.",
    );
  }

  return { sourceType: "PDF", items, warnings };
}

export function parseInvoiceFile(buffer: Buffer, filename: string, mimetype: string): Promise<ParsedInvoice> | ParsedInvoice {
  const lowerName = filename.toLowerCase();
  const isXml = lowerName.endsWith(".xml") || mimetype.includes("xml");
  const isPdf = lowerName.endsWith(".pdf") || mimetype.includes("pdf");

  if (isXml) return parseNfeXml(buffer);
  if (isPdf) return parseInvoicePdf(buffer);

  throw new BadRequestException("Formato não suportado — envie o XML ou o PDF da nota fiscal.");
}
