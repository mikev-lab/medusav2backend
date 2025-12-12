export interface UpdateCartItemsTranslationsStepInput {
    cart_id: string;
    locale: string;
    /**
     * Pre-loaded items to avoid re-fetching.
     */
    items?: {
        id: string;
        variant_id?: string;
        [key: string]: any;
    }[];
}
export declare const updateCartItemsTranslationsStepId = "update-cart-items-translations";
/**
 * This step re-translates all cart line items when the cart's locale changes.
 * It fetches items and their variants in batches to handle large carts gracefully.
 */
export declare const updateCartItemsTranslationsStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateCartItemsTranslationsStepInput, undefined>;
//# sourceMappingURL=update-cart-items-translations.d.ts.map