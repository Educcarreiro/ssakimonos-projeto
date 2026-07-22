"use client";

import { useState } from "react";

/** Campo de tags simples — usado para listar as cores/tamanhos/modelos da matriz de variações. */
export function ChipInput({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const value = draft.trim();
    if (value && !values.includes(value)) onChange([...values, value]);
    setDraft("");
  }

  return (
    <div>
      <label className="mb-1 block text-[12px] font-semibold text-text-secondary">{label}</label>
      <div className="flex flex-wrap items-center gap-1.5 rounded-s border border-border bg-bg px-2 py-1.5">
        {values.map((v) => (
          <span
            key={v}
            className="flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[12px] font-semibold"
          >
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((x) => x !== v))}
              className="text-text-muted hover:text-crit"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            }
          }}
          onBlur={commit}
          placeholder={placeholder}
          className="min-w-[100px] flex-1 bg-transparent px-1 py-1 text-[13px] outline-none"
        />
      </div>
    </div>
  );
}
