"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderChangeWorkflow = exports.updateOrderChangeWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const update_order_changes_1 = require("../steps/update-order-changes");
const on_carry_promotions_flag_set_1 = require("./on-carry-promotions-flag-set");
exports.updateOrderChangeWorkflowId = "update-order-change-workflow";
/**
 * This workflow updates an order change.
 * If the `carry_over_promotions` flag is provided, it calls {@link onCarryPromotionsFlagSet}
 * to handle the promotion update logic. Otherwise, it updates the order change directly.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around
 * updating an order change and conditionally handling promotion carry-over.
 *
 * @since 2.12.0
 *
 * @example
 * const { result } = await updateOrderChangeWorkflow(container)
 * .run({
 *   input: {
 *     id: "orch_123",
 *     carry_over_promotions: true,
 *   }
 * })
 *
 * @summary
 *
 * Update an order change.
 */
exports.updateOrderChangeWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateOrderChangeWorkflowId, function (input) {
    const updatedOrderChange = (0, update_order_changes_1.updateOrderChangesStep)([input]);
    (0, workflows_sdk_1.when)("should-call-carry-over-promotion-workflow", input, ({ carry_over_promotions }) => typeof carry_over_promotions === "boolean").then(() => {
        return on_carry_promotions_flag_set_1.onCarryPromotionsFlagSet.runAsStep({
            input: {
                order_change_id: input.id,
                carry_over_promotions: input.carry_over_promotions,
            },
        });
    });
    return new workflows_sdk_1.WorkflowResponse((0, workflows_sdk_1.transform)({ updatedOrderChange }, ({ updatedOrderChange }) => updatedOrderChange?.[0]));
});
//# sourceMappingURL=update-order-change.js.map