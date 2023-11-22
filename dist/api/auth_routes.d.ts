import AuthBroadcastRoutes from './auth_broadcast_routes';
import AuthChannelRoutes from './auth_channel_routes';
export default class AuthenticatedRoutes {
    #private;
    constructor(fetch: any);
    logout(): void;
    authenticate(clientId: any, clientSecret: any): Promise<any>;
    setToken(token: string): void;
    account(): Promise<any>;
    get token(): string;
    get broadcasts(): AuthBroadcastRoutes;
    get channels(): AuthChannelRoutes;
}
