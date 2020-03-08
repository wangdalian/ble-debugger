import libEnum from '../lib/enum.js';
import libLogger from '../lib/logger.js';
import libCharReadParser from '../lib/characteristics_read_parser.js';
import apiModule from './api.js';
import dbModule from './db.js';
import serviceMoudle from './service.js';
import vueModule from './vue.js';

const logger = libLogger.genModuleLogger('operation');

const operationsHandler = {
  [libEnum.operation.READ]: readHander,
  [libEnum.operation.NOTIFY]: notifyHandler,
  [libEnum.operation.WRITE_NO_RES]: writeWithoutResHandler,
  [libEnum.operation.WRITE]: writeWithResHandler,  
};

function notifyHandler(operation, deviceMac, char) {
  const devConf = dbModule.getDevConf();
  const handle = char.notifyHandle || char.handle;
  const notifyStatus = char.notifyStatus;
  let value = (notifyStatus === libEnum.notifyStatus.ON ? '0000' : '0100');
  apiModule.writeByHandleByDevConf(devConf, deviceMac, handle, value, false).then(() => {
    if (char.notifyStatus === libEnum.notifyStatus.ON) char.notifyStatus = libEnum.notifyStatus.OFF;
    else if (char.notifyStatus === libEnum.notifyStatus.OFF) char.notifyStatus = libEnum.notifyStatus.ON;
    vueModule.notify(`下发设备通知 ${deviceMac} handle ${handle} 成功`, '操作成功', libEnum.messageType.SUCCESS);
  }).catch(ex => {
    vueModule.notify(`下发设备通知 ${deviceMac} handle ${handle} 失败: ${ex}`, '操作失败', libEnum.messageType.ERROR);
  });
}

function trimHexValue(value) {
  return value.trim().split(/\s+/).join('');
}

function writeWithResHandler(operation, deviceMac, char) {
  const devConf = dbModule.getDevConf();
  const handle = char.handle;
  let value = char.writeValue;
  if (char.writeValueType === libEnum.writeDataType.TEXT) {
    value = textToHex(value);
  }
  value = trimHexValue(value);
  apiModule.writeByHandleByDevConf(devConf, deviceMac, handle, value, false).then((data) => {
    vueModule.notify(`写入设备 ${deviceMac} handle ${handle} value ${value} 成功`, '操作成功', libEnum.messageType.SUCCESS);
  }).catch(ex => {
    vueModule.notify(`写入设备 ${deviceMac} handle ${handle} value ${value} 失败: ${ex}`, '操作失败', libEnum.messageType.ERROR);
  });
}

function writeWithoutResHandler(operation, deviceMac, char) {
  const devConf = dbModule.getDevConf();
  const handle = char.handle;
  let value = char.writeValue;
  if (char.writeValueType === libEnum.writeDataType.TEXT) {
    value = buffer.Buffer.from(value).toString('hex');
  }
  value = trimHexValue(value);
  apiModule.writeByHandleByDevConf(devConf, deviceMac, handle, value, true).then((data) => {
    vueModule.notify(`写入设备 ${deviceMac} handle ${handle} value ${value} 成功`, '操作成功', libEnum.messageType.SUCCESS);
  }).catch(ex => {
    vueModule.notify(`写入设备 ${deviceMac} handle ${handle} value ${value} 失败: ${ex}`, '操作失败', libEnum.messageType.ERROR);
  });
}

function readHander(operation, deviceMac, char) {
  const devConf = dbModule.getDevConf();
  const handle = char.handle;
  apiModule.readByHandleByDevConf(devConf, deviceMac, handle).then((data) => { // 成功了更新显示值
    char.readValue = data.value || 'No Data'; // CAUTION: 有时候返回的结果没有value字段
    char.parsedReadValues = libCharReadParser.getParsedValues(char.name, char.readValue);
    vueModule.notify(`读取设备 ${deviceMac} handle ${handle} 成功`, '操作成功', libEnum.messageType.SUCCESS);
  }).catch(ex => {
    char.readValue = '';
    char.parsedReadValues = [];
    vueModule.notify(`读取设备 ${deviceMac} handle ${handle} 失败: ${ex}`, '操作失败', libEnum.messageType.ERROR);
    logger.error(ex);
  });
}

function defaultHandler(operation, deviceMac, char) {
  const error = `no support operation: ${operation}, ${deviceMac}, ${JSON.stringify(char)}`;
  logger.warn(error);
  return Promise.reject(error);
}

function dispatch(operation, deviceMac, char) {
  const handler = operationsHandler[operation] || defaultHandler;
  return handler(operation, deviceMac, char);
}

export default {
  dispatch,
}