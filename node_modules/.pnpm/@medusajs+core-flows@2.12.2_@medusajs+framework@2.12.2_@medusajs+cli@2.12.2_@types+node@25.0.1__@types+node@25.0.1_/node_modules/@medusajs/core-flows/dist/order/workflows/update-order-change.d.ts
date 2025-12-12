import { OrderChangeDTO, UpdateOrderChangeDTO } from "@medusajs/framework/types";
export declare const updateOrderChangeWorkflowId = "update-order-change-workflow";
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
export declare const updateOrderChangeWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UpdateOrderChangeDTO, OrderChangeDTO, []>;
//# sourceMappingURL=update-order-change.d.ts.map