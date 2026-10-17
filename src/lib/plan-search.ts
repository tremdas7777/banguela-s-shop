import { z } from "zod";
import { BUNDLE_IDS, DEFAULT_BUNDLE_ID, parseBundleId, type BundleId } from "@/lib/bundles";

/** Query string do produto: ?plano=<id>&variante=<valores separados por "|">&pantufas=<oferta>. */
export const planSearchSchema = z.object({
  plano: z.enum(BUNDLE_IDS).optional().catch(undefined),
  variante: z.string().max(200).optional().catch(undefined),
  /** Pantufas da oferta do pijama: "Branco_38-39,Preto_40-41" (validadas no checkout e no servidor). */
  pantufas: z.string().max(60).optional().catch(undefined),
});

export type PlanSearch = z.infer<typeof planSearchSchema>;

export function bundleIdFromSearch(search: PlanSearch): BundleId {
  return parseBundleId(search.plano) ?? DEFAULT_BUNDLE_ID;
}
