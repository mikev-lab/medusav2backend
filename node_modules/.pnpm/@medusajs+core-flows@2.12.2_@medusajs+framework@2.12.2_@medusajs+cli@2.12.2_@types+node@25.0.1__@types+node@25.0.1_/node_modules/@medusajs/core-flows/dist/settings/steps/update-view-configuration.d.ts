import { UpdateViewConfigurationDTO, ViewConfigurationDTO } from "@medusajs/framework/types";
export type UpdateViewConfigurationStepInput = {
    id: string;
    data: UpdateViewConfigurationDTO;
};
export declare const updateViewConfigurationStepId = "update-view-configuration";
/**
 * @since 2.10.3
 * @featureFlag view_configurations
 */
export declare const updateViewConfigurationStep: import("@medusajs/framework/workflows-sdk").StepFunction<UpdateViewConfigurationStepInput, ViewConfigurationDTO>;
//# sourceMappingURL=update-view-configuration.d.ts.map