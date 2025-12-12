import { RequestHandler } from "express";
import type { Secret, SignOptions, VerifyOptions } from "jsonwebtoken";
import { AuthContext } from "../types";
declare const SESSION_AUTH = "session";
declare const BEARER_AUTH = "bearer";
declare const API_KEY_AUTH = "api-key";
export type AuthType = typeof SESSION_AUTH | typeof BEARER_AUTH | typeof API_KEY_AUTH;
export declare const authenticate: (actorType: string | string[], authType: AuthType | AuthType[], options?: {
    allowUnauthenticated?: boolean;
    allowUnregistered?: boolean;
}) => RequestHandler;
export declare const getAuthContextFromJwtToken: (authHeader: string | undefined, jwtSecret: Secret, authTypes: AuthType[], actorTypes: string[], jwtPublicKey?: Secret, jwtOptions?: VerifyOptions | SignOptions) => AuthContext | null;
export {};
//# sourceMappingURL=authenticate-middleware.d.ts.map