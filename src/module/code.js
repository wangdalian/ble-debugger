const _ = require('lodash');
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

function apiDemoScanConnectWriteNotifyGenCodeAp(scanParams, writeParams) {
  const devConf = dbModule.getDevConf();
  const connectUrl = apiModule.getAsyncConnectUrlByDevConf(devConf);
  const connectStatusUrl = apiModule.getConnectStatusUrlByDevConf(devConf);
  const scanUrl = apiModule.getScanUrlByUserParams(devConf, scanParams.chip, scanParams.filter_mac, scanParams.filter_name, scanParams.filter_rssi);

  return `
  /**
   * 1.scanned device -> async connect
   * 2.connect result reported by connect status sse: 
   *  - connected: connect success, then write data
   *  - disconnected: device disconnected, if the write is not successful, recall async connect
   *  - timeout: connect timeout, recall async connect
   * caution: 
   *  - please confirm AP version support
   *  - connect status event only triggered when event happened, its means already connected devices before sse created will not trigger connect status event
   */
  const request = require('request');
  const EventSource = require('eventsource');
  
  const devicesWriteFlag = {};
  const devicesInfo = {};

  function openScanSse() {
    const url = '${scanUrl}';
    const sse = new EventSource(url);

    sse.onerror = function(error) {
      console.log('open notify sse failed:', error);
    };
    
    // async connect device when scanned it
    sse.onmessage = function(message) {
      // console.log('recevied scan sse message:', message);
      const data = JSON.parse(message.data);
      const deviceAddr = data.bdaddrs[0];
      const deviceMac = deviceAddr.bdaddr;
      if (devicesWriteFlag[deviceMac]) return;
      const deviceAddrType = deviceAddr.bdaddrType;
      console.log('scanned device:', deviceMac, deviceAddrType);

      devicesInfo[deviceMac] = deviceAddrType;
      connect(deviceMac, deviceAddrType);
    };
    
    return Promise.resolve(sse);
  }

  // async connect to device
  function connect(deviceMac, addrType) {
    let options = {
      'method': 'POST',
      'url': '${connectUrl}',
      'headers': {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"list":[{"type": addrType,"addr": deviceMac}],"timeout":5000,"per_dev_timeout":10000})
    };

    // if connect failed, retry when scanned it
    return new Promise((resolve, reject) => {
      request(options, function (error, response) { 
        console.log('connect:', error, response.body);
        if (error) reject(error);
        else if (response.body !== 'OK') reject(response.body);
        else resolve(response.body);
      });
    });
  }

  // write data to device
  function write(deviceMac, handle, value, noresponse=false) {
    const urlTpl = '${apiModule.getWriteUrlByDevConf(devConf, '#deviceMac', '#handle', '#value', '#noresponse')}';
    const url = urlTpl.replace(/#deviceMac/g, deviceMac).replace(/#handle/g, handle).replace(/#value/g, value).replace(/#noresponse/g, noresponse);
    let options = {
      'method': 'GET',
      'url': url,
      'headers': {}
    };
    return new Promise((resolve, reject) => {
      request(options, function (error, response) { 
        console.log('write:', error, response.body, url);
        if (error) reject(error);
        else if (response.body !== 'OK') reject(response.body);
        else resolve(response.body);
      });
    });
  }

  Promise.wait = function (time) { 
    return new Promise(function (resolve) { 
      return setTimeout(resolve, time || 0); 
    }); 
  }; 

  Promise.retry = function (fn, cont, delay, ...p) { 
    return fn(...p).catch(function (err) { 
      return cont > 0 ? Promise.wait(delay).then(function() { 
        return Promise.retry(fn, cont - 1, delay, ...p); 
      }) : Promise.reject('failed'); 
    }); 
  }; 

  function openConnectStateSse() {
    const url = '${connectStatusUrl}';
    const sse = new EventSource(url);

    sse.onerror = function(error) {
      console.log('open connect status sse failed:', error);
    };
    
    sse.onmessage = function(message) {
      console.log('recevied connect status sse message:', message);
      const data = JSON.parse(message.data);
      const deviceMac = data.handle;
      if (devicesWriteFlag[deviceMac]) return;
      if (data.connectionState === 'connected') {
        Promise.retry(write, 2, 200, deviceMac, ${writeParams.handle}, '${writeParams.value}', ${writeParams.noresponse}).then(() => {
          devicesWriteFlag[deviceMac] = true;
          Promise.retry(disconnect, 2, 50, deviceMac);
        }).catch(ex => {
          console.error(ex);
        });
      } else if (data.connectionState === 'disconnected') {
        // retry connect when scanned
      } else if (data.connectionState === 'timeout') {
        // retry connect when scanned
      }
    };
    
    return Promise.resolve(sse);
  }

  function disconnect(deviceMac) {
    const urlTpl = '${apiModule.getDisconnectUrlByDevConf(devConf, '#deviceMac')}';
    const url = urlTpl.replace(/#deviceMac/g, deviceMac);
    let options = {
      'method': 'DELETE',
      'url': url,
      'headers': {
      }
    };
    return new Promise((resolve, reject) => {
      request(options, function (error, response) { 
        console.log('disconnect:', error, response.body, url);
        if (error) reject(error);
        else if (response.body !== 'OK') reject(response.body);
        else resolve(response.body);
      });
    });
  }

  function main() {
    openScanSse().then(openConnectStateSse).then(() => {
      console.log('start success');
    }).catch(ex => {
      console.error('start failed:', ex);
    });
  }

  main();
  `;
}

