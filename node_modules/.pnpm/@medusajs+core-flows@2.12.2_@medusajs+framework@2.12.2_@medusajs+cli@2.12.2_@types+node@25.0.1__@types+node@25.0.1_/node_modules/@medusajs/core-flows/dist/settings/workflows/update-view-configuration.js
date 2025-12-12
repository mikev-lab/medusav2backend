"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateViewConfigurationWorkflow = exports.updateViewConfigurationWorkflowId = void 0;
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
const steps_1 = require("../steps");
exports.updateViewConfigurationWorkflowId = "update-view-configuration";
/**
 * @since 2.10.3
 * @featureFlag view_configurations
 */
exports.updateViewConfigurationWorkflow = (0, workflows_sdk_1.createWorkflow)(exports.updateViewConfigurationWorkflowId, (input) => {
    const updateData = (0, workflows_sdk_1.transform)({ input }, ({ input }) => {
        const { id, set_active, ...data } = input;
        return data;
    });
    const viewConfig = (0, steps_1.updateViewConfigurationStep)({
        id: input.id,
        data: updateData,
    });
    (0, workflows_sdk_1.when)({ input, viewConfig }, ({ input, viewConfig }) => {
        return !!input.set_active && !!viewConfig.user_id;
    }).then(() => {
        (0, steps_1.setActiveViewConfigurationStep)({
            id: viewConfig.id,
            entity: viewConfig.entity,
            user_id: viewConfig.user_id,
        });
    });
    return new workflows_sdk_1.WorkflowResponse(viewConfig);
});
//# sourceMappingURL=update-view-configuration.js.map