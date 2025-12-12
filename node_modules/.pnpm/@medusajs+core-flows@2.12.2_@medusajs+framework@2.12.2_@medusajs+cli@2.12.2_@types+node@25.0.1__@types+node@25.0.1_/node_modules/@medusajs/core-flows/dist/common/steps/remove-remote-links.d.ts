import { DeleteEntityInput } from "@medusajs/framework/modules-sdk";
type RemoveRemoteLinksStepInput = DeleteEntityInput | DeleteEntityInput[];
export declare const removeRemoteLinkStepId = "remove-remote-links";
/**
 * This step deletes linked records of a record if cascade deletion is enabled.
 *
 * Learn more in the [Link documentation](https://docs.medusajs.com/learn/fundamentals/module-links/link#cascade-delete-linked-records)
 *
 * @example
 * removeRemoteLinkStep([{
 *   [Modules.PRODUCT]: {
 *     product_id: "prod_123",
 *   },
 * }])
 */
export declare const removeRemoteLinkStep: import("@medusajs/framework/workflows-sdk").StepFunction<RemoveRemoteLinksStepInput, DeleteEntityInput | undefined>;
export {};
//# sourceMappingURL=remove-remote-links.d.ts.map