"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitEventStep = exports.emitEventStepId = void 0;
const utils_1 = require("@medusajs/framework/utils");
const workflows_sdk_1 = require("@medusajs/framework/workflows-sdk");
exports.emitEventStepId = "emit-event-step";
/**
 * This step emits an event, which you can listen to in a [subscriber](https://docs.medusajs.com/learn/fundamentals/events-and-subscribers). You can pass data to the
 * subscriber by including it in the `data` property.
 *
 * The event is only emitted after the workflow has finished successfully. So, even if it's executed in the middle of the workflow, it won't actually emit the event until the workflow has completed successfully.
 * If the workflow fails, it won't emit the event at all.
 *
 * @example
 * To emit a single event with a data payload:
 *
 * ```ts
 * emitEventStep({
 *   eventName: "custom.created",
 *   data: {
 *     id: "123"
 *   }
 * })
 * ```
 *
 * To emit an event multiple times with different data payloads, pass an array of objects to the `data` property:
 *
 * ```ts
 * emitEventStep({
 *   eventName: "custom.created",
 *   data: [
 *     // emit will be emitted three times, once per each object in the array
 *     { id: "123" },
 *     { id: "456" },
 *     { id: "789" }
 *   ]
 * })
 * ```
 */
exports.emitEventStep = (0, workflows_sdk_1.createStep)(exports.emitEventStepId, async (input, context) => {
    if (!input?.data) {
        return;
    }
    const { container } = context;
    const eventBus = container.resolve(utils_1.Modules.EVENT_BUS);
    const data_ = typeof input.data === "function" ? await input.data(context) : input.data;
    const metadata = {
        ...input.metadata,
    };
    if (context.eventGroupId) {
        metadata.eventGroupId = context.eventGroupId;
    }
    const dataArray = Array.isArray(data_) ? data_ : [data_];
    const message = dataArray.map((dt) => ({
        name: input.eventName,
        data: dt,
        options: input.options,
        metadata,
    }));
    if (!message.length) {
        return;
    }
    await eventBus.emit(message);
    return new workflows_sdk_1.StepResponse({
        eventGroupId: context.eventGroupId,
        eventName: input.eventName,
    });
}, async (data, context) => {
    if (!data || !data?.eventGroupId) {
        return;
    }
    const { container } = context;
    const eventBus = container.resolve(utils_1.Modules.EVENT_BUS);
    await eventBus.clearGroupedEvents(data.eventGroupId, {
        eventNames: [data.eventName],
    });
});
//# sourceMappingURL=emit-event.js.map