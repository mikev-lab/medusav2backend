export type SetActiveViewConfigurationStepInput = {
    id: string;
    entity: string;
    user_id: string;
};
export declare const setActiveViewConfigurationStepId = "set-active-view-configuration";
/**
 * @since 2.10.3
 * @featureFlag view_configurations
 */
export declare const setActiveViewConfigurationStep: import("@medusajs/framework/workflows-sdk").StepFunction<SetActiveViewConfigurationStepInput, string>;
//# sourceMappingURL=set-active-view-configuration.d.ts.map