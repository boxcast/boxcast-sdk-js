export default class Html5VideoAnalytics {
    constructor(state: any);
    attach(params: any): this;
    detach(): this;
    _wireEvents(v: any): {
        ended: () => void;
        error: () => void;
        pause: () => void;
        play: () => void;
        playing: () => void;
        resize: () => void;
        seeking: () => void;
        seeked: () => void;
        timeupdate: () => void;
        stalled: () => void;
        waiting: () => void;
    };
    _isActuallyPlaying(): boolean;
    _getCurrentTime(): any;
    _getCurrentLevelHeight(): any;
    _handleBufferingStart(): void;
    _handleNormalOperation(): void;
    _handleBufferingEnd(): void;
    _handlePlaybackError(error: any): void;
    _setup(): void;
    _reportTime(): void;
    _report(action: any, options: any): void;
    _dequeue(): Promise<void>;
}