function apiDemoScanConnectWriteNotifyGenCodeAc(scanParams, writeParams) {
  const devConf = dbModule.getDevConf();
  const oauth2Url = apiModule.getOauth2UrlByDevConf(devConf);
  const connectUrl = apiModule.getAsyncConnectUrlByDevConf(devConf, false);
  const connectStatusUrl = apiModule.getConnectStatusUrlByDevConf(devConf, false);
  const scanUrl = apiModule.getScanUrlByUserParams(devConf, scanParams.chip, scanParams.filter_mac, scanParams.filter_name, scanParams.filter_rssi, false);

  return `
  /**
   * 1.scanned device -> async connect
   * 2.connect result reported by connect status sse: 
   *  - connected: connect success, then write data
   *  - disconnected: device disconnected, if the write is not successful, recall async connect
   *  - timeout: connect timeout, recall async connect
   * caution: 
   *  - please confirm AC version support
   *  - connect status event only triggered when event happened, its means already connected devices before sse created will not trigger connect status event
   */
  const request = require('request');
  const EventSource = require('eventsource');
  
  const key = '${devConf.acDevKey}';
  const secret = '${devConf.acDevSecret}';

  const devicesWriteFlag = {};
  const devicesInfo = {};

  // oauth2
  function oauth2(key, secret) {
    const auth = Buffer.from(\`\${key}:\${secret}\`).toString('base64');
    let options = {
      'method': 'POST',
      'url': '${oauth2Url}',
      'headers': {
        'Authorization': \`Basic \${auth}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({'grant_type': 'client_credentials'})
    };
    return new Promise((resolve, reject) => {
      request(options, function (error, response) { 
        console.log('oauth2:', error, response.body);
        if (error) reject(error);
        else if (response.statusCode !== 200) reject(response.body);
        else resolve(JSON.parse(response.body).access_token);
      });
    });
  }

  function openScanSse(token) {
    const url = \`${scanUrl}&access_token=\${token}\`;
    const sse = new EventSource(url);

    sse.onerror = function(error) {
      console.log('open notify sse failed:', error);
    };
    
    // async connect device when scanned it
    sse.onmessage = function(message) {
      // console.log('recevied scan sse message:', message);
      const data = JSON.parse(message.data);
      const deviceAddr = data.bdaddrs[0];
      const deviceMac = deviceAddr.bdaddr;
      if (devicesWriteFlag[deviceMac]) return;
      const deviceAddrType = deviceAddr.bdaddrType;
      console.log('scanned device:', deviceMac, deviceAddrType);

      devicesInfo[deviceMac] = deviceAddrType;
      connect(token, deviceMac, deviceAddrType);
    };
    
    return Promise.resolve(sse);
  }

  // async connect to device
  function connect(token, deviceMac, addrType) {
    let options = {
      'method': 'POST',
      'url': \`${connectUrl}&access_token=\${token}\`,
      'headers': {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"list":[{"type": addrType,"addr": deviceMac}],"timeout":5000,"per_dev_timeout":10000})
    };

    // if connect failed, retry when scanned it
    return new Promise((resolve, reject) => {
      request(options, function (error, response) { 
        console.log('connect:', error, response.body);
        if (error) reject(error);
        else if (response.body !== 'OK') reject(response.body);
        else resolve(response.body);
      });
    });
  }

  // write data to device
  function write(token, deviceMac, handle, value, noresponse=false) {
    const urlTpl = '${apiModule.getWriteUrlByDevConf(devConf, '#deviceMac', '#handle', '#value', '#noresponse', false)}';
    let url = urlTpl.replace(/#deviceMac/g, deviceMac).replace(/#handle/g, handle).replace(/#value/g, value).replace(/#noresponse/g, noresponse);
    url = url + \`&access_token=\${token}\`;
    let options = {
      'method': 'GET',
      'url': url,
      'headers': {}
    };
    return new Promise((resolve, reject) => {
      request(options, function (error, response) { 
        console.log('write:', error, response.body, url);
        if (error) reject(error);
        else if (response.body !== 'OK') reject(response.body);
        else resolve(response.body);
      });
    });
  }

  Promise.wait = function (time) { 
    return new Promise(function (resolve) { 
      return setTimeout(resolve, time || 0); 
    }); 
  }; 

  Promise.retry = function (fn, cont, delay, ...p) { 
    return fn(...p).catch(function (err) { 
      return cont > 0 ? Promise.wait(delay).then(function() { 
        return Promise.retry(fn, cont - 1, delay, ...p); 
      }) : Promise.reject('failed'); 
    }); 
  }; 

  function openConnectStateSse(token) {
    const url = '${connectStatusUrl}' + \`&access_token=\${token}\`;
    const sse = new EventSource(url);

    sse.onerror = function(error) {
      console.log('open connect status sse failed:', error);
    };
    
    sse.onmessage = function(message) {
      console.log('recevied connect status sse message:', message);
      const data = JSON.parse(message.data);
      const deviceMac = data.handle;
      if (devicesWriteFlag[deviceMac]) return;
      if (data.connectionState === 'connected') {
        Promise.retry(write, 2, 200, token, deviceMac, ${writeParams.handle}, '${writeParams.value}', ${writeParams.noresponse}).then(() => {
          devicesWriteFlag[deviceMac] = true;
          Promise.retry(disconnect, 2, 50, token, deviceMac);
        }).catch(ex => {
          console.error(ex);
        });
      } else if (data.connectionState === 'disconnected') {
        // retry connect when scanned
      } else if (data.connectionState === 'timeout') {
        // retry connect when scanned
      }
    };
    
    return Promise.resolve(sse);
  }

  function disconnect(token, deviceMac) {
    const urlTpl = '${apiModule.getDisconnectUrlByDevConf(devConf, '#deviceMac', false)}';
    let url = urlTpl.replace(/#deviceMac/g, deviceMac);
    url = url + \`&access_token=\${token}\`;
    let options = {
      'method': 'DELETE',
      'url': url,
      'headers': {
      }
    };
    return new Promise((resolve, reject) => {
      request(options, function (error, response) { 
        console.log('disconnect:', error, response.body, url);
        if (error) reject(error);
        else if (response.body !== 'OK') reject(response.body);
        else resolve(response.body);
      });
    });
  }

  (async () => {
    try {
      let token = await oauth2(key, secret);
      console.log('token:', token);
      await openScanSse(token);
      await openConnectStateSse(token);
      console.log('success');
    } catch(ex) {
      console.error('fail:', ex);
    }
  })();
  `;
}

