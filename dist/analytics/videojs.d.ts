import Html5VideoAnalytics from './html5';
export default class VideoJsAnalytics extends Html5VideoAnalytics {
    attach(params: any): this;
    detach(): this;
    _wireEvents(v: any): {
        ended: () => void;
        error: (err: any) => void;
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
    _getCurrentTime(): any;
    _getCurrentLevelHeight(): any;
}
