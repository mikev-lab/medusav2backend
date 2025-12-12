import type { GraphResultSet, MedusaContainer, RemoteJoinerOptions, RemoteQueryEntryPoints, RemoteQueryFunctionReturnPagination } from "../../types";
import type { MedusaRequest } from "../types";
export declare const refetchEntities: <TEntry extends string>({ entity, idOrFilter, scope, fields, pagination, withDeleted, options, }: {
    entity: TEntry;
    idOrFilter?: string | object;
    scope: MedusaContainer;
    fields?: string[];
    pagination?: MedusaRequest["queryConfig"]["pagination"];
    withDeleted?: boolean;
    options?: RemoteJoinerOptions;
}) => Promise<Omit<GraphResultSet<TEntry>, "metadata"> & {
    metadata: RemoteQueryFunctionReturnPagination;
}>;
export declare const refetchEntity: <TEntry extends string>({ entity, idOrFilter, scope, fields, options, }: {
    entity: TEntry & string;
    idOrFilter: string | object;
    scope: MedusaContainer;
    fields: string[];
    options?: RemoteJoinerOptions;
}) => Promise<TEntry extends keyof RemoteQueryEntryPoints ? RemoteQueryEntryPoints[TEntry] : any>;
//# sourceMappingURL=refetch-entities.d.ts.map