import { UpdateViewConfigurationDTO, ViewConfigurationDTO } from "@medusajs/framework/types";
export type UpdateViewConfigurationWorkflowInput = {
    id: string;
    set_active?: boolean;
} & UpdateViewConfigurationDTO;
export declare const updateViewConfigurationWorkflowId = "update-view-configuration";
/**
 * @since 2.10.3
 * @featureFlag view_configurations
 */
export declare const updateViewConfigurationWorkflow: import("@medusajs/framework/workflows-sdk").ReturnWorkflow<UpdateViewConfigurationWorkflowInput, ViewConfigurationDTO, []>;
//# sourceMappingURL=update-view-configuration.d.ts.map