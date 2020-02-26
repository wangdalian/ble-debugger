import libEnum from '../lib/enum.js';
import apiModule from './api.js';
import dbModule from './db.js';
import vueModule from './vue.js';

function loadConnectedList() {
  const devConf = dbModule.getDevConf();
  apiModule.getConnectedListByDevConf(devConf).then((data) => {
    const cache = dbModule.getCache();
    cache.connectedList = _.map(data.nodes, item => {
      return {
        name: item.name || '(unknown)',
        mac: item.id, 
        bdaddrType: item.type, 
        chip: item.chipId
      };
    });
  });
}

// 更新扫描结果
// {handle: "CB:76:B8:B2:65:6E", chipId: 0, connectionState: "connected"}
function connectStatusSseMessageHandler(message) {
  const cache = dbModule.getCache();
  const data = JSON.parse(message.data);
  if (data.connectionState === 'connected') { // 更新连接信息里面的chip
    dbModule.listAddOrUpdate(dbModule.getCache().connectedList, {mac: data.handle}, {
      mac: data.handle,
      chip: data.chipId
    });
    vueModule.notify(`chip${data.chipId} 连接${data.handle}成功`, `操作成功`, libEnum.messageType.SUCCESS);
  } else if (data.connectionState === 'disconnected') { // 断连移除
    _.remove(cache.connectedList, {mac: data.handle});
    vueModule.notify(`设备 ${data.handle} 断开连接`, '通知提示', libEnum.messageType.WARNING);
  }
}

function connectStatusSseErrorHandler(error) {
  logger.error('connect status sse error:', error);
  vueModule.notify(`连接状态SSE异常: ${error}`, '服务异常', libEnum.messageType.ERROR);
}

function openConnectStatusSse() {
  const devConf = dbModule.getDevConf();
  apiModule.openConnectStatusSseByDevConf(devConf, connectStatusSseMessageHandler, connectStatusSseErrorHandler);
}

export default {
  loadConnectedList,
  openConnectStatusSse,
}