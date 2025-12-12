/**
 * The input for the batch image-variant workflow.
 */
export interface BatchImageVariantsWorkflowInput {
    /**
     * The ID of the image to manage variants for.
     */
    image_id: string;
    /**
     * The variant IDs to add to the image.
     */
    add?: string[];
    /**
     * The variant IDs to remove from the image.
     */
    remove?: string[];
}
/**
 * The result of the batch image-variant workflow.
 */
export interface BatchImageVariantsWorkflowOutput {
    /**
     * The variant IDs that were added to the image.
     */
    added: string[];
    /**
     * The variant IDs that were removed from the image.
     */
    removed: string[];
}
export declare const batchImageVariantsWorkflowId = "batch-image-variants";
/**
 * This workflow manages the association between product images and variants in bulk.
 * It's used by the [Batch Image Variants Admin API Route](https://docs.medusajs.com/api/admin#products_postproductsidimagesimage_idvariantsbatch).
 *
 * You can use this workflow within your own customizations or custom workflows to manage image-variant associations in bulk.
 * This is also useful when writing a [seed script](https://docs.medusajs.com/learn/fundamentals/custom-cli-scripts/seed-data) or a custom import script.
 *
 * @since 2.11.2
 *
 * @example
 * const { result } = await batchImageVariantsWorkflow(container)
 * .run({
 *   input: {
 *     image_id: "img_123",
 *     add: ["variant_123", "variant_456"],
 *     remove: ["variant_789"]
 *   }
 * })
 *
 * @summary
 *
 * Manage image-variant associations in bulk.
 */
export declare const batchImageVariantsWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<BatchImageVariantsWorkflowInput, BatchImageVariantsWorkflowOutput, []>;
//# sourceMappingURL=batch-image-variants.d.ts.map