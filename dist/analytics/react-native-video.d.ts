export default class ReactNativeVideoAnalytics {
    constructor(state: any);
    attach(params: any): Promise<this>;
    generateVideoEventProps(): {
        onBuffer: any;
        onError: any;
        onLoad: any;
        onProgress: any;
        onEnd: any;
        onPlaybackRateChange: any;
    };
    _onBuffer(evt: any): void;
    _onError(evt: any): void;
    _onLoad(evt: any): void;
    _onProgress(evt: any): void;
    _onEnd(evt: any): void;
    _onPlaybackRateChange(evt: any): void;
    _getCurrentTime(): any;
    _handleBufferingStart(): void;
    _handleBufferingEnd(): void;
    _handlePlaybackError(error: any): void;
    _initViewerID(): Promise<void>;
    _reportTime(): void;
    _report(action: any, options: any): void;
    _dequeue(): void;
}
