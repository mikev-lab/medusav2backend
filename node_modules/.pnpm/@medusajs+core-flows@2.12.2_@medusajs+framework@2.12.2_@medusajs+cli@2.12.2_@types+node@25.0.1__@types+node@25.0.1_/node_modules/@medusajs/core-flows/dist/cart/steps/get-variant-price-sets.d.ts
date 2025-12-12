import { CalculatedPriceSet } from "@medusajs/framework/types";
/**
 * The details of the variants to get price sets for.
 */
export interface GetVariantPriceSetsStepInput {
    /**
     * The IDs of the variants to get price sets for.
     */
    variantIds: string[];
    /**
     * The context to use when calculating the price sets.
     *
     * Learn more in [this documentation](https://docs.medusajs.com/resources/commerce-modules/product/guides/price#retrieve-calculated-price-for-a-context).
     */
    context?: Record<string, unknown>;
}
/**
 * The details of the variants to get price sets for.
 */
export interface GetVariantPriceSetsStepBulkInput {
    /**
     * The variants to get price sets for.
     */
    data: {
        /**
         * The ID of the item.
         */
        id?: string;
        /**
         * The ID of the variant to get the price set for.
         */
        variantId: string;
        /**
         * The context to use when calculating the price set.
         */
        context?: Record<string, unknown>;
    }[];
}
export interface GetVariantPriceSetsStepOutput {
    [k: string]: CalculatedPriceSet;
}
export declare const getVariantPriceSetsStepId = "get-variant-price-sets";
/**
 * This step retrieves the calculated price sets of the specified variants.
 *
 * @example
 * To retrieve variant price sets with shared context:
 *
 * ```ts
 * const data = getVariantPriceSetsStep({
 *   variantIds: ["variant_123"],
 *   context: { currency_code: "usd" }
 * })
 * ```
 *
 * To retrieve variant price sets with individual contexts:
 *
 * ```ts
 * const data = getVariantPriceSetsStep({
 *   data: [
 *     { variantId: "variant_123", context: { currency_code: "usd" } },
 *     { variantId: "variant_456", context: { currency_code: "usd" } }, // Same context - will be batched
 *     { variantId: "variant_789", context: { currency_code: "eur" } }
 *   ]
 * })
 * ```
 */
export declare const getVariantPriceSetsStep: import("@medusajs/framework/workflows-sdk").StepFunction<GetVariantPriceSetsStepInput | GetVariantPriceSetsStepBulkInput, {}>;
//# sourceMappingURL=get-variant-price-sets.d.ts.map