export declare const addImagesToVariantStepId = "add-images-to-variant";
/**
 * This step adds one or more images to a product variant.
 *
 * @since 2.11.2
 *
 * @example
 * const data = addImagesToVariantStep({
 *   variant_id: "variant_123",
 *   add: ["img_123", "img_456"]
 * })
 */
export declare const addImagesToVariantStep: import("@medusajs/framework/workflows-sdk").StepFunction<{
    variant_id: string;
    add: string[];
}, string[]>;
//# sourceMappingURL=add-images-to-variant.d.ts.map