"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrCreateRegistry = getOrCreateRegistry;
exports.addToRegistry = addToRegistry;
exports.addToInverseRegistry = addToInverseRegistry;
function getOrCreateRegistry(globalRegistry, sourcePath) {
    let registry = globalRegistry.get(sourcePath);
    if (!registry) {
        registry = new Map();
        globalRegistry.set(sourcePath, registry);
    }
    return registry;
}
function addToRegistry(registry, type, entry) {
    const entries = registry.get(type) || [];
    registry.set(type, [...entries, entry]);
}
function addToInverseRegistry(inverseRegistry, key, sourcePath) {
    const existing = inverseRegistry.get(key) || [];
    const updated = Array.from(new Set([...existing, sourcePath]));
    inverseRegistry.set(key, updated);
}
//# sourceMappingURL=registry-helpers.js.map