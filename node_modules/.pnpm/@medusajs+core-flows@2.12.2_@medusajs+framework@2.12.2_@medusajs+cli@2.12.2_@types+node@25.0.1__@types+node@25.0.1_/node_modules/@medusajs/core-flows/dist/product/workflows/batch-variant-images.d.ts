/**
 * The input for the batch variant-images workflow.
 */
export interface BatchVariantImagesWorkflowInput {
    /**
     * The ID of the variant to manage images for.
     */
    variant_id: string;
    /**
     * The image IDs to add to the variant.
     */
    add?: string[];
    /**
     * The image IDs to remove from the variant.
     */
    remove?: string[];
}
/**
 * The result of the batch variant-images workflow.
 */
export interface BatchVariantImagesWorkflowOutput {
    /**
     * The image IDs that were added to the variant.
     */
    added: string[];
    /**
     * The image IDs that were removed from the variant.
     */
    removed: string[];
}
export declare const batchVariantImagesWorkflowId = "batch-variant-images";
/**
 * This workflow manages the association between product variants and images in bulk.
 * It's used by the [Batch Variant Images Admin API Route](https://docs.medusajs.com/api/admin#products_postproductsidvariantsvariant_idimagesbatch).
 *
 * You can use this workflow within your own customizations or custom workflows to manage variant-image associations in bulk.
 * This is also useful when writing a [seed script](https://docs.medusajs.com/learn/fundamentals/custom-cli-scripts/seed-data) or a custom import script.
 *
 * @since 2.11.2
 *
 * @example
 * const { result } = await batchVariantImagesWorkflow(container)
 * .run({
 *   input: {
 *     variant_id: "variant_123",
 *     add: ["img_123", "img_456"],
 *     remove: ["img_789"]
 *   }
 * })
 *
 * @summary
 *
 * Manage variant-image associations in bulk.
 */
export declare const batchVariantImagesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<BatchVariantImagesWorkflowInput, BatchVariantImagesWorkflowOutput, []>;
//# sourceMappingURL=batch-variant-images.d.ts.map