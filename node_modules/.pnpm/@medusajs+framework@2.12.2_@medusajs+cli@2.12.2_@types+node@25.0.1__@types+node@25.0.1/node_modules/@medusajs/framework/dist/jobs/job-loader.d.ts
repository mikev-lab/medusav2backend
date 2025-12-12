import type { SchedulerOptions } from "@medusajs/orchestration";
import { MedusaContainer } from "@medusajs/types";
import { ResourceLoader } from "../utils/resource-loader";
type CronJobConfig = {
    name: string;
    schedule: string | SchedulerOptions;
    numberOfExecutions?: SchedulerOptions["numberOfExecutions"];
};
type CronJobHandler = (container: MedusaContainer) => Promise<any>;
export declare class JobLoader extends ResourceLoader {
    protected resourceName: string;
    constructor(sourceDir: string | string[], container: MedusaContainer);
    loadFile(path: string): Promise<void>;
    protected onFileLoaded(path: string, fileExports: {
        default: CronJobHandler;
        config: CronJobConfig;
    }): Promise<void>;
    /**
     * Validate cron job configuration
     * @param config
     * @protected
     */
    protected validateConfig(config: {
        schedule: string | SchedulerOptions;
        name: string;
    }): void;
    /**
     * Create a workflow to register a new cron job
     * @param config
     * @param handler
     * @protected
     */
    protected register({ path, config, handler, }: {
        path: string;
        config: CronJobConfig;
        handler: CronJobHandler;
    }): void;
    /**
     * Load cron jobs from one or multiple source paths
     */
    load(): Promise<void>;
}
export {};
//# sourceMappingURL=job-loader.d.ts.map