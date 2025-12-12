"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateShippingOptionTypesStep = exports.updateShippingOptionTypesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.updateShippingOptionTypesStepId = "update-shipping-option-types";
/**
 * This step updates shipping option types matching the specified filters.
 *
 * @since 2.10.0
 *
 * @example
 * const shippingOptionTypes = updateShippingOptionTypesStep({
 *   selector: {
 *     id: "sotype_123"
 *   },
 *   update: {
 *     label: "Standard"
 *   }
 * })
 */
exports.updateShippingOptionTypesStep = (0, workflows_sdk_1.createStep)(exports.updateShippingOptionTypesStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    const { selects, relations } = (0, utils_1.getSelectsAndRelationsFromObjectArray)([
        data.update,
    ]);
    const prevData = await service.listShippingOptionTypes(data.selector, {
        select: selects,
        relations,
    });
    const shippingOptionTypes = await service.updateShippingOptionTypes(data.selector, data.update);
    return new workflows_sdk_1.StepResponse(shippingOptionTypes, prevData);
}, async (prevData, { container }) => {
    if (!prevData?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    await service.upsertShippingOptionTypes(prevData);
});
//# sourceMappingURL=update-shipping-option-types.js.map