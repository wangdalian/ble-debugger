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

function notifyHandler(operation, deviceMac, handle, notifyStatus) {
  const devConf = dbModule.getDevConf();
  const char = serviceMoudle.getCharByHandle(deviceMac, handle);
  if (!char) {
    vueModule.notify(`下发设备通知 ${deviceMac} handle ${handle} 失败: 未找到对应的characteristic`, '操作失败', libEnum.messageType.ERROR);
    return;
  }
  let value = (notifyStatus === libEnum.notifyStatus.ON ? '0000' : '0100');
  apiModule.writeByHandleByDevConf(devConf, deviceMac, handle, value, false).then(() => {
    if (char.notifyStatus === libEnum.notifyStatus.ON) char.notifyStatus = libEnum.notifyStatus.OFF;
    else if (char.notifyStatus === libEnum.notifyStatus.OFF) char.notifyStatus = libEnum.notifyStatus.ON;
    vueModule.notify(`下发设备通知 ${deviceMac} handle ${handle} 成功`, '操作成功', libEnum.messageType.SUCCESS);
  }).catch(ex => {
    vueModule.notify(`下发设备通知 ${deviceMac} handle ${handle} 失败: ${ex}`, '操作失败', libEnum.messageType.ERROR);
  });
}

// 字符串转hex
function textToHex(s) {
  var i = s.length;
  var n = 0;
  var ba = new Array()
  for (var j = 0; j < i;) {
    var c = s.codePointAt(j);
    if (c < 128) {
      ba[n++] = c;
      j++;
    }
    else if ((c > 127) && (c < 2048)) {
      ba[n++] = (c >> 6) | 192;
      ba[n++] = (c & 63) | 128;
      j++;
    }
    else if ((c > 2047) && (c < 65536)) {
      ba[n++] = (c >> 12) | 224;
      ba[n++] = ((c >> 6) & 63) | 128;
      ba[n++] = (c & 63) | 128;
      j++;
    }
    else {
      ba[n++] = (c >> 18) | 240;
      ba[n++] = ((c >> 12) & 63) | 128;
      ba[n++] = ((c >> 6) & 63) | 128;
      ba[n++] = (c & 63) | 128;
      j+=2;
    }
  }
  // 转hex字符数组
  ba = _.map(ba, item => item.toString('16'));
  return ba.join('');
}

function trimHexValue(value) {
  return value.trim().split(/\s+/).join('');
}

function writeWithResHandler(operation, deviceMac, handle, value) {
  const devConf = dbModule.getDevConf();
  const char = serviceMoudle.getCharByHandle(deviceMac, handle);
  if (!char) {
    vueModule.notify(`写入设备 ${deviceMac} handle ${handle} value ${value} 失败: 未找到对应的characteristic`, '操作失败', libEnum.messageType.ERROR);
    return;
  }
  if (char.writeValueType === libEnum.writeDataType.TEXT) {
    value = textToHex(value);
  } else {
    value = trimHexValue(value);
  }
  apiModule.writeByHandleByDevConf(devConf, deviceMac, handle, value, false).then((data) => {
    vueModule.notify(`写入设备 ${deviceMac} handle ${handle} value ${value} 成功`, '操作成功', libEnum.messageType.SUCCESS);
  }).catch(ex => {
    vueModule.notify(`写入设备 ${deviceMac} handle ${handle} value ${value} 失败: ${ex}`, '操作失败', libEnum.messageType.ERROR);
  });
}

function writeWithoutResHandler(operation, deviceMac, handle, value) {
  const devConf = dbModule.getDevConf();
  value = trimHexValue(value);
  const char = serviceMoudle.getCharByHandle(deviceMac, handle);
  if (!char) {
    vueModule.notify(`写入设备 ${deviceMac} handle ${handle} value ${value} 失败: 未找到对应的characteristic`, '操作失败', libEnum.messageType.ERROR);
    return;
  }
  if (char.writeValueType === libEnum.writeDataType.TEXT) {
    value = textToHex(value);
  } else {
    value = trimHexValue(value);
  }
  apiModule.writeByHandleByDevConf(devConf, deviceMac, handle, value, true).then((data) => {
    vueModule.notify(`写入设备 ${deviceMac} handle ${handle} value ${value} 成功`, '操作成功', libEnum.messageType.SUCCESS);
  }).catch(ex => {
    vueModule.notify(`写入设备 ${deviceMac} handle ${handle} value ${value} 失败: ${ex}`, '操作失败', libEnum.messageType.ERROR);
  });
}

function readHander(operation, deviceMac, handle, _) {
  const devConf = dbModule.getDevConf();
  const char = serviceMoudle.getCharByHandle(deviceMac, handle);
  if (!char) {
    vueModule.notify(`读取设备 ${deviceMac} handle ${handle} 失败: 未找到对应的characteristic`, '操作失败', libEnum.messageType.ERROR);
    return;
  }
  apiModule.readByHandleByDevConf(devConf, deviceMac, handle).then((data) => { // 成功了更新显示值
    char.readValue = data.value;
    char.parsedReadValues = libCharReadParser.getParsedValues(char.name, char.readValue);
    vueModule.notify(`读取设备 ${deviceMac} handle ${handle} 成功`, '操作成功', libEnum.messageType.SUCCESS);
  }).catch(ex => {
    vueModule.notify(`读取设备 ${deviceMac} handle ${handle} 失败: ${ex}`, '操作失败', libEnum.messageType.ERROR);
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