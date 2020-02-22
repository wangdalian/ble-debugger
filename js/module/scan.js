import libLogger from '../lib/logger.js';
import db from './db.js';
import urlModule from './url.js';
import api from './api.js';
import dbModule from './db.js';

const logger = libLogger.genModuleLogger('scan');

let sse = null;

// 更新扫描结果
function scanSseMessageHandler(message) {
  const data = JSON.parse(message.data);
  const deviceAddr = data.bdaddrs[0];
  logger.info('scan sse message:', message);
  const cache = dbModule.getCache();
  let device = _.find(cache.scanResultList, {mac: deviceAddr.bdaddr});
  if (!device) {
    cache.scanResultList.push({
      mac: deviceAddr.bdaddr, 
      name: data.name,
      adData:  data.adData,
      bdaddrType: deviceAddr.bdaddrType,
      rssi: data.rssi
    });
  } else {
    if (data.name !== '(unknown)') device.name = data.name;
    device.rssi = data.rssi;
  }
}

function scanSseErrorHandler(error) {
  logger.error('scan sse error:', error);
}

// 保存配置 -> 启动扫描
function startScan(devConf) {
  db.saveDevConf(devConf);
  urlModule.updateURI(devConf).then(function() {
    sse = api.startScanByDevConf(devConf, scanSseMessageHandler, scanSseErrorHandler);
  });
  return sse;
}

function stopScan() {
  if (sse) sse.close();
}

export default {
  startScan,
  stopScan,
}