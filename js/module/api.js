import libLogger from '../lib/logger.js';
import libEnum from '../lib/enum.js';
import config from '../config/config.js';
import base64 from '../lib/base64.js';

const logger = libLogger.genModuleLogger('api');

function obj2QueryStr(obj) {
  let arr = [];
  _.forEach(obj, (value, key) => {
    arr.push(`${key}=${value}`);
  })
  return arr.join('&');
}

function getFields(devConf, fields) {
  let param = {};
  _.forEach(devConf, (value, key) => {
    if (_.includes(fields, key)) param[key] = value;
  });
  if (devConf.controlStyle === libEnum.controlStyle.AC) {
    param.mac = devConf.mac;
    param.access_token = devConf.access_token;
  }
  return param;
}

// 请求accessToken
function getAccessToken(baseURI, devKey, devSecret) {
  const url = `${baseURI}/oauth2/token`;
  const instance = axios.create({
    timeout: config.http.requestTimeout,
    headers: {
      Authorization: 'Basic ' + base64.encode(`${devKey}:${devSecret}`)
    }
  });
  return new Promise((resolve, reject) => {
    instance.post(url, {grant_type: 'client_credentials'}).then(function(response) {
      logger.info('get access token success:', response);
      resolve(response.data);
    }).catch(function(error) {
      logger.error('get access token error:', error);
      reject(error);
    });
  });
}

function scanSseMessageHandler(message) {
  logger.info('scan sse message:', message);
}

function scanSseErrorHandler(error) {
  logger.error('scan sse error:', error);
}

// params -> {chip: 0, filter_mac: '1,2', filter_name: '2,3', filter_rssi: -75, mac: 'aa', access_token: 'bac'}
function startScan(baseURI, params, messageHandler, errorHandler) {
  const url = `${baseURI}/gap/nodes?${obj2QueryStr(params)}`;
  let sse = new EventSource(url);
  sse.onmessage = messageHandler || scanSseMessageHandler;
  sse.onerror = errorHandler || scanSseErrorHandler;
  logger.info('open scan sse:', url);
  return sse;
}

function notifySseMessageHandler(message) {
  logger.info('notify sse message:', message);
}

function notifySseErrorHandler(error) {
  logger.error('notify sse error:', error);
}

// params -> {chip: 0, filter_mac: '1,2', filter_name: '2,3', filter_rssi: -75, mac: 'aa', access_token: 'bac'}
function startNotify(baseURI, params, messageHandler, errorHandler) {
  const url = `${baseURI}/gatt/nodes?${obj2QueryStr(params)}`;
  let sse = new EventSource(url);
  sse.onmessage = messageHandler || notifySseMessageHandler;
  sse.onerror = errorHandler || notifySseErrorHandler;
  logger.info('open notify sse:', url);
  return sse;
}

function connect(baseURI, params, deviceMac) {
  const url = `${baseURI}/gap/nodes/${deviceMac}/connection/?${obj2QueryStr(params)}`;
  return new Promise((resolve, reject) => {
    axios.post(url).then(function(response) {
      logger.info('connect device success:', response);
      resolve(response.data);
    }).catch(function(error) {
      logger.error('connect device error:', error);
      reject(error);
    });
  });
}

function disconnect(baseURI, params, deviceMac) {
  const url = `${baseURI}/gap/nodes/${deviceMac}/connection/?${obj2QueryStr(params)}`;
  return new Promise((resolve, reject) => {
    axios.delete(url).then(function(response) {
      logger.info('disconnect device success:', response);
      resolve(response.data);
    }).catch(function(error) {
      logger.error('disconnect device error:', error);
      reject(error);
    });
  });
}

function getConnectedList(baseURI, params) {
  const url = `${baseURI}/gap/nodes?${obj2QueryStr(params)}&connection_state=connected`;
  return new Promise((resolve, reject) => {
    axios.get(url).then(function(response) {
      logger.info('get connected list success:', response);
      resolve(response.data);
    }).catch(function(error) {
      logger.error('get connected list error:', error);
      reject(error);
    });
  });
}

function getDeviceServiceList(baseURI, params, deviceMac) {
  const url = `${baseURI}/gatt/nodes/${deviceMac}/services/characteristics/descriptors?${obj2QueryStr(params)}`;
  return new Promise((resolve, reject) => {
    axios.get(url).then(function(response) {
      logger.info('get device service list success:', response);
      resolve(response.data);
    }).catch(function(error) {
      logger.error('get device service list error:', error);
      reject(error);
    });
  });
}

function readByHandle(baseURI, params, deviceMac, handle) {
  const url = `${baseURI}/gatt/nodes/${deviceMac}/handle/${handle}/value?${obj2QueryStr(params)}`;
  return new Promise((resolve, reject) => {
    axios.get(url).then(function(response) {
      logger.info('read handle success:', response);
      resolve(response.data);
    }).catch(function(error) {
      logger.error('read handle error:', error);
      reject(error);
    });
  });
}

function writeByHandle(baseURI, params, deviceMac, handle, value, noresponse=false) {
  let url = `${baseURI}/gatt/nodes/${deviceMac}/handle/${handle}/value/${value}?${obj2QueryStr(params)}`;
  if (noresponse) url = url + '&noresponse=1';
  return new Promise((resolve, reject) => {
    axios.get(url).then(function(response) {
      logger.info('write handle success:', response);
      resolve(response.data);
    }).catch(function(error) {
      logger.error('write handle error:', error);
      reject(error);
    });
  });
}

function startScanByDevConf(devConf, messageHandler, errorHandler) {
  const fields = ['chip', 'filter_mac', 'filter_name', 'filter_rssi'];
  const params = getFields(devConf, fields);
  params.active = 1;
  params.event = 1;
  return startScan(devConf.baseURI, params, messageHandler, errorHandler);
}

function startNotifyByDevConf(devConf, messageHandler, errorHandler) {
  const fields = [];
  const params = getFields(devConf, fields);
  params.event = 1;
  return startNotify(devConf.baseURI, params, messageHandler, errorHandler);
}

function connectByDevConf(devConf, deviceMac) {
  const params = getFields(devConf, []);
  return connect(devConf.baseURI, params, deviceMac);
}

function getConnectedListByDevConf(devConf) {
  const params = getFields(devConf, []);
  return getConnectedList(devConf.baseURI, params);
}

function disconnectByDevConf(devConf, deviceMac) {
  const params = getFields(devConf, []);
  return disconnect(devConf.baseURI, params, deviceMac);
}

function getDeviceServiceListByDevConf(devConf, deviceMac) {
  const params = getFields(devConf, []);
  return getDeviceServiceList(devConf.baseURI, params, deviceMac);
}

function readByHandleByDevConf(devConf, deviceMac, handle) {
  const params = getFields(devConf, []);
  return readByHandle(devConf.baseURI, params, deviceMac, handle);
}

function writeByHandleByDevConf(devConf, deviceMac, handle, value, noresponse) {
  const params = getFields(devConf, []);
  return writeByHandle(devConf.baseURI, params, deviceMac, handle, value, noresponse);
}

export default {
  getAccessToken,
  startScanByDevConf,
  startNotifyByDevConf,
  connectByDevConf,
  disconnectByDevConf,
  getConnectedListByDevConf,
  getDeviceServiceListByDevConf,
  readByHandleByDevConf,
  writeByHandleByDevConf,
}