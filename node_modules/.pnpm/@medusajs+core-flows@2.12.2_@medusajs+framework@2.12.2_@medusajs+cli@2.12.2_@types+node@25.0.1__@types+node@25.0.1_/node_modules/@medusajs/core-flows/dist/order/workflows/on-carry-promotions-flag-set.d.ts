import { OrderChangeDTO, OrderDTO, PromotionDTO } from "@medusajs/framework/types";
/**
 * The data to set the carry over promotions flag for an order change.
 */
export type OnCarryPromotionsFlagSetWorkflowInput = {
    /**
     * The order change's ID.
     */
    order_change_id: string;
    /**
     * Whether to carry over promotions to outbound exchange items.
     */
    carry_over_promotions: boolean;
};
/**
 * This step validates that the order change is an exchange and validates that
 * the promotion allocation is valid for carrying over promotions.
 *
 * :::note
 *
 * You can retrieve details of the order and order change using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query),
 * or [useQueryGraphStep](https://docs.medusajs.com/resources/references/medusa-workflows/steps/useQueryGraphStep).
 *
 * :::
 *
 * @since 2.12.0
 *
 * @example
 * const data = validateCarryPromotionsFlagStep({
 *   order: {
 *     id: "order_123",
 *     // other order details...
 *   },
 *   orderChange: {
 *     id: "orch_123",
 *     // other order change details...
 *   },
 *   input: {
 *     order_change_id: "orch_123",
 *     carry_over_promotions: true,
 *   }
 * })
 */
export declare const validateCarryPromotionsFlagStep: import("@medusajs/framework/workflows-sdk").StepFunction<{
    orderChange: OrderChangeDTO;
    order: OrderDTO & {
        promotions?: PromotionDTO[];
    };
    input: OnCarryPromotionsFlagSetWorkflowInput;
}, unknown>;
export declare const onCarryPromotionsFlagSetId = "on-carry-promotions-flag-set";
/**
 * This workflow toggles whether promotions are carried over to outbound items of an exchange.
 * It validates that the order change is an exchange and that it's active. It also validates that the promotion allocation
 * is valid for carrying over promotions. Finally, it computes adjustments for the order change
 * and either applies or removes promotion adjustments based on whether promotions are to be carried over.
 *
 * This workflow is used by other workflows, such as the {@link updateOrderChangeWorkflow}.
 *
 * You can use this workflow within your customizations or your own custom workflows, allowing you to
 * set the carry over promotions flag for an order change in your custom flows.
 *
 * @since 2.12.0
 *
 * @example
 * const { result } = await onCarryPromotionsFlagSet(container)
 * .run({
 *   input: {
 *     order_change_id: "orch_123",
 *     carry_over_promotions: true,
 *   }
 * })
 *
 * @summary
 *
 * Toggle carrying over promotions to outbound exchange items.
 */
export declare const onCarryPromotionsFlagSet: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<OnCarryPromotionsFlagSetWorkflowInput, void, []>;
//# sourceMappingURL=on-carry-promotions-flag-set.d.ts.map