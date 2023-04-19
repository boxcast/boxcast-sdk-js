declare global {
    interface Window {
        cast: any;
    }
}
import Html5VideoAnalytics from './html5';
export default class ChromecastAnalytics extends Html5VideoAnalytics {
    get framework(): any;
    attach(params: any): this;
    handleSegmentRequest(requestInfo: any): void;
    _wireEvents(): void;
    _handleChromecastError(event: any): void;
    _getCurrentTime(): any;
    _getCurrentLevelHeight(): any;
    _getDvrIsUse(): boolean;
}
