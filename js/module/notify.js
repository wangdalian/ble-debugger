import libEnum from '../lib/enum.js';
import libLogger from '../lib/logger.js';
import api from './api.js';
import dbModule from './db.js';
import vueModule from './vue.js';

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
  vueModule.notify(`Notify SSE异常: ${error.message || JSON.stringify(error)}`, '服务异常', libEnum.messageType.ERROR);
}

// 保存配置 -> 启动扫描
function startNotify() {
  const devConf = dbModule.getDevConf();
  sse = api.startNotifyByDevConf(devConf, notifySseMessageHandler, notifySseErrorHandler);
}

function stopNotify() {
  if (sse) sse.close();
}

export default {
  startNotify,
  stopNotify,
}