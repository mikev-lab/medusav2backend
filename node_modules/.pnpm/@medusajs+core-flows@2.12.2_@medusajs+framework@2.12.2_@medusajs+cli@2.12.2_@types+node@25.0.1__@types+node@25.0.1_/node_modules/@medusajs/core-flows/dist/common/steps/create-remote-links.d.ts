import type { LinkDefinition } from "@medusajs/framework/types";
export declare const createLinksStepId = "create-remote-links";
/**
 * This step creates links between two records of linked data models.
 *
 * Learn more in the [Link documentation.](https://docs.medusajs.com/learn/fundamentals/module-links/link#create-link).
 *
 * @example
 * createRemoteLinkStep([{
 *   [Modules.PRODUCT]: {
 *     product_id: "prod_123",
 *   },
 *   blog: {
 *     post_id: "post_123",
 *   },
 * }])
 */
export declare const createRemoteLinkStep: import("@medusajs/framework/workflows-sdk").StepFunction<LinkDefinition[], LinkDefinition[]>;
//# sourceMappingURL=create-remote-links.d.ts.map