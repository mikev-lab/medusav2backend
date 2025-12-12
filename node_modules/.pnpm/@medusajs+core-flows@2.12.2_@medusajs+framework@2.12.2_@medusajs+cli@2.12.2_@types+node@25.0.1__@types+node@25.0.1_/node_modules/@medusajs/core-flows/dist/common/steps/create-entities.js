"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createEntitiesStep = exports.createEntitiesStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.createEntitiesStepId = "create-entities-step";
/**
 * This step creates one or more entities using methods in a module's service.
 *
 * @example
 * createEntitiesStep({
 *   moduleRegistrationName: Modules.CART,
 *   invokeMethod: "createCreditLines",
 *   compensateMethod: "deleteCreditLines",
 *   data: {
 *     cart_id: "cart_123",
 *     amount: 10,
 *     reference: "payment",
 *     reference_id: "payment_123",
 *     metadata: {
 *       key: "value",
 *     },
 *   },
 * })
 */
exports.createEntitiesStep = (0, workflows_sdk_1.createStep)(exports.createEntitiesStepId, async (input, { container }) => {
    const { moduleRegistrationName, invokeMethod, compensateMethod, entityIdentifier = "id", data = [], } = input;
    const module = container.resolve(moduleRegistrationName);
    const created = data.length ? await module[invokeMethod](data) : [];
    return new workflows_sdk_1.StepResponse(created, {
        entityIdentifiers: created.map((c) => c[entityIdentifier]),
        moduleRegistrationName,
        compensateMethod,
    });
}, async (compensateInput, { container }) => {
    const { entityIdentifiers = [], moduleRegistrationName, compensateMethod, } = compensateInput;
    if (!entityIdentifiers?.length) {
        return;
    }
    const module = container.resolve(moduleRegistrationName);
    await module[compensateMethod](entityIdentifiers);
});
//# sourceMappingURL=create-entities.js.map