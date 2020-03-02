import libEnum from '../lib/enum.js';
import dbModule from './db.js';
import apiModule from './api.js';

const generater = {
  [libEnum.apiType.SCAN]: {
    [libEnum.codeType.CURL]: _genScanCodeCurl,
    [libEnum.codeType.NODEJS]: _genScanCodeNodeJS,
  },
  [libEnum.apiType.CONNECT]: {
    [libEnum.codeType.CURL]: _genConnectCodeCurl,
    [libEnum.codeType.NODEJS]: _genConnectCodeNodeJS,
  },
  [libEnum.apiType.READ]: {
    [libEnum.codeType.CURL]: _genReadCodeCurl,
    [libEnum.codeType.NODEJS]: _genReadCodeNodeJS,
  },
  [libEnum.apiType.WRITE]: {
    [libEnum.codeType.CURL]: _genWriteCodeCurl,
    [libEnum.codeType.NODEJS]: _genWriteCodeNodeJS,
  },
  [libEnum.apiType.DISCONNECT]: {
    [libEnum.codeType.CURL]: _genDisconnectCodeCurl,
    [libEnum.codeType.NODEJS]: _genDisconnectCodeNodeJS,
  },
}

function _genDisconnectCodeCurl(apiParams) {
  const devConf = dbModule.getDevConf();
  let url = apiModule.getDisconnectUrlByDevConf(devConf, apiParams.deviceMac);
  return `
  curl --location --request DELETE '${url}'
  `;
}

function _genWriteCodeCurl(apiParams) {
  const devConf = dbModule.getDevConf();
  let url = apiModule.getWriteUrlByDevConf(devConf, apiParams.deviceMac, apiParams.handle, apiParams.value, apiParams.noresponse);
  return `
  curl --location --request GET '${url}'
  `;
}

function _genReadCodeCurl(apiParams) {
  const devConf = dbModule.getDevConf();
  let url = apiModule.getReadUrlByDevConf(devConf, apiParams.deviceMac, apiParams.handle);
  return `
  curl --location --request GET '${url}'
  `;
}

function _genConnectCodeCurl(apiParams) {
  const devConf = dbModule.getDevConf();
  let url = apiModule.getConnectUrlByDevConf(devConf, apiParams.deviceMac, apiParams.chip);
  return `
  curl --location --request POST '${url}' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "timeout": 5000,
    "type": "${apiParams.addrType}"
  }'
  `;
}

function _genScanCodeCurl(apiParams) {
  const devConf = dbModule.getDevConf();
  let _devConf = _.cloneDeep(devConf);
  _.forEach(apiParams, (v, k) => { // 更新为自定义的api参数配置
    if (v !== undefined && v !== null) _devConf[k] = v;
  });
  let url = apiModule.getScanUrlByDevConf(_devConf);

  return `
  curl -H "Accept: text/event-stream" '${url}'
  `;
}

function _genDisconnectCodeNodeJS(apiParams) {
  const devConf = dbModule.getDevConf();
  let url = apiModule.getConnectUrlByDevConf(devConf, apiParams.deviceMac);
  return `
  var request = require('request');
  var options = {
    'method': 'DELETE',
    'url': '${url}',
    'headers': {
    }
  };
  request(options, function (error, response) { 
    if (error) throw new Error(error);
    console.log(response.body);
  });
  `;
}

function _genConnectCodeNodeJS(apiParams) {
  const devConf = dbModule.getDevConf();
  let url = apiModule.getConnectUrlByDevConf(devConf, apiParams.deviceMac, apiParams.chip);
  return `
  var request = require('request');
  var options = {
    'method': 'POST',
    'url': '${url}',
    'headers': {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({"timeout":5000,"type":"${apiParams.addrType}"})

  };
  request(options, function (error, response) { 
    if (error) throw new Error(error);
    console.log(response.body);
  });
  `;
}

function _genWriteCodeNodeJS(apiParams) {
  const devConf = dbModule.getDevConf();
  let url = apiModule.getWriteUrlByDevConf(devConf, apiParams.deviceMac, apiParams.handle, apiParams.value, apiParams.noresponse);
  return `
  var request = require('request');
  var options = {
    'method': 'GET',
    'url': '${url}',
    'headers': {
    }
  };
  request(options, function (error, response) { 
    if (error) throw new Error(error);
    console.log(response.body);
  });
  `;
}

function _genReadCodeNodeJS(apiParams) {
  const devConf = dbModule.getDevConf();
  let url = apiModule.getConnectUrlByDevConf(devConf, apiParams.deviceMac);
  return `
  var request = require('request');
  var options = {
    'method': 'GET',
    'url': '${url}',
    'headers': {
    }
  };
  request(options, function (error, response) { 
    if (error) throw new Error(error);
    console.log(response.body);
  });
  `;
}

function _genScanCodeNodeJS(apiParams) {
  const devConf = dbModule.getDevConf();
  let _devConf = _.cloneDeep(devConf);
  _.forEach(apiParams, (v, k) => { // 更新为自定义的api参数配置
    if (v !== undefined && v !== null) _devConf[k] = v;
  });
  let url = apiModule.getScanUrlByDevConf(_devConf);

  return `
  const EventSource = require('eventsource');

  const url = '${url}';

  const sse = new EventSource(url);

  sse.onerror = function(error) {
    console.log('open scan sse failed:', error);
  };

  sse.onmessage = function(message) {
    console.log('recevied scan sse message:', message);
  };
  `;
}

function genCode(apiType, codeType, apiParams) {
  return generater[apiType][codeType](apiParams);
}

export default {
  genCode,
}