import { CreateViewConfigurationDTO, ViewConfigurationDTO } from "@medusajs/framework/types";
export type CreateViewConfigurationWorkflowInput = CreateViewConfigurationDTO & {
    set_active?: boolean;
};
export declare const createViewConfigurationWorkflowId = "create-view-configuration";
/**
 * @since 2.10.3
 * @featureFlag view_configurations
 */
export declare const createViewConfigurationWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<CreateViewConfigurationWorkflowInput, ViewConfigurationDTO, []>;
//# sourceMappingURL=create-view-configuration.d.ts.map