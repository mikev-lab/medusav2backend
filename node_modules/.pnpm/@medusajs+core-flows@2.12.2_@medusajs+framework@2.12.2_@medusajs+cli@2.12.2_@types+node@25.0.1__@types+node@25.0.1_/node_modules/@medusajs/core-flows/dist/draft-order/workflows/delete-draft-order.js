"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDraftOrdersWorkflow = exports.deleteDraftOrderWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const utils_1 = require("@medusajs/framework/utils");
const common_1 = require("../../common");
const steps_1 = require("../steps");
const validateDraftOrdersStep = (0, workflows_sdk_1.createStep)("validate-draft-orders", async (data) => {
    if (data.orders.some((order) => order.status !== "draft" || !order.is_draft_order)) {
        throw new Error("One or more orders are not draft");
    }
    if (data.orders.some((order) => order.deleted_at)) {
        throw new Error("One or more orders are already deleted");
    }
});
exports.deleteDraftOrderWorkflowId = "delete-draft-order";
/**
 * This workflow deletes draft orders. It's used by the [Delete Draft Order API route](https://docs.medusajs.com/api/admin#draft-orders_deletedraftordersid).
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around deleting a draft order.
 *
 * @example
 * const { result } = await deleteDraftOrderWorkflow(container)
 * .run({
 *   input: {
 *     order_ids: ["order_123", "order_456"],
 *   }
 * })
 *
 * @summary
 *
 * Delete draft orders.
 */
exports.deleteDraftOrdersWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.deleteDraftOrderWorkflowId, (input) => {
    const orderQuery = (0, common_1.useQueryGraphStep)({
        entity: "orders",
        fields: ["id", "status", "is_draft_order", "deleted_at"],
        filters: { id: input.order_ids },
        options: { throwIfKeyNotFound: true },
    }).config({ name: "get-draft-order" });
    const orders = (0, workflows_sdk_1.transform)({ orderQuery }, ({ orderQuery }) => {
        return orderQuery.data;
    });
    validateDraftOrdersStep({ orders });
    (0, common_1.removeRemoteLinkStep)({
        [utils_1.Modules.ORDER]: { order_id: input.order_ids },
    });
    (0, steps_1.deleteDraftOrdersStep)({ orderIds: input.order_ids });
    return new workflows_sdk_1.WorkflowResponse(void 0);
});
//# sourceMappingURL=delete-draft-order.js.map