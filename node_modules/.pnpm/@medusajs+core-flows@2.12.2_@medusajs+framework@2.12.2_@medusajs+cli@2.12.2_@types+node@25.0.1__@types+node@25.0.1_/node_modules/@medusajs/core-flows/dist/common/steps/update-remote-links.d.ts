import type { LinkDefinition } from "@medusajs/framework/types";
export declare const updateRemoteLinksStepId = "update-remote-links-step";
/**
 * This step updates links between two records of linked data models. This is useful to update
 * links with additional data such as metadata.
 *
 * Learn more in the [Link documentation.](https://docs.medusajs.com/learn/fundamentals/module-links/link#update-links).
 *
 * @example
 * const data = updateRemoteLinksStep([
 *   {
 *     [Modules.PRODUCT]: {
 *       product_id: "prod_321",
 *     },
 *     blog: {
 *       post_id: "post_321",
 *     },
 *     data: {
 *       metadata: {
 *         test: false
 *       }
 *     }
 *   }
 * ])
 */
export declare const updateRemoteLinksStep: import("@medusajs/framework/workflows-sdk").StepFunction<LinkDefinition[], LinkDefinition[]>;
//# sourceMappingURL=update-remote-links.d.ts.map