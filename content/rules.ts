import { rulesSchema } from "@/lib/content/schema";
import rulesJson from "./rules.json";

/** Правила турніру. Редагуються в /admin/rules. */
export const rules = rulesSchema.parse(rulesJson);
export type RuleSection = (typeof rules)[number];
