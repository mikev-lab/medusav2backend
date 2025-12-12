import { ResourceEntry, ResourceMap, ResourcePath } from "./types";
export declare function getOrCreateRegistry(globalRegistry: Map<ResourcePath, ResourceMap>, sourcePath: string): ResourceMap;
export declare function addToRegistry(registry: ResourceMap, type: string, entry: ResourceEntry): void;
export declare function addToInverseRegistry(inverseRegistry: Map<string, string[]>, key: string, sourcePath: string): void;
//# sourceMappingURL=registry-helpers.d.ts.map