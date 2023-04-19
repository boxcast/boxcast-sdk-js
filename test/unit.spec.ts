//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//
import BoxCastSDK from '../dist/node';

const instance = new BoxCastSDK();
const {api, analytics} = instance;

describe('BoxCast SDK', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    // *
    it('It should instantiate the object', async () => {
      expect(instance).toBeDefined();
    });

  });

  describe('Global Exports', () => {
    it('should export api', () => {
      expect(api).toBeDefined();
    });
    it('should export analytics', () => {
      expect(analytics).toBeDefined();
    });
  });
});
