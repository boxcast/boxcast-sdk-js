import { BaseAuthenticatedRoute } from './base_routes';
export default class AuthChannelRoutes extends BaseAuthenticatedRoute {
    #private;
    constructor(fetch: any);
    get resourceBase(): string;
}
