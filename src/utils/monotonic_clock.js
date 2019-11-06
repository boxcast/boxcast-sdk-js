//
// Copyright (c) BoxCast, Inc. and contributors. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.
//

import Clock from './clock';

var supportsPerformanceAPI = null;

export default class MonotonicClock {
  static now() {
    if (supportsPerformanceAPI === null) {
      // This code should only run on the first call to this function to evaluate whether or not the performance API is supported.
      supportsPerformanceAPI = !!(window.performance && window.performance.now);
      if (supportsPerformanceAPI) {
        // Test it out... let's make sure it doesn't explode
        try {
          window.performance.now();
        } catch (err) {
          console.warn('Error calling window.performance.now():', err);
          supportsPerformanceAPI = false;
        }
      }
      if (!supportsPerformanceAPI) {
        console.warn('Browser does not support performance API; MonotonicClock falling back to Clock');
      }
    }

    if (supportsPerformanceAPI) {
      return window.performance.now();
    } else {
      return Clock.now().getTime();
    }
  }
} 