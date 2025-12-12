import { ResourceEntry, ResourceTypeHandler, WorkflowResourceData } from "../types";
export declare class WorkflowHandler implements ResourceTypeHandler<WorkflowResourceData> {
    readonly type = "workflow";
    validate(data: WorkflowResourceData): void;
    resolveSourcePath(data: WorkflowResourceData): string;
    createEntry(data: WorkflowResourceData): ResourceEntry;
    getInverseKey(data: WorkflowResourceData): string;
}
//# sourceMappingURL=workflow-handler.d.ts.map