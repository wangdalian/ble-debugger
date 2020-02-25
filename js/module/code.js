import dbModule from './db.js';
import apiModule from './api.js';

const apiType = {
  SCAN: 'scan',
}

const codeType = {
  CURL: 'curl',
  NODEJS: 'nodejs'
};

const generater = {
  [apiType.SCAN]: {
    [codeType.CURL]: _genScanCodeCurl,
    [codeType.NODEJS]: _genScanCodeNodeJS,
  }
}

function _genScanCodeCurl() {
  const devConf = dbModule.getDevConf();
  let url = apiModule.getScanUrlByDevConf(devConf);
  return `
    curl -H "Accept: text/event-stream" '${url}'
  `;
}

function _genScanCodeNodeJS() {
  const devConf = dbModule.getDevConf();
  let url = apiModule.getScanUrlByDevConf(devConf);
  return `
    const EventSource = require('eventsource');

    const url = ${url};

    const sse = new EventSource(url);

    sse.onerror = function(error) {
      console.log('open scan sse failed:', error);
    };
    
    sse.onmessage = function(message) {
      console.log('recevied scan sse message:', message);
    };
  `;
}

function genCode(apiType, codeType) {
  return generater[apiType][codeType]();
}

export default {
  genCode,
}