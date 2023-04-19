export default class BroadcastRoutes {
    #private;
    constructor(fetch: any);
    list(channelId: any, params?: {}): Promise<{
        pagination: {
            total: number;
            next: number;
            last: number;
        };
        data: {};
    }>;
    get(broadcastId: any): Promise<any>;
}
