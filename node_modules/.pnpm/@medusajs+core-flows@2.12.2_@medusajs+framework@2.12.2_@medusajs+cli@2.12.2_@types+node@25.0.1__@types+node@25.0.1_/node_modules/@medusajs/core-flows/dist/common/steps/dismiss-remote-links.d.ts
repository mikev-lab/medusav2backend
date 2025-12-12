import type { LinkDefinition } from "@medusajs/framework/types";
export type DismissRemoteLinksStepInput = LinkDefinition | LinkDefinition[];
export declare const dismissRemoteLinkStepId = "dismiss-remote-links";
/**
 * This step removes links between two records of linked data models.
 *
 * Learn more in the [Link documentation.](https://docs.medusajs.com/learn/fundamentals/module-links/link#dismiss-link).
 *
 * @example
 * dismissRemoteLinkStep([{
 *   [Modules.PRODUCT]: {
 *     product_id: "prod_123",
 *   },
 *   blog: {
 *     post_id: "post_123",
 *   },
 * }])
 */
export declare const dismissRemoteLinkStep: import("@medusajs/framework/workflows-sdk").StepFunction<DismissRemoteLinksStepInput, LinkDefinition[]>;
//# sourceMappingURL=dismiss-remote-links.d.ts.map