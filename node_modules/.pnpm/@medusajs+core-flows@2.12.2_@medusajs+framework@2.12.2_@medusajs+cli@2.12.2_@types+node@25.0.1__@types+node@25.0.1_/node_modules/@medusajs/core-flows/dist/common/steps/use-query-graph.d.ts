import { GraphResultSet, RemoteJoinerOptions, RemoteQueryInput } from "@medusajs/framework/types";
import { StepFunction } from "@medusajs/workflows-sdk";
export type UseQueryGraphStepInput<TEntry extends string, TIsList extends boolean = boolean> = RemoteQueryInput<TEntry> & {
    options?: RemoteJoinerOptions & {
        isList?: TIsList;
    };
};
export type UseQueryGraphStepOutput<TEntry extends string, TIsList extends boolean = boolean> = ReturnType<StepFunction<any, true extends TIsList ? GraphResultSet<TEntry> : Omit<GraphResultSet<TEntry>, "data"> & {
    data: GraphResultSet<TEntry>["data"][number];
}>>;
/**
 * This step fetches data across modules using the Query.
 *
 * Learn more in the [Query documentation](https://docs.medusajs.com/learn/fundamentals/module-links/query).
 *
 * @example
 * To retrieve a list of records of a data model:
 *
 * ```ts
 * const { data: products } = useQueryGraphStep({
 *   entity: "product",
 *   fields: [
 *     "*",
 *     "variants.*"
 *   ]
 * })
 * ```
 *
 * To retrieve a single item instead of a an array:
 *
 * ```ts
 * const { data: products } = useQueryGraphStep({
 *   entity: "product",
 *   fields: [
 *     "*",
 *     "variants.*"
 *   ],
 *   filters: {
 *     id: "123"
 *   }
 * })
 * ```
 *
 * To throw an error if a record isn't found matching the specified ID:
 *
 * ```ts
 * const { data: products } = useQueryGraphStep({
 *   entity: "product",
 *   fields: [
 *     "*",
 *     "variants.*"
 *   ],
 *   filters: {
 *     id: "123"
 *   },
 *   options: {
 *     throwIfKeyNotFound: true
 *   }
 * })
 * ```
 *
 * To set pagination configurations:
 *
 * ```ts
 * const { data: products } = useQueryGraphStep({
 *   entity: "product",
 *   fields: [
 *     "*",
 *     "variants.*"
 *   ],
 *   filters: {
 *     id: "123"
 *   },
 *   pagination: {
 *     take: 10,
 *     skip: 10,
 *     order: {
 *       created_at: "DESC"
 *     }
 *   }
 * })
 * ```
 */
export declare const useQueryGraphStep: <const TEntry extends string, const TIsList extends boolean = boolean>(input: UseQueryGraphStepInput<TEntry, TIsList>) => UseQueryGraphStepOutput<TEntry, TIsList>;
//# sourceMappingURL=use-query-graph.d.ts.map