export default class ChannelRoutes {
    #private;
    constructor(fetch: any);
    list(accountId: any, params?: {}): Promise<{
        pagination: {
            total: number;
            next: number;
            last: number;
        };
        data: {};
    }>;
}
