export declare class BaseAuthenticatedRoute {
    #private;
    headers: any;
    get resourceBase(): string | void;
    constructor(fetch: any);
    list(params?: {}): Promise<{
        pagination: {
            total: number;
            next: number;
            last: number;
        };
        data: {};
    }>;
    get(id: any): Promise<any>;
    create(params?: {}): Promise<any>;
    update(id: any, params?: {}): Promise<any>;
    destroy(id: any): Promise<any>;
}
