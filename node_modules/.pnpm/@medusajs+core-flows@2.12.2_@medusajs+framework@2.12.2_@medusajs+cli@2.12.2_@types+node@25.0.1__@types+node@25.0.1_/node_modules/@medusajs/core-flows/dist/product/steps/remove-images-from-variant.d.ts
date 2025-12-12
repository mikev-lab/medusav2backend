export declare const removeImagesFromVariantStepId = "remove-images-from-variant";
/**
 * This step removes one or more images from a product variant.
 *
 * @since 2.11.2
 *
 * @example
 * const data = removeImagesFromVariantStep({
 *   variant_id: "variant_123",
 *   remove: ["img_123", "img_456"]
 * })
 */
export declare const removeImagesFromVariantStep: import("@medusajs/framework/workflows-sdk").StepFunction<{
    variant_id: string;
    remove: string[];
}, string[]>;
//# sourceMappingURL=remove-images-from-variant.d.ts.map