"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDraftOrdersStep = exports.deleteDraftOrdersStepId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
exports.deleteDraftOrdersStepId = "delete-draft-orders";
/**
 * This step deletes one or more draft orders.
 */
exports.deleteDraftOrdersStep = (0, workflows_sdk_1.createStep)(exports.deleteDraftOrdersStepId, async (data, { container }) => {
    const service = container.resolve(utils_1.Modules.ORDER);
    await service.deleteOrders(data.orderIds);
});
//# sourceMappingURL=delete-draft-order.js.map