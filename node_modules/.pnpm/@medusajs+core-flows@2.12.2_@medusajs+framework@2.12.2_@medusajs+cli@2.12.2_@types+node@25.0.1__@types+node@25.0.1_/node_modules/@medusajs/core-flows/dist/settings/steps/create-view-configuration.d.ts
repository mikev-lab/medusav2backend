import { CreateViewConfigurationDTO } from "@medusajs/framework/types";
export type CreateViewConfigurationStepInput = CreateViewConfigurationDTO;
export declare const createViewConfigurationStepId = "create-view-configuration";
/**
 * @since 2.10.3
 * @featureFlag view_configurations
 */
export declare const createViewConfigurationStep: import("@medusajs/framework/workflows-sdk").StepFunction<CreateViewConfigurationDTO, import("@medusajs/framework/types").ViewConfigurationDTO>;
//# sourceMappingURL=create-view-configuration.d.ts.map