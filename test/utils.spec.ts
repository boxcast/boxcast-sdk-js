//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

/* global describe, it, before */

import { cleanQuotesFromViewerID } from '../src/utils';

describe('utils', () => {
  it('should be able to strip quotes from json-encoded viewer id', () => {
    expect(cleanQuotesFromViewerID('')).toBe('');
    expect(cleanQuotesFromViewerID('asdf')).toBe('asdf');
    expect(cleanQuotesFromViewerID('"asdf"')).toBe('asdf');
  });
});
