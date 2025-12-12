"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeImagesFromVariantStep = exports.removeImagesFromVariantStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
exports.removeImagesFromVariantStepId = "remove-images-from-variant";
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
exports.removeImagesFromVariantStep = (0, workflows_sdk_1.createStep)(exports.removeImagesFromVariantStepId, async (input, { container }) => {
    if (!input.remove.length) {
        return new workflows_sdk_1.StepResponse([], { removed: [], variant_id: input.variant_id });
    }
    const productModuleService = container.resolve(utils_1.Modules.PRODUCT);
    const data = input.remove.map((image_id) => ({
        image_id,
        variant_id: input.variant_id,
    }));
    await productModuleService.removeImageFromVariant(data);
    return new workflows_sdk_1.StepResponse(input.remove, {
        removed: input.remove,
        variant_id: input.variant_id,
    });
}, async (compensationData, { container }) => {
    if (!compensationData?.removed?.length || !compensationData?.variant_id) {
        return;
    }
    const productModuleService = container.resolve(utils_1.Modules.PRODUCT);
    const data = compensationData.removed.map((image_id) => ({
        image_id,
        variant_id: compensationData.variant_id,
    }));
    await productModuleService.addImageToVariant(data);
});
//# sourceMappingURL=remove-images-from-variant.js.map