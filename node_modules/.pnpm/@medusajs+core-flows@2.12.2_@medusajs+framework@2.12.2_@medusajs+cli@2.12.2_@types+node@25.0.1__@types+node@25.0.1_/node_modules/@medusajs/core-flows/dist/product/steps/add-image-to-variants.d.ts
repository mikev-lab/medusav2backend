export declare const addImageToVariantsStepId = "add-image-to-variants";
/**
 * This step adds an image to one or more product variants.
 *
 * @since 2.11.2
 *
 * @example
 * const data = addImageToVariantsStep({
 *   image_id: "img_123",
 *   add: ["variant_123", "variant_456"]
 * })
 */
export declare const addImageToVariantsStep: import("@medusajs/framework/workflows-sdk").StepFunction<{
    image_id: string;
    add: string[];
}, string[]>;
//# sourceMappingURL=add-image-to-variants.d.ts.map