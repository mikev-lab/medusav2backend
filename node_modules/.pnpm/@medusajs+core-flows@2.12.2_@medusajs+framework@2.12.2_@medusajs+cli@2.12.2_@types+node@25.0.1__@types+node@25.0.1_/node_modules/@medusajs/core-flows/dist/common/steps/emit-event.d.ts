import { StepExecutionContext } from "@medusajs/framework/workflows-sdk";
/**
 * The event's details.
 */
type Input = {
    /**
     * The event's name.
     */
    eventName: string;
    /**
     * Options to emit the event.
     */
    options?: Record<string, any>;
    /**
     * Metadata that the subscriber receives in the `metadata` property
     * of its first parameter.
     */
    metadata?: Record<string, any>;
    /**
     * The data payload that the subscriber receives in the `data` property
     * of its first parameter. Use this property to pass data relevant for the
     * subscriber, such as the ID of a created record.
     *
     * If you pass an array of objects, the event will be emitted once per each object in the array.
     */
    data: ((context: StepExecutionContext) => Promise<Record<any, any>>) | Record<any, any>;
};
export declare const emitEventStepId = "emit-event-step";
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
export declare const emitEventStep: import("@medusajs/framework/workflows-sdk").StepFunction<Input, {
    eventGroupId: string | undefined;
    eventName: string;
}>;
export {};
//# sourceMappingURL=emit-event.d.ts.map