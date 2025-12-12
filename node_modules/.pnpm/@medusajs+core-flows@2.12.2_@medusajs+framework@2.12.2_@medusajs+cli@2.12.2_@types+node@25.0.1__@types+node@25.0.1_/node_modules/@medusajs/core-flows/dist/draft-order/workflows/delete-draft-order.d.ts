/**
 * The data to validate the order's cancelation.
 */
export type DeleteDraftOrderStepInput = {
    /**
     * The order ids to delete.
     */
    order_ids: string[];
};
export declare const deleteDraftOrderWorkflowId = "delete-draft-order";
/**
 * This workflow deletes draft orders. It's used by the [Delete Draft Order API route](https://docs.medusajs.com/api/admin#draft-orders_deletedraftordersid).
 *
 * You can also use this workflow within your customizations or your own custom workflows, allowing you to wrap custom logic around deleting a draft order.
 *
 * @example
 * const { result } = await deleteDraftOrderWorkflow(container)
 * .run({
 *   input: {
 *     order_ids: ["order_123", "order_456"],
 *   }
 * })
 *
 * @summary
 *
 * Delete draft orders.
 */
export declare const deleteDraftOrdersWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<DeleteDraftOrderStepInput, undefined, []>;
//# sourceMappingURL=delete-draft-order.d.ts.map