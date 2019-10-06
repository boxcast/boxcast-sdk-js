//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

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
