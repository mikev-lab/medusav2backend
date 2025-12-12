import { WorkflowData } from "@medusajs/framework/workflows-sdk";
/**
 * The data to complete a cart and place an order.
 */
export type CompleteCartWorkflowInput = {
    /**
     * The ID of the cart to complete.
     */
    id: string;
};
export type CompleteCartWorkflowOutput = {
    /**
     * The ID of the order that was created.
     */
    id: string;
};
export declare const completeCartWorkflowId = "complete-cart";
/**
 * This workflow completes a cart and places an order for the customer. It's executed by the
 * [Complete Cart Store API Route](https://docs.medusajs.com/api/store#carts_postcartsidcomplete).
 *
 * You can use this workflow within your own customizations or custom workflows, allowing you to wrap custom logic around completing a cart.
 * For example, in the [Subscriptions recipe](https://docs.medusajs.com/resources/recipes/subscriptions/examples/standard#create-workflow),
 * this workflow is used within another workflow that creates a subscription order.
 *
 * ## Cart Completion Idempotency
 *
 * This workflow's logic is idempotent, meaning that if it is executed multiple times with the same input, it will not create duplicate orders. The
 * same order will be returned for subsequent executions with the same cart ID. This is necessary to avoid rolling back payments or causing
 * other side effects if the workflow is retried or fails due to transient errors.
 *
 * So, if you use this workflow within your own, make sure your workflow's steps are idempotent as well to avoid unintended side effects.
 * Your workflow must also acquire and release locks around this workflow to prevent concurrent executions for the same cart.
 *
 * The following sections cover some common scenarios and how to handle them.
 *
 * ### Creating Links and Linked Records
 *
 * In some cases, you might want to create custom links or linked records to the order. For example, you might want to create a link from the order to a
 * digital order.
 *
 * In such cases, ensure that your workflow's logic checks for existing links or records before creating new ones. You can query the
 * [entry point of the link](https://docs.medusajs.com/learn/fundamentals/module-links/custom-columns#method-2-using-entry-point)
 * to check for existing links before creating new ones.
 *
 * For example:
 *
 * ```ts
 * import {
 *   createWorkflow,
 *   when,
 *   WorkflowResponse
 * } from "@medusajs/framework/workflows-sdk"
 * import {
 *   useQueryGraphStep,
 *   completeCartWorkflow,
 *   acquireLockStep,
 *   releaseLockStep
 * } from "@medusajs/framework/workflows-sdk"
 * import digitalProductOrderOrderLink from "../../links/digital-product-order"
 *
 * type WorkflowInput = {
 *   cart_id: string
 * }
 *
 * const createDigitalProductOrderWorkflow = createWorkflow(
 *   "create-digital-product-order",
 *   (input: WorkflowInput) => {
 *     acquireLockStep({
 *       key: input.cart_id,
 *       timeout: 30,
 *       ttl: 120,
 *     });
 *     const { id } = completeCartWorkflow.runAsStep({
 *       input: {
 *         id: input.cart_id
 *       }
 *     })
 *
 *     const { data: existingLinks } = useQueryGraphStep({
 *       entity: digitalProductOrderOrderLink.entryPoint,
 *       fields: ["digital_product_order.id"],
 *       filters: { order_id: id },
 *     }).config({ name: "retrieve-existing-links" });
 *
 *
 *     const digital_product_order = when(
 *       "create-digital-product-order-condition",
 *       { existingLinks },
 *       (data) => {
 *         return (
 *           data.existingLinks.length === 0
 *         );
 *       }
 *     )
 *     .then(() => {
 *       // create digital product order logic...
 *     })
 *
 *     // other workflow logic...
 *
 *     releaseLockStep({
 *       key: input.cart_id,
 *     })
 *
 *     return new WorkflowResponse({
 *       // workflow output...
 *     })
 *   }
 * )
 * ```
 *
 * ### Custom Validation with Conflicts
 *
 * Some use cases require custom validation that may cause conflicts on subsequent executions of the workflow.
 * For example, if you're selling tickets to an event, you might want to validate that the tickets are available
 * on selected dates.
 *
 * In this scenario, if the workflow is retried after the first execution, the validation
 * will fail since the tickets would have already been reserved in the first execution. This makes the cart
 * completion non-idempotent.
 *
 * To handle these cases, you can create a step that throws an error if the validation fails. Then, in the compensation function,
 * you can cancel the order if the validation fails. For example:
 *
 * ```ts
 * import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
 * import { MedusaError } from "@medusajs/framework/utils"
 * import { cancelOrderWorkflow } from "@medusajs/medusa/core-flows"
 *
 * type StepInput = {
 *   order_id: string
 *   // other input fields...
 * }
 *
 * export const customCartValidationStep = createStep(
 *   "custom-cart-validation",
 *   async (input, { container }) => {
 *     const isValid = true // replace with actual validation logic
 *
 *     if (!isValid) {
 *       throw new MedusaError(
 *         MedusaError.Types.INVALID_DATA,
 *         "Custom cart validation failed"
 *       )
 *     }
 *
 *     return new StepResponse(void 0, input.order_id)
 *   },
 *   async (order_id, { container, context }) => {
 *     if (!order_id) return
 *
 *     cancelOrderWorkflow(container).run({
 *       input: {
 *         id: order_id,
 *       },
 *       context,
 *       container
 *     })
 *   }
 * )
 * ```
 *
 * Then, in your custom workflow, only run the validation step if the order is being created for the first time. For example,
 * only run the validation if the link from the order to your custom data does not exist yet:
 *
 * ```ts
 * import {
 *   createWorkflow,
 *   when,
 *   WorkflowResponse
 * } from "@medusajs/framework/workflows-sdk"
 * import { useQueryGraphStep } from "@medusajs/framework/workflows-sdk"
 * import ticketOrderLink from "../../links/ticket-order"
 *
 * type WorkflowInput = {
 *   cart_id: string
 * }
 *
 * const createTicketOrderWorkflow = createWorkflow(
 *   "create-ticket-order",
 *   (input: WorkflowInput) => {
 *     acquireLockStep({
 *       key: input.cart_id,
 *       timeout: 30,
 *       ttl: 120,
 *     });
 *     const { id } = completeCartWorkflow.runAsStep({
 *       input: {
 *         id: input.cart_id
 *       }
 *     })
 *
 *     const { data: existingLinks } = useQueryGraphStep({
 *       entity: ticketOrderLink.entryPoint,
 *       fields: ["ticket.id"],
 *       filters: { order_id: id },
 *     }).config({ name: "retrieve-existing-links" });
 *
 *
 *     const ticket_order = when(
 *       "create-ticket-order-condition",
 *       { existingLinks },
 *       (data) => {
 *         return (
 *           data.existingLinks.length === 0
 *         );
 *       }
 *     )
 *     .then(() => {
 *       customCartValidationStep({ order_id: id })
 *       // create ticket order logic...
 *     })
 *
 *     // other workflow logic...
 *
 *     releaseLockStep({
 *       key: input.cart_id,
 *     })
 *
 *     return new WorkflowResponse({
 *       // workflow output...
 *     })
 *   }
 * )
 * ```
 *
 * The first time this workflow is executed for a cart, the validation step will run and validate the cart. If the validation fails,
 * the order will be canceled in the compensation function.
 *
 * If the validation is successful and the workflow is retried, the validation step will be skipped since the link from the order to the
 * ticket order already exists. This ensures that the workflow remains idempotent.
 *
 * @example
 * const { result } = await completeCartWorkflow(container)
 * .run({
 *   input: {
 *     id: "cart_123"
 *   }
 * })
 *
 * @summary
 *
 * Complete a cart and place an order.
 *
 * @property hooks.validate - This hook is executed before all operations. You can consume this hook to perform any custom validation. If validation fails, you can throw an error to stop the workflow execution.
 */
export declare const completeCartWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CompleteCartWorkflowInput, CompleteCartWorkflowOutput, [import("@medusajs/framework/workflows-sdk").Hook<"validate", {
    input: WorkflowData<CompleteCartWorkflowInput>;
    cart: any;
}, unknown>]>;
//# sourceMappingURL=complete-cart.d.ts.map