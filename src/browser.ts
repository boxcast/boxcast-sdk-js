import { Main } from './main';

export default class BoxCastSDK extends Main {
  constructor() {
    super(window.fetch.bind(window));
  }
}
