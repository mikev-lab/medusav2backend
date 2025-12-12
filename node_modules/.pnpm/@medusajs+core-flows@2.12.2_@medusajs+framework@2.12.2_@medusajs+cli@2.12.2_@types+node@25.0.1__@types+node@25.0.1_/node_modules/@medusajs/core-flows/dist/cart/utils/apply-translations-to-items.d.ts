import { ProductVariantDTO } from "@medusajs/framework/types";
/**
 * Applies translated variant/product fields to line items.
 */
export declare function applyTranslationsToItems<T extends {
    variant_id?: string;
    [key: string]: any;
}>(items: T[], variants: Partial<ProductVariantDTO>[]): T[];
//# sourceMappingURL=apply-translations-to-items.d.ts.map