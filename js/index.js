
import vueModule from './module/vue.js';
import connectModule from './module/connect.js';
import dbModule from './module/db.js';

function main() {
  // dbModule.loadStorage(); // 加载缓存
  vueModule.createVue('app');
  Vue.nextTick(function() {
    hljs.initHighlightingOnLoad();
  });
  connectModule.loadConnectedList();
  connectModule.openConnectStatusSse();
}

main();