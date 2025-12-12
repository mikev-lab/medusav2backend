"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.batchImageVariantsWorkflow = exports.batchImageVariantsWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
const common_1 = require("../../common");
exports.batchImageVariantsWorkflowId = "batch-image-variants";
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
exports.batchImageVariantsWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.batchImageVariantsWorkflowId, (input) => {
    const normalizedInput = (0, workflows_sdk_1.transform)({ input }, (data) => {
        return {
            image_id: data.input.image_id,
            add: data.input.add ?? [],
            remove: data.input.remove ?? [],
        };
    });
    const res = (0, workflows_sdk_1.parallelize)((0, steps_1.addImageToVariantsStep)(normalizedInput), (0, steps_1.removeImageFromVariantsStep)(normalizedInput));
    const updateData = (0, workflows_sdk_1.when)("should-remove-variants", { normalizedInput }, (data) => data.normalizedInput.remove.length > 0).then(() => {
        const imageId = (0, workflows_sdk_1.transform)({ normalizedInput }, (data) => {
            return data.normalizedInput.image_id;
        });
        const variantsQuery = (0, common_1.useQueryGraphStep)({
            entity: "variants",
            fields: ["id", "thumbnail"],
            filters: {
                id: normalizedInput.remove,
            },
        }).config({ name: "get-variants-for-thumbnail-check" });
        const { data: image } = (0, common_1.useQueryGraphStep)({
            entity: "product_image",
            fields: ["id", "url"],
            filters: {
                id: imageId,
            },
            options: {
                isList: false,
            },
        }).config({ name: "get-image-for-thumbnail-check" });
        const updateData = (0, workflows_sdk_1.transform)({
            variants: variantsQuery.data,
            image: image,
        }, (data) => {
            const imageUrl = typeof data.image?.url === "string" ? data.image.url : null;
            if (!imageUrl) {
                return null;
            }
            return {
                selector: {
                    id: normalizedInput.remove,
                    thumbnail: imageUrl,
                },
                update: {
                    thumbnail: null,
                },
            };
        });
        return updateData;
    });
    (0, workflows_sdk_1.when)("should-update-variants", { updateData }, (data) => data.updateData !== null && typeof data.updateData !== "undefined").then(() => {
        (0, steps_1.updateProductVariantsStep)(updateData);
    });
    const response = (0, workflows_sdk_1.transform)({ res, input }, (data) => {
        return {
            added: data.res[0] ?? [],
            removed: data.res[1] ?? [],
        };
    });
    return new workflows_sdk_1.WorkflowResponse(response);
});
//# sourceMappingURL=batch-image-variants.js.map