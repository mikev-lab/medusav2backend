"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmDraftOrderEditWorkflow = exports.confirmDraftOrderEditWorkflowId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../common");
const order_1 = require("../../order");
const confirm_order_changes_1 = require("../../order/steps/confirm-order-changes");
const validate_draft_order_change_1 = require("../steps/validate-draft-order-change");
const locking_1 = require("../../locking");
exports.confirmDraftOrderEditWorkflowId = "confirm-draft-order-edit";
/**
 * This workflow confirms a draft order edit. It's used by the
 * [Confirm Draft Order Edit Admin API Route](https://docs.medusajs.com/api/admin#draft-orders_postdraftordersideditconfirm).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * confirming a draft order edit.
 *
 * @example
 * const { result } = await confirmDraftOrderEditWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *     confirmed_by: "user_123",
 *   }
 * })
 *
 * @summary
 *
 * Confirm a draft order edit.
 */
exports.confirmDraftOrderEditWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.confirmDraftOrderEditWorkflowId, function (input) {
    (0, locking_1.acquireLockStep)({
        key: input.order_id,
        timeout: 2,
        ttl: 10,
    });
    const order = (0, common_1.useRemoteQueryStep)({
        entry_point: "orders",
        fields: [
            "id",
            "status",
            "is_draft_order",
            "version",
            "canceled_at",
            "items.id",
            "items.title",
            "items.variant_title",
            "items.variant_sku",
            "items.variant_barcode",
            "shipping_address.*",
        ],
        variables: { id: input.order_id },
        list: false,
        throw_if_key_not_found: true,
    }).config({ name: "order-query" });
    const orderChange = (0, common_1.useRemoteQueryStep)({
        entry_point: "order_change",
        fields: [
            "id",
            "status",
            "actions.id",
            "actions.order_id",
            "actions.return_id",
            "actions.action",
            "actions.details",
            "actions.reference",
            "actions.reference_id",
            "actions.internal_note",
        ],
        variables: {
            filters: {
                order_id: input.order_id,
                status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
            },
        },
        list: false,
    }).config({ name: "order-change-query" });
    (0, validate_draft_order_change_1.validateDraftOrderChangeStep)({
        order,
        orderChange,
    });
    const orderPreview = (0, order_1.previewOrderChangeStep)(order.id);
    (0, confirm_order_changes_1.confirmOrderChanges)({
        changes: [orderChange],
        orderId: order.id,
        confirmed_by: input.confirmed_by,
    });
    order_1.createOrUpdateOrderPaymentCollectionWorkflow.runAsStep({
        input: {
            order_id: order.id,
        },
    });
    (0, locking_1.releaseLockStep)({
        key: input.order_id,
    });
    return new workflows_sdk_1.WorkflowResponse(orderPreview);
});
//# sourceMappingURL=confirm-draft-order-edit.js.map