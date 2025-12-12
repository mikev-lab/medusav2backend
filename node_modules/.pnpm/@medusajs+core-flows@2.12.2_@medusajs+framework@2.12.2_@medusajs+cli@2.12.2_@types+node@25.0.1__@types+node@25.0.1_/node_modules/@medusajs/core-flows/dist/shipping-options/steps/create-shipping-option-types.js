"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShippingOptionTypesStep = exports.createShippingOptionTypesStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createShippingOptionTypesStepId = "create-shipping-option-types";
/**
 * This step creates one or more shipping option types.
 *
 * @since 2.10.0
 *
 * @example
 * const shippingOptionTypes = createShippingOptionTypesStep([
 *   {
 *     label: "Standard",
 *     code: "standard",
 *     description: "Ship in 2-3 days."
 *   }
 * ])
 */
exports.createShippingOptionTypesStep = (0, workflows_sdk_1.createStep)(exports.createShippingOptionTypesStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    const created = await service.createShippingOptionTypes(data);
    return new workflows_sdk_1.StepResponse(created, created.map((shippingOptionType) => shippingOptionType.id));
}, async (createdIds, { container }) => {
    if (!createdIds?.length) {
        return;
    }
    const service = container.resolve(utils_1.Modules.FULFILLMENT);
    await service.deleteShippingOptionTypes(createdIds);
});
//# sourceMappingURL=create-shipping-option-types.js.map