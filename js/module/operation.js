import libEnum from '../lib/enum.js';
import libLogger from '../lib/logger.js';
import apiModule from './api.js';
import dbModule from './db.js';
import serviceMoudle from './service.js';

const logger = libLogger.genModuleLogger('operation');

const operationsHandler = {
  [libEnum.operation.READ]: readHander,
  [libEnum.operation.NOTIFY]: notifyHandler,
  // [libEnum.operation.WRITE_WITHOUT_RES]: writeWithoutResHandler,
  [libEnum.operation.WRITE_WITH_RES]: writeWithResHandler,  
};

function notifyHandler(operation, deviceMac, handle, notifyStatus) {
  const devConf = dbModule.getDevConf();
  const char = serviceMoudle.getCharByHandle(deviceMac, handle);
  if (!char) return;
  let value = (notifyStatus === libEnum.notifyStatus.ON ? '0000' : '0100');
  apiModule.writeByHandleByDevConf(devConf, deviceMac, handle, value, false).then(() => {
    if (char.notifyStatus === libEnum.notifyStatus.ON) char.notifyStatus = libEnum.notifyStatus.OFF;
    else if (char.notifyStatus === libEnum.notifyStatus.OFF) char.notifyStatus = libEnum.notifyStatus.ON;
  });
}

function writeWithResHandler(operation, deviceMac, handle, value) {
  const devConf = dbModule.getDevConf();
  const char = serviceMoudle.getCharByHandle(deviceMac, handle);
  if (!char) return;
  apiModule.writeByHandleByDevConf(devConf, deviceMac, handle, value, false).then((data) => {
    // 
  });
}

function readHander(operation, deviceMac, handle, _) {
  const devConf = dbModule.getDevConf();
  const char = serviceMoudle.getCharByHandle(deviceMac, handle);
  if (!char) return;
  apiModule.readByHandleByDevConf(devConf, deviceMac, handle).then((data) => { // 成功了更新显示值
    char.readValue = data.value;
  });
}

function defaultHandler(operation, deviceMac, handle, writeValueOrNotifyStatus) {
  const error = `no support operation: ${operation}, ${deviceMac}, ${handle}`;
  logger.warn(error);
  return Promise.reject(error);
}

function dispatch(operation, deviceMac, handle, writeValueOrNotifyStatus) {
  const handler = operationsHandler[operation] || defaultHandler;
  return handler(operation, deviceMac, handle, writeValueOrNotifyStatus);
}

export default {
  dispatch,
}