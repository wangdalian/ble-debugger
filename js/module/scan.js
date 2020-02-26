import libEnum from '../lib/enum.js';
import libLogger from '../lib/logger.js';
import db from './db.js';
import api from './api.js';
import dbModule from './db.js';
import vueModule from './vue.js';

const logger = libLogger.genModuleLogger('scan');

let sse = null;

// 更新扫描结果
function scanSseMessageHandler(message) {
  const cache = dbModule.getCache();
  // 追加到api扫描调试结果里面
  if (cache.apiDebuggerResult.scanResultList.length > 15) cache.apiDebuggerResult.scanResultList.shift();
  cache.apiDebuggerResult.scanResultList.push(message.data);
  const data = JSON.parse(message.data);
  const deviceAddr = data.bdaddrs[0];
  // logger.info('scan sse message:', message);
  let device = _.find(cache.scanResultList, {mac: deviceAddr.bdaddr});
  if (!device) {
    cache.scanResultList.push({
      mac: deviceAddr.bdaddr, 
      name: data.name,
      adData:  data.adData,
      bdaddrType: deviceAddr.bdaddrType,
      rssi: data.rssi,
      rssiHistory: [{time: Date.now(), rssi: data.rssi}]
    });
  } else {
    if (data.name !== '(unknown)') device.name = data.name;
    device.rssi = data.rssi;
    device.rssiHistory.push({time: Date.now(), rssi: data.rssi});
  }
}

function scanSseErrorHandler(error) {
  logger.error('scan sse error:', error);
  vueModule.notify(`扫描SSE异常: ${error.message || JSON.stringify(error)}`, `服务异常`, libEnum.messageType.ERROR);
}

// 保存配置 -> 启动扫描
function startScan(devConf) {
  db.saveDevConf(devConf);
  sse = api.startScanByDevConf(devConf, scanSseMessageHandler, scanSseErrorHandler);
  return sse;
}

function stopScan() {
  if (sse) sse.close();
  vueModule.notify('停止扫描成功', '操作成功', libEnum.messageType.SUCCESS);
}

export default {
  startScan,
  stopScan,
}