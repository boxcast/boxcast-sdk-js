import { Main } from './main';

export default class BoxCastSDK extends Main {
  constructor() {
    super(require('node-fetch'));
  }
}
