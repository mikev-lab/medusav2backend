import type { ListShippingOptionsForOrderWorkflowInput } from "@medusajs/framework/types";
export declare const listShippingOptionsForOrderWorkflowId = "list-shipping-options-for-order";
/**
 * This workflow lists the shipping options of an order. It's executed by the
 * [List Shipping Options Store API Route](https://docs.medusajs.com/api/store#orders_getidshippingoptions).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to wrap custom logic around to retrieve the shipping options of an order
 * in your custom flows.
 *
 * @since 2.10.0
 *
 * @example
 * const { result } = await listShippingOptionsForOrderWorkflow(container)
 * .run({
 *   input: {
 *     order_id: "order_123",
 *   }
 * })
 *
 * @summary
 *
 * List a order's shipping options.
 *
 */
export declare const listShippingOptionsForOrderWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<ListShippingOptionsForOrderWorkflowInput, any[], []>;
//# sourceMappingURL=list-shipping-options-for-order.d.ts.map