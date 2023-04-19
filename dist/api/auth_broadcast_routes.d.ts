import { BaseAuthenticatedRoute } from './base_routes';
export default class AuthBroadcastRoutes extends BaseAuthenticatedRoute {
    #private;
    constructor(fetch: any);
    get resourceBase(): string;
}
