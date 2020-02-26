const controlStyle = {
  AC: 'ac',
  AP: 'ap'
}

const operation = {
  BROADCASTS: 'BROADCASTS',
  READ: 'READ',
  WRITE_NO_RES: 'WRITE NO RES',
  WRITE: 'WRITE',
  NOTIFY: 'NOTIFY',
  INDICATE: 'INDICATE',
  AUTHEN: 'AUTHEN',
  EXTENDED: 'EXTENDED',
}

// char通知按钮状态
const notifyStatus = {
  ON: 'on',
  OFF: 'off'
};

// element message类型
const messageType = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

// 写入设备指令格式
const writeDataType = {
  HEX: 'hex',
  TEXT: 'text'
};

export default {
  operation,
  controlStyle,
  notifyStatus,
  messageType,
  writeDataType
}