function apiDemoConnectWriteNotifyGenCodeAp(connectParams, writeParams) {
  const devConf = dbModule.getDevConf();
  const connectUrl = apiModule.getConnectUrlByDevConf(devConf, connectParams.deviceMac, connectParams.chip);
  const writeUrl = apiModule.getWriteUrlByDevConf(devConf, connectParams.deviceMac, writeParams.handle, writeParams.value, writeParams.noresponse);
  const notifyUrl = apiModule.getNotifyUrlByDevConf(devConf);

  return `
  const request = require('request');
  const EventSource = require('eventsource');

  // connect to device
  function connect() {
    let options = {
      'method': 'POST',
      'url': '${connectUrl}',
      'headers': {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"timeout":5000, "type": "${connectParams.addrType}"})
    };
    return new Promise((resolve, reject) => {
      request(options, function (error, response) { 
        console.log('connect:', error, response.body);
        if (error) reject(error);
        else if (response.body !== 'OK') reject(response.body);
        else resolve(response.body);
      });
    });
  }

  // write data to device
  function write() {
    let options = {
      'method': 'GET',
      'url': '${writeUrl}',
      'headers': {
      }
    };
    return new Promise((resolve, reject) => {
      request(options, function (error, response) { 
        console.log('write:', error, response.body);
        if (error) reject(error);
        else if (response.body !== 'OK') reject(response.body);
        else resolve(response.body);
      });
    });
  }

  function openNotifySse() {
    const url = '${notifyUrl}';
    const sse = new EventSource(url);

    sse.onerror = function(error) {
      console.log('open notify sse failed:', error);
    };
    
    sse.onmessage = function(message) {
      console.log('recevied notify sse message:', message);
    };
    
    return Promise.resolve(sse);
  }

  // TODO: listen connect status sse, add retry when device disconnected

  function main() {
    connect().then(write).then(openNotifySse).then(() => {
      console.log('success');
    }).catch(ex => {
      console.error('fail:', ex);
    });
  }

  main();
  `;
}

