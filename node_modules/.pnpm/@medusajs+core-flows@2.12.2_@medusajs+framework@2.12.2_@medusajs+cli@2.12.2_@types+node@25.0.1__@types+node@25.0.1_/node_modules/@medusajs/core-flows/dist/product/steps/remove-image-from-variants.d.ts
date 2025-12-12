export declare const removeImageFromVariantsStepId = "remove-image-from-variants";
/**
 * This step removes an image from one or more product variants.
 *
 * @since 2.11.2
 *
 * @example
 * const data = removeImageFromVariantsStep({
 *   image_id: "img_123",
 *   remove: ["variant_123", "variant_456"]
 * })
 */
export declare const removeImageFromVariantsStep: import("@medusajs/framework/workflows-sdk").StepFunction<{
    image_id: string;
    remove: string[];
}, string[]>;
//# sourceMappingURL=remove-image-from-variants.d.ts.map