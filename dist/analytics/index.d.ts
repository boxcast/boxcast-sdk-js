import Html5VideoAnalytics from './html5';
import VideoJsAnalytics from './videojs';
import ChromecastAnalytics from './chromecast';
import ReactNativeVideoAnalytics from './react-native-video';
export declare class analytics {
    #private;
    constructor(fetch: any);
    configure: (params: any) => this;
    getState: () => {
        host: string;
        os: any;
        browser_name: any;
        browser_version: any;
        player_version: string;
    };
    mode: (mode: any) => Html5VideoAnalytics | VideoJsAnalytics | ChromecastAnalytics | ReactNativeVideoAnalytics;
}
export default analytics;
