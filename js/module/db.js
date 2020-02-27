import libEnum from '../lib/enum.js';
import apiModule from './api.js';

const storageKey = 'storageKey';

let storage = {
  devConf: {
    controlStyle: libEnum.controlStyle.AP, // 连接方式
    serverURI: 'http://192.168.0.100', // 服务器地址
    baseURI: 'http://192.168.0.100', //
    acDevKey: 'cassia', // 开发者账号
    acDevSecret: 'cassia', // 开发者密码
    mac: '', // 路由器MAC
    filter_name: [], // 扫描name过滤
    filter_mac: [], // 扫描mac过滤
    filter_rssi: -75,
    chip: 0, // 扫描使用的芯片
    access_token: '' // ac连接方式token
  },
  devConfDisplayVars: {
    scanFilterNamesInputVisible: false,
    scanFilterNamesInputValue: '',
    scanFilterMacsInputVisible: false,
    scanFilterMacsInputValue: '',
    isScanning: false,
    isNotifyOn: false,
    isApiScanResultDisplayOn: true,
    apiOutputDisplayCount: 20,
    activeMenuItem: 'scanListMenuItem',
    activeApiTabName: 'scan', // scan | connect | disconnect | read | write | writeNoRes ...
    activeApiOutputTabName: 'output', // output | curl | nodejs
    rssiChartStopped: false, // 是否暂停了rssi chart
    rssiChartSwitch: false, // 是否开启rssi chart，默认关闭
    rssiChartPeriod: 60, // 单位秒，统计周期
    rssiChartDataSpan: 2000, // 单位毫秒, 统计间隔, 此毫秒长度认为1个广播点
    rssiChartDataCount:  (60 * 1000 / 2000), // rssiChartPeriod * 1000 / rssiChartDataSpan;
    apiDebuggerParams: { // 调试工具参数
      [libEnum.apiType.SCAN]: {},
      [libEnum.apiType.CONNECT]: {chip: 0, deviceMac: '', addrType: libEnum.deviceAddrType.PUBLIC},
      [libEnum.apiType.READ]: {deviceMac: '', handle: ''},
      [libEnum.apiType.WRITE]: {deviceMac: '', handle: '', value: '', noresponse: false},
      [libEnum.apiType.DISCONNECT]: {deviceMac: ''},
    }
  }
};

let cache = {
  devicesConnectLoading: {

  },
  apiDebuggerResult: { 
    [libEnum.apiType.SCAN]: {
      resultList: [{time: '2020/02/20 01:02:03.666', data: '{"name":"(unknown)","evtType":3,"rssi":-80,"adData":"1EFF06000109200262A12A0E18F1516C3D7DABD42556C51B45E9094EB88D2B","bdaddrs":[{"bdaddr":"76:95:9B:89:BB:A5","bdaddrType":"random"}]}'}],
      code: {
        [libEnum.codeType.CURL]: '',
        [libEnum.codeType.NODEJS]: ''
      }
    },
    [libEnum.apiType.CONNECT]: {
      resultList: [],
      code: {
        [libEnum.codeType.CURL]: '',
        [libEnum.codeType.NODEJS]: ''
      }
    },
    [libEnum.apiType.READ]: {
      resultList: [],
      code: {
        [libEnum.codeType.CURL]: '',
        [libEnum.codeType.NODEJS]: ''
      }
    },
    [libEnum.apiType.WRITE]: {
      resultList: [],
      code: {
        [libEnum.codeType.CURL]: '',
        [libEnum.codeType.NODEJS]: ''
      }
    },
    [libEnum.apiType.DISCONNECT]: {
      resultList: [],
      code: {
        [libEnum.codeType.CURL]: '',
        [libEnum.codeType.NODEJS]: ''
      }
    }
  },
  scanResultList: [ // 扫描结果列表
    {name: 'UNKNOWN', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'public', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C', rssiHistory: [{time: Date.now(), rssi: -15}, {time: Date.now(), rssi: -75}]},
    {name: 'MI BAND 3', mac: 'CC:1B:E0:E0:DD:71', bdaddrType: 'random', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C', rssiHistory: [{time: Date.now(), rssi: -25}, {time: Date.now(), rssi: -35}]},
  ],
  connectedList: [ // 连接结果列表
    {name: '123', mac: 'CC:1B:E0:E0:DD:71', bdaddrType: 'random', chip: 0},
  ],
  devicesServiceList: { // 设备服务列表

  }, 
  notifyResultList: [ // 通知列表
    {mac: 'CC:1B:E0:E7:FE:F8', time: '2020/02/20 01:02:03.666', handle: 15, value: '0011223344556677889900112233445566778899'},
    {mac: 'CC:1B:E0:E7:FE:F8', time: '2020/02/20 01:02:03.666', handle: 15, value: '0011223344556677889900112233445566778899'},
    {mac: 'CC:1B:E0:E7:FE:F8', time: '2020/02/20 01:02:03.666', handle: 15, value: '0011223344556677889900112233445566778899'}
  ], 
};

function save(key, value) {
  window.localStorage.setItem(key, value);
}

function get(key) {
  return window.localStorage.getItem(key);
}

function getBaseURI(devConf) {
  let url = devConf.serverURI;
  if (devConf.controlStyle === libEnum.controlStyle.AC) {
    url = url + '/api'; 
  }
  return url;
}


function saveApDevConf(_devConf) {
  _devConf.baseURI = getBaseURI(_devConf);
  storage.devConf = _devConf;
  save(storageKey, JSON.stringify(storage));
  return Promise.resolve();
}

// 更新接口地址
function saveAcDevConf(_devConf) {
  _devConf.baseURI = getBaseURI(_devConf);
  return new Promise(function(resolve, reject) {
    apiModule.getAccessToken(_devConf.baseURI, _devConf.acDevKey, _devConf.acDevSecret).then(function(data) {
      _devConf.access_token = data.access_token;
      storage.devConf = _devConf;
      save(storageKey, JSON.stringify(storage));
      resolve();
    }).catch(function(error) {
      reject(error);
    });
  });
}

function saveDevConf(_devConf) {
  if (_devConf.controlStyle === libEnum.controlStyle.AC) {
    return saveAcDevConf(_devConf);
  }
  return saveApDevConf(_devConf);
}

function getDevConf() {
  return storage.devConf;
}

function getDevConfDisplayVars() {
  return storage.devConfDisplayVars;
}

function getCache() {
  return cache;
}

function getStorage() {
  return storage;
}

function loadStorage() {
  storage = JSON.parse(get(storageKey)) || storage;
}

function listAddOrUpdate(array, filterObj, arrayItem) {
  let item = _.find(array, filterObj);
  if (!item) array.push(arrayItem);
  else {
    _.forEach(arrayItem, (v, k) => {
      item[k] = v;
    });
  }
}

export default {
  save,
  get,
  saveDevConf,
  getDevConf,
  storage,
  cache,
  loadStorage,
  getCache,
  getStorage,
  getDevConfDisplayVars,
  listAddOrUpdate
}