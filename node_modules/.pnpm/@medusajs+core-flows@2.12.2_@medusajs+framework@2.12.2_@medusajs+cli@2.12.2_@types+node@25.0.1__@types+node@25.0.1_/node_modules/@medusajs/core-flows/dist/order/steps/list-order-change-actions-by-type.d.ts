import { ChangeActionType } from "@medusajs/framework/utils";
/**
 * This step lists order change actions filtered by action type.
 *
 * @since 2.12.0
 */
export declare const listOrderChangeActionsByTypeStep: import("@medusajs/framework/workflows-sdk").StepFunction<{
    order_change_id: string;
    action_type: ChangeActionType;
}, string[]>;
//# sourceMappingURL=list-order-change-actions-by-type.d.ts.map