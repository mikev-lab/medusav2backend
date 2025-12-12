"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchVariantImagesWorkflow = exports.batchVariantImagesWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
const common_1 = require("../../common");
exports.batchVariantImagesWorkflowId = "batch-variant-images";
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
exports.batchVariantImagesWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.batchVariantImagesWorkflowId, (input) => {
    const normalizedInput = (0, workflows_sdk_1.transform)({ input }, (data) => {
        return {
            variant_id: data.input.variant_id,
            add: data.input.add ?? [],
            remove: data.input.remove ?? [],
        };
    });
    const res = (0, workflows_sdk_1.parallelize)((0, steps_1.addImagesToVariantStep)(normalizedInput), (0, steps_1.removeImagesFromVariantStep)(normalizedInput));
    const shouldUpdateVariantThumbnail = (0, workflows_sdk_1.when)("images-removed", { normalizedInput }, (data) => data.normalizedInput.remove.length > 0).then(() => {
        const variantId = (0, workflows_sdk_1.transform)({ normalizedInput }, (data) => {
            return data.normalizedInput.variant_id;
        });
        const { data: variant } = (0, common_1.useQueryGraphStep)({
            entity: "variant",
            fields: ["id", "thumbnail"],
            filters: {
                id: variantId,
            },
            options: {
                isList: false,
            },
        }).config({ name: "get-variant-thumbnail" });
        const removedImagesQuery = (0, common_1.useQueryGraphStep)({
            entity: "product_image",
            fields: ["id", "url"],
            filters: {
                id: normalizedInput.remove,
            },
        }).config({ name: "get-removed-images" });
        const shouldUpdateVariantThumbnail = (0, workflows_sdk_1.transform)({ removedImagesQuery, variant }, (data) => {
            const urls = data.removedImagesQuery.data?.map((image) => image.url) ?? [];
            return !!urls.includes(data.variant.thumbnail);
        });
        return shouldUpdateVariantThumbnail;
    });
    (0, workflows_sdk_1.when)("should-update-variant-thumbnail", { shouldUpdateVariantThumbnail }, (data) => !!data.shouldUpdateVariantThumbnail).then(() => (0, steps_1.updateProductVariantsStep)({
        selector: { id: input.variant_id },
        update: { thumbnail: null },
    }));
    const response = (0, workflows_sdk_1.transform)({ res, input }, (data) => {
        return {
            added: data.res[0] ?? [],
            removed: data.res[1] ?? [],
        };
    });
    return new workflows_sdk_1.WorkflowResponse(response);
});
//# sourceMappingURL=batch-variant-images.js.map