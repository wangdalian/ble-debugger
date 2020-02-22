import apiModule from './api.js';
import scanModule from './scan.js';
import serviceModule from './service.js';
import operationModule from './operation.js';
import dbModule from './db.js';
import libLogger from '../lib/logger.js';

const logger = libLogger.genModuleLogger('vue');

let globalVue = null;

function createVueData(vue) {
  return function() {
    return {
      store: dbModule.storage,
      cache: dbModule.cache,
    }
  };
}

function createVueMethods(vue) {
  return {
    menuSelect(key, keyPath) {
      this.store.devConfDisplayVars.activeMenuItem = key;
    },
    propertyClick(operation, deviceMac, handle, writeValueOrNotifyStatus) {
      operationModule.dispatch(operation, deviceMac, handle, writeValueOrNotifyStatus);
    },
    getDeviceServices(deviceMac) {
      serviceModule.getDeviceServiceList(deviceMac);
    },
    startScan() {
      scanModule.startScan(this.store.devConf);
      this.store.devConfDisplayVars.isScanning = true;
      this.cache.scanResultList = [];
    },
    stopScan() {
      scanModule.stopScan();
      this.store.devConfDisplayVars.isScanning = false;
    },
    connectDevice(deviceMac) {
      apiModule.connectByDevConf(this.store.devConf, deviceMac).then(() => {
        let item = _.remove(this.cache.scanResultList, {mac: deviceMac}); // 连接成功从扫描列表中移除
        this.cache.connectedList.push(item); // 连接成功移到连接列表
      });
    },
    disconnectDevice(deviceMac) {
      apiModule.disconnectByDevConf(this.store.devConf, deviceMac);
    },
    scanFilterNamesHandleClose(tag) {
      this.store.devConf.filter_name.splice(this.store.devConf.filter_name.indexOf(tag), 1);
    },
    scanFilterNamesShowInput() {
      this.store.devConfDisplayVars.scanFilterNamesInputVisible = true;
      this.$nextTick(_ => {
        this.$refs.scanFilterNamesSaveTagInput.$refs.input.focus();
      });
    },
    scanFilterNamesHandleInputConfirm() {
      let scanFilterNamesInputValue = this.store.devConfDisplayVars.scanFilterNamesInputValue;
      if (scanFilterNamesInputValue) {
        this.store.devConf.filter_name.push(scanFilterNamesInputValue);
      }
      this.store.devConfDisplayVars.scanFilterNamesInputVisible = false;
      this.store.devConfDisplayVars.scanFilterNamesInputValue = '';
    },
    scanFilterMacsHandleClose(tag) {
      this.store.devConf.filter_mac.splice(this.store.devConf.filter_mac.indexOf(tag), 1);
    },
    scanFilterMacsShowInput() {
      this.store.devConfDisplayVars.scanFilterMacsInputVisible = true;
      this.$nextTick(_ => {
        this.$refs.scanFilterMacsSaveTagInput.$refs.input.focus();
      });
    },
    scanFilterMacsHandleInputConfirm() {
      let scanFilterMacsInputValue = this.store.devConfDisplayVars.scanFilterMacsInputValue;
      if (scanFilterMacsInputValue) {
        this.store.devConf.filter_mac.push(scanFilterMacsInputValue);
      }
      this.store.devConfDisplayVars.scanFilterMacsInputVisible = false;
      this.store.devConfDisplayVars.scanFilterMacsInputValue = '';
    },
  };
}

function createVue(divId) {
  globalVue = new Vue({
    el: `#${divId}`,
    methods: createVueMethods(),
    data: createVueData(),
  });
}

function getGlobalVue() {
  return globalVue;
}

function setObjProperty(obj, key, value) {
  getGlobalVue().$set(obj, key, value);
}

export default {
  createVue,
  getGlobalVue,
  setObjProperty
}
