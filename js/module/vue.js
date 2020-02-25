import apiModule from './api.js';
import scanModule from './scan.js';
import serviceModule from './service.js';
import operationModule from './operation.js';
import dbModule from './db.js';
import codeModule from './code.js';
import libLogger from '../lib/logger.js';
import libEnum from '../lib/enum.js';

const logger = libLogger.genModuleLogger('vue');

let globalVue = null;

function createVueData(vue) {
  return function() {
    return {
      store: dbModule.getStorage(),
      cache: dbModule.getCache(),
    }
  };
}

function message(message, type=libEnum.messageType.INFO) {
  globalVue.$message({message, type, showClose: true});
}

function notify(message, title='', type=libEnum.messageType.INFO, autoclose=true) {
  const data = {title, message, type};
  if (!autoclose) data.duration = 0;
  globalVue.$notify(data);
}

function rssiChartXaxisData() {
  let data = [];
  const devConfDisplayVars = dbModule.getDevConfDisplayVars();
  devConfDisplayVars.rssiChartDataCount = devConfDisplayVars.rssiChartPeriod * 1000 / devConfDisplayVars.rssiChartDataSpan;
  for (let index = 0; index < devConfDisplayVars.rssiChartDataCount; index ++) {
    data.push((index * devConfDisplayVars.rssiChartDataSpan).toString());
  }
  console.log('1111111111', data);
  return data;
}

function createRssiChart() {
  let chart = echarts.init(document.getElementById('rssiChart'));
  let xAxisData = rssiChartXaxisData();
  chart.setOption({
    title: {
      show: false
    },
    grid: { 
      right: '20%' 
    },
    legend: {
      type: 'scroll',
      orient: 'vertical',
      x: 'right',
      y: 'center',
    },
    // tooltip: {
    //   trigger: 'axis',
    //   axisPointer: {
    //       animation: true
    //   }
    // },
    xAxis: {
        type: 'category',
        data: xAxisData,
        // showSymbol: true,
        // axisPointer: {
        //   show: true,
        //   snap: true,
        // },
        axisLabel: {
          show: true,
          rotate: 45,
          interval:0,//使x轴横坐标全部显示
          formatter: function (value, index) {
            return '';
          },
          // interval: xAxisData.length > 20 ? 9 : xAxisData.length
        }
    },
    yAxis: {
        type: 'value',
        min: -100,
        max: -10,
        splitNumber: 10, // 每10dbm1个间隔
        inverse: true
    },
    series: []
  });
  chart.resize();
  return chart;
}

