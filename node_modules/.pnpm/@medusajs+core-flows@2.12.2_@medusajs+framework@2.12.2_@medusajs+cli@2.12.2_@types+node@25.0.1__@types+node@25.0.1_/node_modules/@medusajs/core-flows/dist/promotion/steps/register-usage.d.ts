import { CampaignBudgetUsageContext, UsageComputedActions } from "@medusajs/framework/types";
export declare const registerUsageStepId = "register-usage";
type RegisterUsageStepInput = {
    computedActions: UsageComputedActions[];
    registrationContext: CampaignBudgetUsageContext;
};
/**
 * This step registers usage for a promotion.
 */
export declare const registerUsageStep: import("@medusajs/framework/workflows-sdk").StepFunction<RegisterUsageStepInput, null>;
export {};
//# sourceMappingURL=register-usage.d.ts.map