import apiModule from './api.js';
import scanModule from './scan.js';
import serviceModule from './service.js';
import operationModule from './operation.js';
import dbModule from './db.js';
import codeModule from './code.js';
import libLogger from '../lib/logger.js';
import libEnum from '../lib/enum.js';
import notifyModule from './notify.js';
import connectModule from './connect.js';

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

function initHighlightingRefresh() {
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightBlock(block);
  });
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
    scanTabsClick(x) {
      this.$refs.refScanDisplayResultGrid.updateData();
      // this.$refs.refScanDisplayResultGrid.refreshScroll();
    },
    scanDisplayResultClear() {
      this.cache.scanDisplayResultList.splice(0);
    },
    notifyDisplayResultClear() {
      this.cache.notifyDisplayResultList.splice(0);
    },
    scanDisplayResultExport () {
      this.$refs.refNotifyDisplayResultGrid.exportData({ type: 'csv' })
    },
    notifyDisplayResultExport () {
      this.$refs.refNotifyDisplayResultGrid.exportData({ type: 'csv' })
    },
    loadNotifyResult() {
      const loadPageSize = 5;
      this.cache.isNotifyLoading = true;
      let pageList = this.cache.notifyResultList.splice(0, loadPageSize);
      let pageJsonList = _.map(pageList, item => `${new Date(item.time).toISOString()}: ${item.data}`);
      if (pageList.length !== 0) {
        let index = this.cache.notifyDisplayResultList.length;
        this.cache.notifyDisplayResultList.splice(index, pageJsonList.length, ...pageJsonList);
        this.cache.isNotifyLoading = false;
      } else {
        setTimeout(function(that) {
          that.cache.isNotifyLoading = false;
          that.loadNotifyResult();
        }, 500, this);
      }
    },
    loadApiDebuggerResult() {
      const apiType = this.store.devConfDisplayVars.activeApiTabName;
      if (apiType === libEnum.apiType.SCAN) {
        const loadPageSize = 5;
        this.cache.isApiDebuggerLoading = true;
        let pageList = this.cache.apiDebuggerResult[libEnum.apiType.SCAN].resultList.splice(0, loadPageSize);
        let pageJsonList = _.map(pageList, item => `${new Date(item.time).toISOString()}: ${item.data}`);
        if (pageList.length !== 0) {
          let index = this.cache.apiDebuggerResult[libEnum.apiType.SCAN].displayResultList.length;
          this.cache.apiDebuggerResult[libEnum.apiType.SCAN].displayResultList.splice(index, pageJsonList.length, ...pageJsonList);
          this.cache.isApiDebuggerLoading = false;
        } else {
          setTimeout(function(that) {
            that.cache.isApiDebuggerLoading = false;
            that.loadApiDebuggerResult();
          }, 500, this);
        }
      }
    },
    startDebugApi() {
      const apiType = this.store.devConfDisplayVars.activeApiTabName;
      const apiParams = this.store.devConfDisplayVars.apiDebuggerParams[apiType];
      const apiResult = this.cache.apiDebuggerResult[apiType];
      if (apiType === libEnum.apiType.SCAN) {
        apiResult.sse = apiModule.startScanByUserParams(this.store.devConf, apiParams.chip, apiParams.filter_mac, apiParams.filter_name, apiParams.filter_rssi, (message) => {
          if (this.store.devConfDisplayVars.isApiScanResultDisplayOn) { // 追加到api扫描调试结果里面
            this.cache.apiDebuggerResult[libEnum.apiType.SCAN].resultList.push({time: Date.now(), data: message.data.trim()});
          }
        });
        setTimeout(() => {
          apiResult.sse.close();
          apiResult.sse = null;
          this.store.devConfDisplayVars.isApiScanning = false;
          notify('已自动停止API扫描', '操作成功', libEnum.messageType.SUCCESS);
        }, 10000);
        this.store.devConfDisplayVars.isApiScanning = true;
        this.store.devConfDisplayVars.activeApiOutputTabName = 'output'; // 切换到调试结果页面
        notify('调试API扫描自动执行10秒，正常的SSE会一直收到数据', '操作成功', libEnum.messageType.SUCCESS);
      } else if (apiType === libEnum.apiType.CONNECT) {
        apiModule.connectByDevConf(this.store.devConf, apiParams.deviceMac, apiParams.addrType).then(() => {
          // notify(`连接设备 ${deviceMac} 成功`, '操作成功', libEnum.messageType.SUCCESS);
          apiResult.resultList.push(`${new Date().toISOString()}: 连接设备成功, ${JSON.stringify(apiParams)}`);
        }).catch(ex => {
          notify(`连接设备 ${apiParams.deviceMac} 失败: ${ex}`, '操作失败', libEnum.messageType.ERROR);
          apiResult.resultList.push(`${new Date().toISOString()}: 连接设备失败, ${JSON.stringify({apiParams, ex})}`);
        });
      } else if (apiType === libEnum.apiType.READ) {
        apiModule.readByHandleByDevConf(this.store.devConf, apiParams.deviceMac, apiParams.handle).then(() => {
          notify(`读取数据 ${deviceMac} 成功`, '操作成功', libEnum.messageType.SUCCESS);
          apiResult.resultList.push(`${new Date().toISOString()}: 读取数据成功, ${JSON.stringify(apiParams)}`);
        }).catch(ex => {
          notify(`读取数据 ${apiParams.deviceMac} 失败: ${ex}`, '操作失败', libEnum.messageType.ERROR);
          apiResult.resultList.push(`${new Date().toISOString()}: 读取数据失败, ${JSON.stringify({apiParams, ex})}`);
        });
      } else if (apiType === libEnum.apiType.WRITE) {
        apiModule.writeByHandleByDevConf(this.store.devConf, apiParams.deviceMac, apiParams.handle, apiParams.value, apiParams.noresponse).then(() => {
          notify(`写入数据 ${deviceMac} 成功`, '操作成功', libEnum.messageType.SUCCESS);
          apiResult.resultList.push(`${new Date().toISOString()}: 写入数据成功, ${JSON.stringify(apiParams)}`);
        }).catch(ex => {
          notify(`写入数据 ${apiParams.deviceMac} 失败: ${ex}`, '操作失败', libEnum.messageType.ERROR);
          apiResult.resultList.push(`${new Date().toISOString()}: 写入数据失败, ${JSON.stringify({apiParams, ex})}`);
        });
      } else if (apiType === libEnum.apiType.DISCONNECT) {
        apiModule.disconnectByDevConf(this.store.devConf, apiParams.deviceMac).then(() => {
          notify(`断连设备 ${deviceMac} 成功`, '操作成功', libEnum.messageType.SUCCESS);
          apiResult.resultList.push(`${new Date().toISOString()}: 断连设备成功, ${JSON.stringify(apiParams)}`);
        }).catch(ex => {
          notify(`断连设备 ${apiParams.deviceMac} 失败: ${ex}`, '操作失败', libEnum.messageType.ERROR);
          apiResult.resultList.push(`${new Date().toISOString()}: 断连设备失败, ${JSON.stringify({apiParams, ex})}`);
        });
      }
    },
    openApiOutputDisplay() {
      this.store.devConfDisplayVars.isApiScanResultDisplayOn = true;
      notify('开启API结果成功', '操作成功', libEnum.messageType.SUCCESS);
    },
    closeApiOutputDisplay() {
      this.store.devConfDisplayVars.isApiScanResultDisplayOn = false;
      notify('关闭API结果成功', '操作成功', libEnum.messageType.SUCCESS);
    },
    exportApiOutputDisplay() {
      notify('功能待添加', '操作失败', libEnum.messageType.ERROR);
    },
    clearApiOutputDisplay() {
      const apiType = this.store.devConfDisplayVars.activeApiTabName;
      if (apiType === libEnum.apiType.SCAN) {
        this.cache.apiDebuggerResult[this.store.devConfDisplayVars.activeApiTabName].displayResultList.splice(0);
      }
      this.cache.apiDebuggerResult[this.store.devConfDisplayVars.activeApiTabName].resultList.splice(0);
      notify('清除API结果成功', '操作成功', libEnum.messageType.SUCCESS);
    },
    clearNotify() {
      this.cache.notifyResultList.splice(0);
      this.cache.notifyDisplayResultList.splice(0);
      notify('清除Notify成功', '操作成功', libEnum.messageType.SUCCESS);
    },
    openNotify() {
      notifyModule.startNotify();
      this.store.devConfDisplayVars.isNotifyOn = true;
      notify('开启Notify成功', '操作成功', libEnum.messageType.SUCCESS);
    },
    closeNotify() {
      notifyModule.stopNotify();
      this.store.devConfDisplayVars.isNotifyOn = false;
      notify('关闭Notify成功', '操作成功', libEnum.messageType.SUCCESS);
    },
    stopRssiChart() { // 停止图表
      clearInterval(globalVue.rssiChartUpdateInterval);
      globalVue.rssiChartUpdateInterval = null;
      this.store.devConfDisplayVars.rssiChartStopped = true;
    },
    startRssiChart() {
      globalVue.rssiChartUpdateInterval = createRssiChartUpdateInterval();
      this.store.devConfDisplayVars.rssiChartStopped = false;
    },
    destoryRssiChart() {
      clearInterval(globalVue.rssiChartUpdateInterval);
      globalVue.rssiChart = null;
      globalVue.rssiChartUpdateInterval = null;
      this.store.devConfDisplayVars.rssiChartSwitch = false;
    },
    destoryAndCreateRssiChart() { // 销毁重建图表
      if (!this.store.devConfDisplayVars.isScanning) {
        this.$confirm('此操作需要开启扫描, 是否继续?（请配置合适的扫描过滤参数，不超过5个设备，否则会自动暂停）', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => { // 点击确定
          this.startScan();
          this.destoryRssiChart();
          setTimeout(function(that) {
            globalVue.rssiChart = createRssiChart();
            globalVue.startRssiChart();
            notify('开启RSSI图表成功', '操作成功', libEnum.messageType.SUCCESS);
          }, 100);
          this.store.devConfDisplayVars.rssiChartSwitch = true;
        }).catch(() => { // 点击取消
               
        });
      } else {
        this.destoryRssiChart();
        setTimeout(function(that) {
          globalVue.rssiChart = createRssiChart();
          globalVue.startRssiChart();
          notify('开启RSSI图表成功', '操作成功', libEnum.messageType.SUCCESS);
        }, 100);
        this.store.devConfDisplayVars.rssiChartSwitch = true;
      }
    },
    connectedListTabRemove(index) {
      const deviceMac = this.cache.connectedList[index].mac;
      this.disconnectDevice(deviceMac);
    },
    rssiChartDataSpanChange() { // 统计间隔变化，重建图表
      if (this.devConfDisplayVars.rssiChartSwitch) {
        this.destoryAndCreateRssiChart();
      }
    },
    genCode() {
      let apiType = this.store.devConfDisplayVars.activeApiTabName;
      const apiParams = this.store.devConfDisplayVars.apiDebuggerParams[apiType];
      const apiResult = this.cache.apiDebuggerResult[apiType];
      apiResult.code[libEnum.codeType.CURL] = codeModule.genCode(apiType, libEnum.codeType.CURL, apiParams);
      apiResult.code[libEnum.codeType.NODEJS] = codeModule.genCode(apiType, libEnum.codeType.NODEJS, apiParams);
      this.store.devConfDisplayVars.activeApiOutputTabName = libEnum.codeType.CURL;
    },
    menuSelect(key, keyPath) {
      this.store.devConfDisplayVars.activeMenuItem = key;
      if (key === 'connectListMenuItem') { // 点击连接列表，重新加载连接列表，和连接SSE
        connectModule.loadConnectedList();
        connectModule.reopenConnectStatusSse();
      } else if (key === 'notifyListMenuItem') {
        this.$refs.refNotifyDisplayResultGrid.recalculate();
      } else if (key === 'scanListMenuItem') {
        this.$refs.refScanDisplayResultGrid.recalculate();
      }
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
      this.cache.scanResultList.splice(0); // 清空扫描缓存数据
      this.cache.scanDisplayResultList.splice(0); // 清空扫描展示数据
      this.cache.scanDevicesRssiHistory = {}; // 清空扫描历史rssi记录
      this.store.devConfDisplayVars.activeMenuItem = 'scanListMenuItem'; // 跳转扫描结果tab页面
      notify('开启扫描成功', '操作成功', libEnum.messageType.SUCCESS);
    },
    stopApiScan() {

    },
    stopScan() {
      scanModule.stopScan();
      if (this.store.devConfDisplayVars.rssiChartSwitch) { // 如果当前开启了rssi图表，停止
        this.stopRssiChart();
      }
      this.store.devConfDisplayVars.isScanning = false;
    },
    connectDevice(row, deviceMac) { // notify通过连接状态SSE通知
      setObjProperty(this.cache.devicesConnectLoading, deviceMac, true);
      apiModule.connectByDevConf(this.store.devConf, deviceMac).then(() => {
        // notify(`连接设备 ${deviceMac} 成功`, '设备连接成功', libEnum.messageType.SUCCESS);
        _.remove(this.cache.scanResultList, {mac: deviceMac});
        let removedList = _.remove(this.cache.scanDisplayResultList, {mac: deviceMac}); // 连接成功从扫描列表中移除
        this.$refs.refScanDisplayResultGrid.remove([row]);
        this.$refs.refScanDisplayResultGrid.refreshData();
        this.$refs.refScanDisplayResultGrid.recalculate();
        this.$refs.refScanDisplayResultGrid.refreshScroll();
        if (removedList.length > 0) {
          dbModule.listAddOrUpdate(this.cache.connectedList, {mac: removedList[0].mac}, { // 连接成功移到连接列表
            mac: removedList[0].mac,
            name: removedList[0].name,
            bdaddrType: removedList[0].bdaddrType,
          });
        }
      }).catch(ex => {
        notify(`连接设备 ${deviceMac} 失败: ${ex}`, '操作失败', libEnum.messageType.ERROR);
      }).then(() => {
        setObjProperty(this.cache.devicesConnectLoading, deviceMac, false);
      });
    },
    disconnectDevice(deviceMac) {
      apiModule.disconnectByDevConf(this.store.devConf, deviceMac).then(() => {
        _.remove(this.cache.connectedList, {mac: deviceMac});
        // CAUTION: 目前通过连接状态SSE发送通知，暂时不考虑SSE失败的情况
        // notify(`设备 ${deviceMac} 断开连接`, `操作成功`, libEnum.messageType.SUCCESS);
      }).catch(function(ex) {
        notify(`设备 ${deviceMac} 断连失败: ${ex}`, '操作失败', libEnum.messageType.ERROR);
      });
    },
    apiScanFilterNamesHandleClose(tag) {
      const filterName = this.store.devConfDisplayVars.apiDebuggerParams[libEnum.apiType.SCAN].filter_name;
      filterName.splice(filterName.indexOf(tag), 1);
    },
    apiScanFilterNamesShowInput() {
      this.store.devConfDisplayVars.apiScanFilterNamesInputVisible = true;
      this.$nextTick(_ => {
        this.$refs.apiScanFilterNamesSaveTagInput.$refs.input.focus();
      });
    },
    apiScanFilterNamesHandleInputConfirm() {
      let scanFilterNamesInputValue = this.store.devConfDisplayVars.apiScanFilterNamesInputValue;
      if (scanFilterNamesInputValue) {
        this.store.devConfDisplayVars.apiDebuggerParams[libEnum.apiType.SCAN].filter_name.push(scanFilterNamesInputValue);
      }
      this.store.devConfDisplayVars.apiScanFilterNamesInputVisible = false;
      this.store.devConfDisplayVars.apiScanFilterNamesInputValue = '';
    },

    apiScanFilterMacsHandleClose(tag) {
      const filterName = this.store.devConfDisplayVars.apiDebuggerParams[libEnum.apiType.SCAN].filter_mac;
      filterName.splice(filterName.indexOf(tag), 1);
    },
    apiScanFilterMacsShowInput() {
      this.store.devConfDisplayVars.apiScanFilterMacsInputVisible = true;
      this.$nextTick(_ => {
        this.$refs.apiScanFilterMacsSaveTagInput.$refs.input.focus();
      });
    },
    apiScanFilterMacsHandleInputConfirm() {
      let scanFilterMacsInputValue = this.store.devConfDisplayVars.apiScanFilterMacsInputValue;
      if (scanFilterMacsInputValue) {
        this.store.devConfDisplayVars.apiDebuggerParams[libEnum.apiType.SCAN].filter_mac.push(scanFilterMacsInputValue);
      }
      this.store.devConfDisplayVars.apiScanFilterMacsInputVisible = false;
      this.store.devConfDisplayVars.apiScanFilterMacsInputValue = '';
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

  let devicesCount = _.keys(dbModule.getCache().scanDevicesRssiHistory).length;
  if (devicesCount > 5) {
    globalVue.destoryRssiChart();
    return notify(`当前扫描设备数量超过5个，已自动关闭rssi图表，请配置合适的扫描过滤参数，防止卡顿`, '操作失败', libEnum.messageType.ERROR);
  }
  _.forEach(dbModule.getCache().scanDevicesRssiHistory, (rssiHistory, deviceMac) => {
    let rssiData = new Array(devConfDisplayVars.rssiChartDataCount); // 每100毫秒时为一个时刻点
    _.remove(rssiHistory, rssiItem => { // 移除本周期之前的数据
      return rssiItem.time < periodStartTime;
    });
    _.forEach(rssiHistory, rssiItem => { // 填充到待渲染的数据里面
      if (rssiItem.time >= periodStartTime && rssiItem.time < periodEndTime) {
        let rssiDataIndex = parseInt((rssiItem.time - periodStartTime) / devConfDisplayVars.rssiChartDataSpan);
        rssiData[rssiDataIndex] = rssiItem.rssi;
      }
    });
    series.push({
      name: deviceMac,
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
    globalVue.rssiChart.setOption({series: seriesData});
    globalVue.rssiChart.resize();
  }, devConfDisplayVars.rssiChartDataSpan);
}

function createHighlightUserCmd() {
  Vue.directive('highlightjs', {
    deep: true,
    bind: function bind(el, binding) {
      // on first bind, highlight all targets
      var targets = el.querySelectorAll('code');
      var target;
      var i;

      for (i = 0; i < targets.length; i += 1) {
        target = targets[i];

        if (typeof binding.value === 'string') {
          // if a value is directly assigned to the directive, use this
          // instead of the element content.
          target.textContent = binding.value;
        }

        hljs.highlightBlock(target);
      }
    },
    componentUpdated: function componentUpdated(el, binding) {
      // after an update, re-fill the content and then highlight
      var targets = el.querySelectorAll('code');
      var target;
      var i;

      for (i = 0; i < targets.length; i += 1) {
        target = targets[i];
        if (typeof binding.value === 'string') {
          target.textContent = binding.value;
          hljs.highlightBlock(target);
        }
      }
    },
  });
}

function createVue(divId) {
  createHighlightUserCmd();

  globalVue = new Vue({
    el: `#${divId}`,
    methods: createVueMethods(),
    data: createVueData(),
    mounted() {
      // hljs.initHighlightingOnLoad();
    },
    watch: {
      'cache.apiDebuggerResult.scanCodeCurl': function(val, oldVal) {
        initHighlightingRefresh();
      },
      'store.devConf': { // 配置变化，重新加载初始化操作
        handler: function(val, oldVal) {
          dbModule.saveDevConf(val);
        },
        deep: true
      }
    },
    computed: {
      getComputedNotifyDisplayResultList () { // 全局搜索扫描列表
        const filterName = XEUtils.toString(this.cache.notifyDisplayFilterContent).trim().toLowerCase()
        if (filterName) {
          const filterRE = new RegExp(filterName, 'gi')
          const searchProps = ['mac', 'name']
          const rest = this.cache.notifyDisplayResultList.filter(item => searchProps.some(key => XEUtils.toString(item[key]).toLowerCase().indexOf(filterName) > -1))
          return rest.map(row => {
            const item = Object.assign({}, row)
            searchProps.forEach(key => {
              item[key] = XEUtils.toString(item[key]).replace(filterRE, match => `<span class="keyword-lighten">${match}</span>`)
            })
            return item
          })
        }
        return this.cache.notifyDisplayResultList
      },
      getComputedScanDisplayResultList () { // 全局搜索扫描列表
        const filterName = XEUtils.toString(this.cache.scanDisplayFilterContent).trim().toLowerCase()
        if (filterName) {
          const filterRE = new RegExp(filterName, 'gi')
          const searchProps = ['mac', 'name']
          const rest = this.cache.scanDisplayResultList.filter(item => searchProps.some(key => XEUtils.toString(item[key]).toLowerCase().indexOf(filterName) > -1))
          return rest.map(row => {
            const item = Object.assign({}, row)
            searchProps.forEach(key => {
              item[key] = XEUtils.toString(item[key]).replace(filterRE, match => `<span class="keyword-lighten">${match}</span>`)
            })
            return item
          })
        }
        return this.cache.scanDisplayResultList
      }
    }
  });

  // 定时从扫描结果池中取出指定数量结果更新到界面上
  setInterval(function() {
    const pageCount = 20;
    let pageList = dbModule.getCache().scanResultList.splice(0, pageCount);
    if (!pageList || pageList.length <= 0) return;
    _.forEach(pageList, item => {
      let result = _.find(dbModule.getCache().scanDisplayResultList, {mac: item.mac});
      if (!result) {
        dbModule.getCache().scanDisplayResultList.push(item);
      } else {
        result.rssi = item.rssi;
        if (result.name === '(unknown)') {
          result.name = item.name;
        }
      }
    });
  }, 500);

  // 定时从设备通知列表池中取出指定数量结果更新到界面上
  setInterval(function() {
    const pageCount = 20;
    let pageList = dbModule.getCache().notifyResultList.splice(0, pageCount);
    if (!pageList || pageList.length <= 0) return;
    let index = dbModule.getCache().notifyDisplayResultList.length;
    dbModule.getCache().notifyDisplayResultList.splice(index, pageList.length, ...pageList);
  }, 500);
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