function createVueMethods(vue) {
  return {
    connectedListTabRemove(index) {
      const deviceMac = this.cache.connectedList[index].mac;
      apiModule.disconnectByDevConf(this.store.devConf, deviceMac).then(() => {
        _.pullAt(this.cache.connectedList, index);
        // notify(`设备 ${deviceMac} 断开连接`, `设备断连成功`, libEnum.messageType.SUCCESS);
      }).catch(function(ex) {
        notify(`设备 ${deviceMac} 断连失败: ${ex}`, '设备断连失败', libEnum.messageType.ERROR);
      });
    },
    rssiChartDataSpanChange() {
      if (!this.store.devConfDisplayVars.rssiChartSwitch) {
        logger.info('rssi chart switch off');
        this.rssiChart = null;
        clearInterval(this.rssiChartUpdateInterval);
        this.rssiChartUpdateInterval = null;
        notify('关闭RSSI图表成功', '关闭RSSI图表成功', libEnum.messageType.SUCCESS);
      } else {
        if (!this.store.devConfDisplayVars.isScanning) {
          notify('没有开启扫描，请先开启扫描!', '缺失操作', libEnum.messageType.WARNING);
          return;
        }
        if (this.store.devConfDisplayVars.rssiChartDataSpan < 5000) {
          notify('设置的统计间隔较短，可能会导致界面卡顿!', '操作告警', libEnum.messageType.WARNING);
        }
        setTimeout(function(that) {
          clearInterval(that.rssiChartUpdateInterval);
          that.rssiChart = createRssiChart();
          that.rssiChartUpdateInterval = createRssiChartUpdateInterval();
          notify('开启RSSI图表成功', '开启RSSI图表成功', libEnum.messageType.SUCCESS);
        }, 100, this);
      }
    },
    rssiChartSwitchChange(rssiChartSwitch) {
      this.store.devConfDisplayVars.rssiChartSwitch = rssiChartSwitch;
      this.rssiChartDataSpanChange();
    },
    genCode(apiType) {
      this.cache.apiDebuggerResult.scanCodeCurl = codeModule.genCode(apiType, 'curl');
      this.cache.apiDebuggerResult.scanCodeNodeJS = codeModule.genCode(apiType, 'nodejs');
    },
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
      this.store.devConfDisplayVars.activeMenuItem = 'scanListMenuItem'; // 跳转扫描结果tab页面
    },
    stopScan() {
      scanModule.stopScan();
      this.rssiChartSwitchChange(false);
      this.store.devConfDisplayVars.isScanning = false;
    },
    connectDevice(deviceMac) { // notify通过连接状态SSE通知
      setObjProperty(this.cache.devicesConnectLoading, deviceMac, true);
      apiModule.connectByDevConf(this.store.devConf, deviceMac).then(() => {
        // notify(`连接设备 ${deviceMac} 成功`, '设备连接成功', libEnum.messageType.SUCCESS);
        let removedList = _.remove(this.cache.scanResultList, {mac: deviceMac}); // 连接成功从扫描列表中移除
        if (removedList.length > 0) {
          dbModule.listAddOrUpdate(this.cache.connectedList, {mac: removedList[0].mac}, { // 连接成功移到连接列表
            mac: removedList[0].mac,
            name: removedList[0].name,
            bdaddrType: removedList[0].bdaddrType,
          });
        }
      }).catch(ex => {
        notify(`连接设备 ${deviceMac} 失败: ${ex}`, '连接设备失败', libEnum.messageType.ERROR);
      }).then(() => {
        setObjProperty(this.cache.devicesConnectLoading, deviceMac, false);
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

function scanDataList2RssiChartData(periodStartTime, periodEndTime) {
  let series = [];
  const devConfDisplayVars = dbModule.getDevConfDisplayVars();
  devConfDisplayVars.rssiChartDataCount = devConfDisplayVars.rssiChartPeriod * 1000 / devConfDisplayVars.rssiChartDataSpan;
  _.forEach(dbModule.getCache().scanResultList, scanItem => {
    let rssiData = new Array(devConfDisplayVars.rssiChartDataCount); // 每100毫秒时为一个时刻点
    _.remove(scanItem.rssiHistory, rssiItem => { // 移除本周期之前的数据
      return rssiItem.time < periodStartTime;
    });
    console.log('yyyyyyyyyyyyy', scanItem.mac, scanItem.rssiHistory);
    _.forEach(scanItem.rssiHistory, rssiItem => { // 填充到待渲染的数据里面
      if (rssiItem.time >= periodStartTime && rssiItem.time < periodEndTime) {
        let rssiDataIndex = parseInt((rssiItem.time - periodStartTime) / devConfDisplayVars.rssiChartDataSpan);
        rssiData[rssiDataIndex] = rssiItem.rssi;
      }
    });
    console.log('zzzzzzzzzzzzz', scanItem.mac, devConfDisplayVars.rssiChartPeriod, devConfDisplayVars.rssiChartDataSpan, devConfDisplayVars.rssiChartDataCount, rssiData);
    series.push({
      name: scanItem.mac,
      type: 'line',
      // showSymbol: true,
      // hoverAnimation: true,
      // symbol: 'circle',     //设定为实心点
      // symbolSize: 20,   //设定实心点的大小
      data: rssiData
    });
  });
  return series;
}

// 每5秒更新一次rssi chart, 移除不在本周期内的点，
function createRssiChartUpdateInterval() {
  const devConfDisplayVars = dbModule.getDevConfDisplayVars();
  return setInterval(function() {
    if (!globalVue.rssiChart) return logger.warn('no rssi chart');
    logger.info('update rssi chart by interval');
    let periodEndTime = Date.now();
    let periodStartTime = periodEndTime - devConfDisplayVars.rssiChartPeriod * 1000;
    let seriesData = scanDataList2RssiChartData(periodStartTime, periodEndTime);
    console.log('xxxxxxxx', periodStartTime, periodEndTime, seriesData);
    globalVue.rssiChart.setOption({series: seriesData});
    globalVue.rssiChart.resize();
  }, devConfDisplayVars.rssiChartDataSpan);
}

function createVue(divId) {
  globalVue = new Vue({
    el: `#${divId}`,
    methods: createVueMethods(),
    data: createVueData(),
    mounted() {
    }
  });
}

function getGlobalVue() {
  return globalVue;
}

function setObjProperty(obj, key, value) {
  getGlobalVue().$set(obj, key, value);
}

export default {
  notify,
  createVue,
  getGlobalVue,
  setObjProperty,
  message
}
