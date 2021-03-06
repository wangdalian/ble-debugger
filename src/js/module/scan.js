import libEnum from '../lib/enum.js';
import libLogger from '../lib/logger.js';
import api from './api.js';
import dbModule from './db.js';
import vueModule from './vue.js';

const logger = libLogger.genModuleLogger('scan');

let sse = null;

// 更新扫描结果
function scanSseMessageHandler(message) {
  const cache = dbModule.getCache();
  const store = dbModule.getStorage();
  
  const data = JSON.parse(message.data);
  const deviceAddr = data.bdaddrs[0];
  const deviceMac = deviceAddr.bdaddr;
  const deviceAddrType = deviceAddr.bdaddrType;
  // logger.info('scan sse message:', message);

  // 更新扫描结果
  let result = _.find(cache.scanResultList, {mac: deviceMac});
  if (!result) {
    cache.scanResultList.push({
      mac: deviceMac, 
      name: data.name,
      adData:  data.adData,
      bdaddrType: deviceAddrType,
      rssi: data.rssi,
    });
  } else {
    if (data.name !== '(unknown)') result.name = data.name;
    result.rssi = data.rssi;
  }

  // 记录历史rssi
  if (!store.devConfDisplayVars.rssiChartSwitch) return; // 没有开启rssi图表则不记录数据
  if (!cache.scanDevicesRssiHistory[deviceMac]) {
    vueModule.setObjProperty(cache.scanDevicesRssiHistory, deviceMac, [{time: Date.now(), rssi: data.rssi}]);
  } else {
    cache.scanDevicesRssiHistory[deviceMac].push({time: Date.now(), rssi: data.rssi});
  }
}

function scanSseErrorHandler(error) {
  logger.error('scan sse error:', error);
  vueModule.notify(`停止扫描，扫描SSE异常: ${error.message || JSON.stringify(error)}`, `服务异常`, libEnum.messageType.ERROR);
  sse.close();
  sse = null;
}

// 保存配置 -> 启动扫描
function startScan(devConf) {
  if (sse) return sse;
  sse = api.startScanByDevConf(devConf, scanSseMessageHandler, scanSseErrorHandler);
  return sse;
}

function stopScan() {
  if (sse) {
    sse.close();
    sse = null;
  }
  vueModule.notify('停止扫描成功', '操作成功', libEnum.messageType.SUCCESS);
}

export default {
  startScan,
  stopScan,
}