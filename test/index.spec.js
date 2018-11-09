/* global describe, it, before */

import chai from 'chai';
import { api, analytics } from '../lib/boxcast-sdk.js';

chai.expect();

const expect = chai.expect;

describe('BoxCast SDK Global Exports', () => {
  it('should export api', () => {
    expect(api).to.be.not.null;
  });
  it('should export analytics', () => {
    expect(analytics).to.be.not.null;
  });
});
