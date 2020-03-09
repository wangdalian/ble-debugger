
import Vue from 'vue';
import './plugins/element.js';
import 'xe-utils';
import VXETable from 'vxe-table';
import 'vxe-table/lib/index.css';
import VueHighlightJS from 'vue-highlight.js'
import bash from 'highlight.js/lib/languages/bash';
import javascript from 'highlight.js/lib/languages/javascript';
import 'highlight.js/styles/default.css';
import ECharts from 'vue-echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/legendScroll';
import 'echarts/lib/component/legend';
import App from './App.vue';

let globalVue = null;

function registerComponent() {
  Vue.use(VXETable);
  Vue.use(VueHighlightJS, {
    languages: {javascript, bash}
  });
  Vue.component('v-chart', ECharts);
}

function getGlobalVue() {
  return globalVue;
}

function setObjProperty(obj, key, value) {
  getGlobalVue().$set(obj, key, value);
}

(function main() {
  registerComponent();
  globalVue = new Vue({
    el: '#app',
    render: h => h(App)
  });
})();

export default {
  getGlobalVue,
  setObjProperty,
};
