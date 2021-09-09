var html;
var options = { url: 'http://localhost/' };
var jsdom = require('jsdom-global')(html, options);

var mockStorage = {
  getItem: function (key) {
    return this[key];
  },
  setItem: function (key, value) {
    this[key] = value;
  }
};
global.localStorage = mockStorage;
global.sessionStorage = mockStorage;
