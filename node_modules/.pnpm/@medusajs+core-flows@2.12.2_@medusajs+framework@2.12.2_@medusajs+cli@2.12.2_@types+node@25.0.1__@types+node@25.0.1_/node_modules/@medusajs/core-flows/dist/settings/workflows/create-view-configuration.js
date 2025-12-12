"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createViewConfigurationWorkflow = exports.createViewConfigurationWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.createViewConfigurationWorkflowId = "create-view-configuration";
/**
 * @since 2.10.3
 * @featureFlag view_configurations
 */
exports.createViewConfigurationWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.createViewConfigurationWorkflowId, (input) => {
    const viewConfig = (0, steps_1.createViewConfigurationStep)(input);
    (0, workflows_sdk_1.when)({ input, viewConfig }, ({ input }) => {
        return !!input.set_active && !!input.user_id;
    }).then(() => {
        (0, steps_1.setActiveViewConfigurationStep)({
            id: viewConfig.id,
            entity: viewConfig.entity,
            user_id: input.user_id,
        });
    });
    return new workflows_sdk_1.WorkflowResponse(viewConfig);
});
//# sourceMappingURL=create-view-configuration.js.map