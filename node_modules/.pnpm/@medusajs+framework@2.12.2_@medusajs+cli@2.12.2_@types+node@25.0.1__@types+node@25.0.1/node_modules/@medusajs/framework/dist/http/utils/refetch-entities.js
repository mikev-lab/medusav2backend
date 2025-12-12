"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refetchEntity = exports.refetchEntities = void 0;
const utils_1 = require("../../utils");
const refetchEntities = async ({ entity, idOrFilter, scope, fields, pagination, withDeleted, options, }) => {
    const query = scope.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    let filters = (0, utils_1.isString)(idOrFilter) ? { id: idOrFilter } : idOrFilter;
    let context;
    if (filters && "context" in filters) {
        const { context: context_, ...rest } = filters;
        if (context_) {
            context = context_;
        }
        filters = rest;
    }
    const graphOptions = {
        entity,
        fields: fields ?? [],
        filters,
        pagination,
        withDeleted,
        context: context,
    };
    const result = await query.graph(graphOptions, options);
    return {
        data: result.data,
        metadata: result.metadata ?? {},
    };
};
exports.refetchEntities = refetchEntities;
const refetchEntity = async ({ entity, idOrFilter, scope, fields, options, }) => {
    const { data } = await (0, exports.refetchEntities)({
        entity,
        idOrFilter,
        scope,
        fields,
        options,
    });
    return Array.isArray(data) ? data[0] : data;
};
exports.refetchEntity = refetchEntity;
//# sourceMappingURL=refetch-entities.js.map