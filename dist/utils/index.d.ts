import Clock from './clock';
export { Clock };
import MonotonicClock from './monotonic_clock';
export { MonotonicClock };
export declare function getStorage(): {
    getItem: (key: any) => any;
    setItem: (key: any, value: any) => void;
};
export declare function uuid(): string;
export declare function cleanQuotesFromViewerID(viewerId: any): any;
export declare function normalizeError(error: any, source: any): {
    message: string;
    code: string;
    data: Record<string, unknown>;
    source?: unknown;
};
export declare function normalizeAxiosError(error: any): any;
export declare function parseFetchedList(response: any): Promise<{
    pagination: {
        total: number;
        next: number;
        last: number;
    };
    data: {};
}>;
export declare function authHeaders(): {
    Authorization: string;
};
