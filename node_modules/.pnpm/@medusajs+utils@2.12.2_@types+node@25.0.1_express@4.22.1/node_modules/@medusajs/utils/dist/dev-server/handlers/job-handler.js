"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobHandler = void 0;
class JobHandler {
    constructor() {
        this.type = "job";
    }
    validate(data) {
        if (!data.id) {
            throw new Error(`Job registration requires id. Received: ${JSON.stringify(data)}`);
        }
        if (!data.sourcePath) {
            throw new Error(`Job registration requires sourcePath. Received: ${JSON.stringify(data)}`);
        }
        if (!data.config?.name) {
            throw new Error(`Job registration requires config.name. Received: ${JSON.stringify(data)}`);
        }
    }
    resolveSourcePath(data) {
        return data.sourcePath;
    }
    createEntry(data) {
        return {
            id: data.id,
            config: data.config,
        };
    }
    getInverseKey(data) {
        return `${this.type}:${data.config?.name}`;
    }
}
exports.JobHandler = JobHandler;
//# sourceMappingURL=job-handler.js.map