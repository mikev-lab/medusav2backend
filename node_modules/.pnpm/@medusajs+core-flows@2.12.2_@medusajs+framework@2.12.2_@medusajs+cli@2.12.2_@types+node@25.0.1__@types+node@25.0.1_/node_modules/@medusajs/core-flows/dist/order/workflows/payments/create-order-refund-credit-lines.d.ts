import type { BigNumberInput, OrderDTO } from "@medusajs/framework/types";
/**
 * This step validates that an order refund credit line can be issued
 */
export declare const validateOrderRefundCreditLinesStep: import("@medusajs/framework/workflows-sdk").StepFunction<{
    order: OrderDTO;
}, unknown>;
export declare const createOrderRefundCreditLinesWorkflowId = "create-order-refund-credit-lines";
/**
 * This workflow creates an order refund credit line
 */
export declare const createOrderRefundCreditLinesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<{
    order_id: string;
    amount: BigNumberInput;
    reference?: string;
    referenceId?: string;
    created_by?: string;
}, unknown, any[]>;
//# sourceMappingURL=create-order-refund-credit-lines.d.ts.map