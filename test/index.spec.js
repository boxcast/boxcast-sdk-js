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

describe('api', () => {
  it('should list account channels', (done) => {
    api.channels.list('DEMODEMO', {s: 'name', l: '2'}).then((r) => {
      expect(r.pagination).to.be.not.null;
      expect(r.pagination.next).to.equal(1);
      expect(r.data.length).to.equal(2);
    }).then(done).catch(done);
  });
  it('should list broadcasts in a public channel', (done) => {
    api.broadcasts.list('0xQfGiFHjz3YBfO3o1jd', {s: 'name', l: '5'}).then((r) => {
      expect(r.pagination).to.be.not.null;
      expect(r.pagination.next).to.equal(1);
      expect(r.data.length).to.equal(5);
    }).then(done).catch(done);
  });
  it('should get a single broadcast', (done) => {
    api.broadcasts.get('v81f5pzf7uc7btw7uo6p').then((b) => {
      expect(b.id).to.equal('v81f5pzf7uc7btw7uo6p');
      expect(b.timeframe).to.equal('past');
    }).then(done).catch(done);
  });
  it('should get a single broadcast view', (done) => {
    api.views.get('v81f5pzf7uc7btw7uo6p', {extended: true, host: 'example.com'}).then((v) => {
      expect(v.status).to.equal('recorded');
      expect(v.playlist).to.be.not.null;
    }).then(done).catch(done);
  });
});
