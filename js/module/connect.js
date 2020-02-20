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
        bdAddrType: item.type, 
        chip: item.chipId
      };
    });
  });
}

export default {
  loadConnectedList,
}