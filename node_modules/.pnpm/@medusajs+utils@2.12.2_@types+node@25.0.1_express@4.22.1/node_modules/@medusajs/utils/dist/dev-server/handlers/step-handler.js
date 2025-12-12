"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepHandler = void 0;
class StepHandler {
    constructor(inverseRegistry) {
        this.inverseRegistry = inverseRegistry;
        this.type = "step";
    }
    validate(data) {
        if (!data.id) {
            throw new Error(`Step registration requires id. Received: ${JSON.stringify(data)}`);
        }
        if (!data.sourcePath && !data.workflowId) {
            throw new Error(`Step registration requires either sourcePath or workflowId. Received: ${JSON.stringify(data)}`);
        }
    }
    resolveSourcePath(data) {
        if (data.sourcePath) {
            return data.sourcePath;
        }
        // Look up workflow's source path
        const workflowKey = `workflow:${data.workflowId}`;
        const workflowSourcePaths = this.inverseRegistry.get(workflowKey);
        if (!workflowSourcePaths || workflowSourcePaths.length === 0) {
            throw new Error(`step workflow not found: ${data.workflowId} for step ${data.id}`);
        }
        return workflowSourcePaths[0];
    }
    createEntry(data) {
        return {
            id: data.id,
            workflowId: data.workflowId,
        };
    }
    getInverseKey(data) {
        return `${this.type}:${data.id}`;
    }
}
exports.StepHandler = StepHandler;
//# sourceMappingURL=step-handler.js.map