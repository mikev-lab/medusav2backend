/**
 * The data to complete a cart after a payment is captured.
 */
export type CompleteCartAfterPaymentStepInput = {
    /**
     * The ID of the cart to complete.
     */
    cart_id: string;
};
export declare const completeCartAfterPaymentStepId = "complete-cart-after-payment-step";
/**
 * This step completes a cart after a payment is captured.
 */
export declare const completeCartAfterPaymentStep: import("@medusajs/framework/workflows-sdk").StepFunction<CompleteCartAfterPaymentStepInput, unknown>;
//# sourceMappingURL=complete-cart-after-payment.d.ts.map