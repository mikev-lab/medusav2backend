"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addImageToVariantsStep = exports.addImageToVariantsStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.addImageToVariantsStepId = "add-image-to-variants";
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
exports.addImageToVariantsStep = (0, workflows_sdk_1.createStep)(exports.addImageToVariantsStepId, async (input, { container }) => {
    if (!input.add.length) {
        return new workflows_sdk_1.StepResponse([], { added: [], image_id: input.image_id });
    }
    const productModuleService = container.resolve(utils_1.Modules.PRODUCT);
    const data = input.add.map((variant_id) => ({
        image_id: input.image_id,
        variant_id,
    }));
    await productModuleService.addImageToVariant(data);
    return new workflows_sdk_1.StepResponse(input.add, {
        added: input.add,
        image_id: input.image_id,
    });
}, async (compensationData, { container }) => {
    if (!compensationData?.added?.length || !compensationData?.image_id) {
        return;
    }
    const productModuleService = container.resolve(utils_1.Modules.PRODUCT);
    const data = compensationData.added.map((variant_id) => ({
        image_id: compensationData.image_id,
        variant_id,
    }));
    await productModuleService.removeImageFromVariant(data);
});
//# sourceMappingURL=add-image-to-variants.js.map