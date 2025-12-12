import { ResourceEntry, ResourceTypeHandler, SubscriberResourceData } from "../types";
export declare class SubscriberHandler implements ResourceTypeHandler<SubscriberResourceData> {
    readonly type = "subscriber";
    validate(data: SubscriberResourceData): void;
    resolveSourcePath(data: SubscriberResourceData): string;
    createEntry(data: SubscriberResourceData): ResourceEntry;
    getInverseKey(data: SubscriberResourceData): string;
}
//# sourceMappingURL=subscriber-handler.d.ts.map