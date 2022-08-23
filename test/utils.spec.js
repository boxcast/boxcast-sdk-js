//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

/* global describe, it, before */

import chai from 'chai';
import { cleanQuotesFromViewerID } from '../src/utils';

chai.expect();

const expect = chai.expect;

describe('utils', () => {
  it('should be able to strip quotes from json-encoded viewer id', () => {
    expect(cleanQuotesFromViewerID('')).to.equal('');
    expect(cleanQuotesFromViewerID('asdf')).to.equal('asdf');
    expect(cleanQuotesFromViewerID('"asdf"')).to.equal('asdf');
  });
});
