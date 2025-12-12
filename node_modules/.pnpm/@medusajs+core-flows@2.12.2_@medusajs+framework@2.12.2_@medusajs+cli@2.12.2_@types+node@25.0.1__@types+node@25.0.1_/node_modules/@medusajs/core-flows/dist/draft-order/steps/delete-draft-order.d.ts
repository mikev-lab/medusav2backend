/**
 * The details of canceling the orders.
 */
export type DeleteDraftOrdersStepInput = {
    /**
     * The IDs of the orders to delete.
     */
    orderIds: string[];
};
export declare const deleteDraftOrdersStepId = "delete-draft-orders";
/**
 * This step deletes one or more draft orders.
 */
export declare const deleteDraftOrdersStep: import("@medusajs/framework/workflows-sdk").StepFunction<DeleteDraftOrdersStepInput, unknown>;
//# sourceMappingURL=delete-draft-order.d.ts.map