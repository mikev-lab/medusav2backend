import { MedusaContainer } from "@medusajs/types";
import { ResourceLoader } from "../utils/resource-loader";
import { SubscriberArgs, SubscriberConfig } from "./types";
type SubscriberHandler<T> = (args: SubscriberArgs<T>) => Promise<void>;
export declare class SubscriberLoader extends ResourceLoader {
    #private;
    protected resourceName: string;
    constructor(sourceDir: string | string[], options: Record<string, unknown> | undefined, container: MedusaContainer);
    protected onFileLoaded(path: string, fileExports: Record<string, unknown>): Promise<void>;
    private validateSubscriber;
    private inferIdentifier;
    createSubscriber<T = unknown>({ fileName, config, handler, }: {
        fileName: string;
        config: SubscriberConfig;
        handler: SubscriberHandler<T>;
    }): void;
    load(): Promise<string[]>;
}
export {};
//# sourceMappingURL=subscriber-loader.d.ts.map