import { MedusaContainer } from "@medusajs/framework/types";
import { Express } from "express";
export declare function expressLoader({ app, container, }: {
    app: Express;
    container: MedusaContainer;
}): Promise<{
    app: Express;
    shutdown: () => Promise<void>;
}>;
//# sourceMappingURL=express-loader.d.ts.map