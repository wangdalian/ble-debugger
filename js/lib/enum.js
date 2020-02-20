const controlStyle = {
  AC: 'ac',
  AP: 'ap'
}

const operation = {
  BROADCASTS: 'broadcasts',
  READ: 'read',
  WRITE_WITHOUT_RES: 'write without response',
  WRITE_WITH_RES: 'write with response',
  NOTIFY: 'notify',
  INDICATE: 'indicate',
  AUTHEN: 'authen',
  EXTENDED: 'extended',
}

// char通知按钮状态
const notifyStatus = {
  ON: 'on',
  OFF: 'off'
};

export default {
  operation,
  controlStyle,
  notifyStatus
}