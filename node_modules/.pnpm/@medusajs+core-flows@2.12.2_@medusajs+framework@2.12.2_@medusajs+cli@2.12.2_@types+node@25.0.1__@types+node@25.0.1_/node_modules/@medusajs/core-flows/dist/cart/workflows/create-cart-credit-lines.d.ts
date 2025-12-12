import { CartCreditLineDTO, CreateCartCreditLinesWorkflowInput } from "@medusajs/framework/types";
export declare const createCartCreditLinesWorkflowId = "create-cart-credit-lines";
/**
 * This workflow creates one or more credit lines for a cart.
 *
 * @example
 * const { result } = await createCartCreditLinesWorkflow(container)
 * .run({
 *   input: {
 *     cart_id: "cart_123",
 *     amount: 10,
 *     reference: "payment",
 *     reference_id: "payment_123",
 *     metadata: {
 *       key: "value",
 *     },
 *   }
 * })
 */
export declare const createCartCreditLinesWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateCartCreditLinesWorkflowInput, CartCreditLineDTO[], []>;
//# sourceMappingURL=create-cart-credit-lines.d.ts.map