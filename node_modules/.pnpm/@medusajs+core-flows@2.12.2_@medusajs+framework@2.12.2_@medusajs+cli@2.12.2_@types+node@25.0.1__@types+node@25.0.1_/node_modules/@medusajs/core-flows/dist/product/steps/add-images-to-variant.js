"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addImagesToVariantStep = exports.addImagesToVariantStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
exports.addImagesToVariantStepId = "add-images-to-variant";
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
exports.addImagesToVariantStep = (0, workflows_sdk_1.createStep)(exports.addImagesToVariantStepId, async (input, { container }) => {
    if (!input.add.length) {
        return new workflows_sdk_1.StepResponse([], { added: [], variant_id: input.variant_id });
    }
    const productModuleService = container.resolve(utils_1.Modules.PRODUCT);
    const data = input.add.map((image_id) => ({
        image_id,
        variant_id: input.variant_id,
    }));
    await productModuleService.addImageToVariant(data);
    return new workflows_sdk_1.StepResponse(input.add, {
        added: input.add,
        variant_id: input.variant_id,
    });
}, async (compensationData, { container }) => {
    if (!compensationData?.added?.length || !compensationData?.variant_id) {
        return;
    }
    const productModuleService = container.resolve(utils_1.Modules.PRODUCT);
    const data = compensationData.added.map((image_id) => ({
        image_id,
        variant_id: compensationData.variant_id,
    }));
    await productModuleService.removeImageFromVariant(data);
});
//# sourceMappingURL=add-images-to-variant.js.map