function apiDemoConnectWriteNotifyGenCodeAc(connectParams, writeParams) {
  const devConf = dbModule.getDevConf();
  const oauth2Url = apiModule.getOauth2UrlByDevConf(devConf);
  const connectUrl = apiModule.getConnectUrlByDevConf(devConf, connectParams.deviceMac, connectParams.chip, false);
  const writeUrl = apiModule.getWriteUrlByDevConf(devConf, connectParams.deviceMac, writeParams.handle, writeParams.value, writeParams.noresponse, false);
  const notifyUrl = apiModule.getNotifyUrlByDevConf(devConf, false);

  return `
  const request = require('request');
  const EventSource = require('eventsource');

  const key = '${devConf.acDevKey}';
  const secret = '${devConf.acDevSecret}';

  // oauth2
  function oauth2(key, secret) {
    const auth = Buffer.from(\`\${key}:\${secret}\`).toString('base64');
    let options = {
      'method': 'POST',
      'url': '${oauth2Url}',
      'headers': {
        'Authorization': \`Basic \${auth}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({'grant_type': 'client_credentials'})
    };
    return new Promise((resolve, reject) => {
      request(options, function (error, response) { 
        console.log('oauth2:', error, response.body);
        if (error) reject(error);
        else if (response.statusCode !== 200) reject(response.body);
        else resolve(JSON.parse(response.body).access_token);
      });
    });
  }

  // connect to device
  function connect(token) {
    let options = {
      'method': 'POST',
      'url': \`${connectUrl}&access_token=\${token}\`,
      'headers': {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"timeout":5000, "type": "${connectParams.addrType}"})
    };
    return new Promise((resolve, reject) => {
      request(options, function (error, response) { 
        console.log('connect:', error, response.body);
        if (error) reject(error);
        else if (response.body !== 'OK') reject(response.body);
        else resolve(response.body);
      });
    });
  }

  // write data to device
  function write(token) {
    let options = {
      'method': 'GET',
      'url': \`${writeUrl}&access_token=\${token}\`,
      'headers': {
      }
    };
    return new Promise((resolve, reject) => {
      request(options, function (error, response) { 
        console.log('write:', error, response.body);
        if (error) reject(error);
        else if (response.body !== 'OK') reject(response.body);
        else resolve(response.body);
      });
    });
  }

  function openNotifySse(token) {
    const url = \`${notifyUrl}&access_token=\${token}\`;
    const sse = new EventSource(url);

    sse.onerror = function(error) {
      console.log('open notify sse failed:', error);
    };
    
    sse.onmessage = function(message) {
      console.log('recevied notify sse message:', message);
    };
    
    return Promise.resolve(sse);
  }

  // TODO: listen connect status sse, add retry when device disconnected

  (async () => {
    try {
      let token = await oauth2(key, secret);
      console.log('token:', token);
      await connect(token);
      await write(token);
      await openNotifySse(token);
      console.log('success');
    } catch(ex) {
      console.error('fail:', ex);
    }
  })();
  `;
}

function apiDemoConnectWriteNotifyGenCode(connectParams, writeParams) {
  const devConf = dbModule.getDevConf();
  if (devConf.controlStyle === libEnum.controlStyle.AP) {
    return apiDemoConnectWriteNotifyGenCodeAp(connectParams, writeParams);
  } else {
    return apiDemoConnectWriteNotifyGenCodeAc(connectParams, writeParams);
  }
}

function apiDemoScanConnectWriteNotifyGenCode(scanParams, writeParams) {
  const devConf = dbModule.getDevConf();
  if (devConf.controlStyle === libEnum.controlStyle.AP) {
    return apiDemoScanConnectWriteNotifyGenCodeAp(scanParams, writeParams);
  } else {
    return apiDemoScanConnectWriteNotifyGenCodeAc(scanParams, writeParams);
  }
}

export default {
  genCode,
  apiDemoConnectWriteNotifyGenCode,
  apiDemoScanConnectWriteNotifyGenCode
}