"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriberHandler = void 0;
class SubscriberHandler {
    constructor() {
        this.type = "subscriber";
    }
    validate(data) {
        if (!data.id) {
            throw new Error(`Subscriber registration requires id. Received: ${JSON.stringify(data)}`);
        }
        if (!data.sourcePath) {
            throw new Error(`Subscriber registration requires sourcePath. Received: ${JSON.stringify(data)}`);
        }
        if (!data.subscriberId) {
            throw new Error(`Subscriber registration requires subscriberId. Received: ${JSON.stringify(data)}`);
        }
        if (!data.events) {
            throw new Error(`Subscriber registration requires events. Received: ${JSON.stringify(data)}`);
        }
        if (!Array.isArray(data.events)) {
            throw new Error(`Subscriber registration requires events to be an array. Received: ${JSON.stringify(data)}`);
        }
    }
    resolveSourcePath(data) {
        return data.sourcePath;
    }
    createEntry(data) {
        return {
            id: data.id,
            subscriberId: data.subscriberId,
            events: data.events,
        };
    }
    getInverseKey(data) {
        return `${this.type}:${data.subscriberId}`;
    }
}
exports.SubscriberHandler = SubscriberHandler;
//# sourceMappingURL=subscriber-handler.js.map