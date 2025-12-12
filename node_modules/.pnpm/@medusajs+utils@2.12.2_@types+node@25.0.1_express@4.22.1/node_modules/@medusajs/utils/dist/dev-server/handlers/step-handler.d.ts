import { ResourceEntry, ResourceTypeHandler, StepResourceData } from "../types";
export declare class StepHandler implements ResourceTypeHandler<StepResourceData> {
    private inverseRegistry;
    readonly type = "step";
    constructor(inverseRegistry: Map<string, string[]>);
    validate(data: StepResourceData): void;
    resolveSourcePath(data: StepResourceData): string;
    createEntry(data: StepResourceData): ResourceEntry;
    getInverseKey(data: StepResourceData): string;
}
//# sourceMappingURL=step-handler.d.ts.map