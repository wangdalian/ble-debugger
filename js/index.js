
import vueModule from './module/vue.js';
import connectModule from './module/connect.js';
import dbModule from './module/db.js';
import notifyModule from './module/notify.js';

function main() {
  // dbModule.loadStorage(); // 加载缓存
  vueModule.createVue('app');
  connectModule.loadConnectedList();
  connectModule.openConnectStatusSse();
  const devConf = dbModule.getDevConf();
  notifyModule.startNotify(devConf);
}

main();