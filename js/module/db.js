import libEnum from '../lib/enum.js';
import apiModule from './api.js';

const storageKey = 'storageKey';

let storage = {
  devConf: {
    controlStyle: libEnum.controlStyle.AC, // 连接方式
    serverURI: 'http://demo.cassia.pro', // 服务器地址
    baseURI: 'http://demo.cassia.pro', //
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
    activeMenuItem: 'scanListMenuItem'
  }
};

let cache = {
  scanResultList: [
    {name: 'UNKNOWN', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'public', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'MI BAND 3', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'random', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'UNKNOWN', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'public', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'MI BAND 3', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'random', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'UNKNOWN', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'public', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'MI BAND 3', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'random', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'UNKNOWN', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'public', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'MI BAND 3', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'random', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'UNKNOWN', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'public', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'MI BAND 3', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'random', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'UNKNOWN', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'public', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'MI BAND 3', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'random', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'UNKNOWN', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'public', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'MI BAND 3', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'random', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'UNKNOWN', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'public', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'MI BAND 3', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'random', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'UNKNOWN', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'public', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'MI BAND 3', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'random', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'UNKNOWN', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'public', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'MI BAND 3', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'random', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'UNKNOWN', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'public', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
    {name: 'MI BAND 3', mac: 'CC:1B:E0:E0:DD:70', bdaddrType: 'random', rssi: -75, adData: '0201061BFF5701006BFCA25D5ED51C0B3E60820178B901BE01D40B59A1259C'},
  ], // 扫描结果
  connectedList: [
  ], // 连接列表
  devicesServiceList: {}, // 设备服务列表
  notifyResultList: [
    {mac: 'CC:1B:E0:E7:FE:F8', handle: 15, value: '0011223344556677889900112233445566778899'},
    {mac: 'CC:1B:E0:E7:FE:F8', handle: 15, value: '0011223344556677889900112233445566778899'},
    {mac: 'CC:1B:E0:E7:FE:F8', handle: 15, value: '0011223344556677889900112233445566778899'}
  ], // 通知列表
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

function getCache() {
  return cache;
}

function loadStorage() {
  storage = JSON.parse(get(storageKey)) || storage;
}

export default {
  save,
  get,
  saveDevConf,
  getDevConf,
  storage,
  cache,
  loadStorage,
  getCache
}