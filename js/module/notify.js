import libLogger from '../lib/logger.js';
import db from './db.js';
import api from './api.js';
import dbModule from './db.js';

const logger = libLogger.genModuleLogger('notify');

let sse = null;

// 更新notify结果
function notifySseMessageHandler(message) {
  const data = JSON.parse(message.data);
  logger.info('notify sse message:', message);
  const cache = dbModule.getCache();
  cache.notifyResultList.push({mac: data.node, handle: data.handle, value: data.value});
}

function notifySseErrorHandler(error) {
  logger.error('notify sse error:', error);
}

// 保存配置 -> 启动扫描
function startNotify(devConf) {
  let sse = api.startNotifyByDevConf(devConf, notifySseMessageHandler, notifySseErrorHandler);
  return sse;
}

function stopNotify() {
  if (sse) sse.close();
}

export default {
  startNotify,
  stopNotify,
}