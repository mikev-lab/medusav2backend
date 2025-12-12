"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeImageFromVariantsStep = exports.removeImageFromVariantsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.removeImageFromVariantsStepId = "remove-image-from-variants";
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
exports.removeImageFromVariantsStep = (0, workflows_sdk_1.createStep)(exports.removeImageFromVariantsStepId, async (input, { container }) => {
    if (!input.remove.length) {
        return new workflows_sdk_1.StepResponse([], { removed: [], image_id: input.image_id });
    }
    const productModuleService = container.resolve(utils_1.Modules.PRODUCT);
    const data = input.remove.map((variant_id) => ({
        image_id: input.image_id,
        variant_id,
    }));
    await productModuleService.removeImageFromVariant(data);
    return new workflows_sdk_1.StepResponse(input.remove, {
        removed: input.remove,
        image_id: input.image_id,
    });
}, async (compensationData, { container }) => {
    if (!compensationData?.removed?.length || !compensationData?.image_id) {
        return;
    }
    const productModuleService = container.resolve(utils_1.Modules.PRODUCT);
    const data = compensationData.removed.map((variant_id) => ({
        image_id: compensationData.image_id,
        variant_id,
    }));
    await productModuleService.addImageToVariant(data);
});
//# sourceMappingURL=remove-image-from-variants.js.map