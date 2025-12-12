import { JobResourceData, ResourceEntry, ResourceTypeHandler } from "../types";
export declare class JobHandler implements ResourceTypeHandler<JobResourceData> {
    readonly type = "job";
    validate(data: JobResourceData): void;
    resolveSourcePath(data: JobResourceData): string;
    createEntry(data: JobResourceData): ResourceEntry;
    getInverseKey(data: JobResourceData): string;
}
//# sourceMappingURL=job-handler.d.ts.map