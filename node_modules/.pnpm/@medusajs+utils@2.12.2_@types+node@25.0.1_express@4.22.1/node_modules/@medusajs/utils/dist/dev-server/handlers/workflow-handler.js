"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowHandler = void 0;
class WorkflowHandler {
    constructor() {
        this.type = "workflow";
    }
    validate(data) {
        if (!data.sourcePath) {
            throw new Error(`Workflow registration requires sourcePath. Received: ${JSON.stringify(data)}`);
        }
        if (!data.id) {
            throw new Error(`Workflow registration requires id. Received: ${JSON.stringify(data)}`);
        }
    }
    resolveSourcePath(data) {
        return data.sourcePath;
    }
    createEntry(data) {
        return {
            id: data.id,
            workflowId: data.id,
        };
    }
    getInverseKey(data) {
        return `${this.type}:${data.id}`;
    }
}
exports.WorkflowHandler = WorkflowHandler;
//# sourceMappingURL=workflow-handler.js.map