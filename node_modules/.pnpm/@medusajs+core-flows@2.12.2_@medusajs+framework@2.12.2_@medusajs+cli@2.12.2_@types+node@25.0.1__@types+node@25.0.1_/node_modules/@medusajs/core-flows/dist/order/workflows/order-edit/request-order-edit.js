"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestOrderEditRequestWorkflow = exports.requestOrderEditRequestWorkflowId = exports.requestOrderEditRequestValidationStep = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const common_1 = require("../../../common");
const locking_1 = require("../../../locking");
const steps_1 = require("../../steps");
const update_order_changes_1 = require("../../steps/update-order-changes");
const order_validation_1 = require("../../utils/order-validation");
const fields_1 = require("./utils/fields");
function getOrderChangesData({ input, orderChange, }) {
    return (0, workflows_sdk_1.transform)({ input, orderChange }, ({ input, orderChange }) => {
        return [
            {
                id: orderChange.id,
                status: utils_1.OrderChangeStatus.REQUESTED,
                requested_at: new Date(),
                requested_by: input.requested_by,
            },
        ];
    });
}
/**
 * This step validates that a order edit can be requested.
 * If the order is canceled or the order change is not active, the step will throw an error.
 *
 * :::note
 *
 * You can retrieve an order and order change details using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @example
 * const data = requestOrderEditRequestValidationStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 * })
 */
exports.requestOrderEditRequestValidationStep = (0, workflows_sdk_1.createStep)("validate-order-edit-request", async function ({ order, orderChange, }) {
    (0, order_validation_1.throwIfIsCancelled)(order, "Order");
    (0, order_validation_1.throwIfOrderChangeIsNotActive)({ orderChange });
});
exports.requestOrderEditRequestWorkflowId = "order-edit-request";
/**
 * This workflow requests a previously created order edit request by {@link beginOrderEditOrderWorkflow}. This workflow is used by
 * the [Request Order Edit Admin API Route](https://docs.medusajs.com/api/admin#order-edits_postordereditsidrequest).
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to request an order edit
 * in your custom flows.
 *
 * @example
 * const { result } = await requestOrderEditRequestWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * Request an order edit.
 */
exports.requestOrderEditRequestWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.requestOrderEditRequestWorkflowId, function (input) {
    (0, locking_1.acquireLockStep)({
        key: input.order_id,
        timeout: 2,
        ttl: 10,
    });
    const orderResult = (0, common_1.useQueryGraphStep)({
        entity: "order",
        fields: fields_1.fieldsToRefreshOrderEdit,
        filters: { id: input.order_id },
        options: {
            throwIfKeyNotFound: true,
        },
    }).config({ name: "order-query" });
    const order = (0, workflows_sdk_1.transform)({ orderResult }, ({ orderResult }) => {
        return orderResult.data[0];
    });
    const orderChangeResult = (0, common_1.useQueryGraphStep)({
        entity: "order_change",
        fields: ["id", "status", "version", "actions.*"],
        filters: {
            order_id: input.order_id,
            status: [utils_1.OrderChangeStatus.PENDING, utils_1.OrderChangeStatus.REQUESTED],
        },
    }).config({ name: "order-change-query" });
    const orderChange = (0, workflows_sdk_1.transform)({ orderChangeResult }, ({ orderChangeResult }) => {
        return orderChangeResult.data[0];
    });
    (0, exports.requestOrderEditRequestValidationStep)({
        order,
        orderChange,
    });
    const updateOrderChangesData = getOrderChangesData({ input, orderChange });
    (0, update_order_changes_1.updateOrderChangesStep)(updateOrderChangesData);
    const eventData = (0, workflows_sdk_1.transform)({ order, orderChange }, ({ order, orderChange }) => {
        return {
            order_id: order.id,
            actions: orderChange.actions,
        };
    });
    (0, common_1.emitEventStep)({
        eventName: utils_1.OrderEditWorkflowEvents.REQUESTED,
        data: eventData,
    });
    const previewOrderChange = (0, steps_1.previewOrderChangeStep)(order.id);
    (0, locking_1.releaseLockStep)({
        key: input.order_id,
    });
    return new workflows_sdk_1.WorkflowResponse(previewOrderChange);
});
//# sourceMappingURL=request-order-edit.js.map