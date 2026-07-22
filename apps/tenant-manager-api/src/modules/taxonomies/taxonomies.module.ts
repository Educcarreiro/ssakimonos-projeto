import { Module } from "@nestjs/common";
import { TaxonomiesService } from "./taxonomies.service";
import { TaxonomiesController } from "./taxonomies.controller";

@Module({
  controllers: [TaxonomiesController],
  providers: [TaxonomiesService],
})
export class TaxonomiesModule {}
