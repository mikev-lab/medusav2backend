"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pgConnectionLoader = pgConnectionLoader;
const utils_1 = require("@medusajs/utils");
const awilix_1 = require("../deps/awilix");
const config_1 = require("../config");
const container_1 = require("../container");
const logger_1 = require("../logger");
/**
 * Initialize a knex connection that can then be shared to any resources if needed
 */
async function pgConnectionLoader() {
    if (container_1.container.hasRegistration(utils_1.ContainerRegistrationKeys.PG_CONNECTION)) {
        return container_1.container.resolve(utils_1.ContainerRegistrationKeys.PG_CONNECTION);
    }
    const configModule = config_1.configManager.config;
    // Share a knex connection to be consumed by the shared modules
    const connectionString = configModule.projectConfig.databaseUrl;
    const driverOptions = {
        ...(configModule.projectConfig.databaseDriverOptions || {}),
    };
    const schema = configModule.projectConfig.databaseSchema || "public";
    const idleTimeoutMillis = driverOptions.pool?.idleTimeoutMillis ?? undefined; // prevent null to be passed
    const poolMin = driverOptions.pool?.min ?? 2;
    const poolMax = driverOptions.pool?.max;
    const reapIntervalMillis = driverOptions.pool?.reapIntervalMillis ?? undefined;
    const createRetryIntervalMillis = driverOptions.pool?.createRetryIntervalMillis ?? undefined;
    delete driverOptions.pool;
    const clientUrl = connectionString?.replace(/(\?|&)ssl_mode=[^&]*(&|$)/gi, (match, prefix, suffix) => {
        if (prefix === "?" && suffix === "&")
            return "?";
        if (prefix === "?" && suffix === "")
            return "";
        if (prefix === "&")
            return suffix;
        return "";
    });
    const pgConnection = utils_1.ModulesSdkUtils.createPgConnection({
        clientUrl,
        schema,
        driverOptions,
        pool: {
            min: poolMin,
            max: poolMax,
            idleTimeoutMillis,
            reapIntervalMillis,
            createRetryIntervalMillis,
        },
    });
    const maxRetries = process.env.__MEDUSA_DB_CONNECTION_MAX_RETRIES
        ? parseInt(process.env.__MEDUSA_DB_CONNECTION_MAX_RETRIES)
        : 5;
    const retryDelay = process.env.__MEDUSA_DB_CONNECTION_RETRY_DELAY
        ? parseInt(process.env.__MEDUSA_DB_CONNECTION_RETRY_DELAY)
        : 1000;
    await (0, utils_1.retryExecution)(async () => {
        await pgConnection.raw("SELECT 1");
    }, {
        maxRetries,
        retryDelay,
        onRetry: (error) => {
            logger_1.logger.warn(`Pg connection failed to connect to the database. Retrying...\n${(0, utils_1.stringifyCircular)(error)}`);
        },
    });
    container_1.container.register(utils_1.ContainerRegistrationKeys.PG_CONNECTION, (0, awilix_1.asValue)(pgConnection));
    return pgConnection;
}
//# sourceMappingURL=pg-connection-loader.js.map