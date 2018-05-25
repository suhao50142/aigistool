import Vue from 'vue'
import axios from 'axios'
import ElementUI from 'element-ui';
import App from './App'
import router from './router'
import store from './store'
import vue_electron from 'vue-electron';
import path from 'path';
import { ipcRenderer as ipc, remote } from "electron";
import 'element-ui/lib/theme-chalk/index.css';
import '@/assets/css/theme/teal/index.css';
import '@/assets/css/theme/blue/index.css';
import '@/assets/css/theme/purple/index.css';
import '@/assets/common.scss';

if (!process.env.IS_WEB) Vue.use(vue_electron)

Vue.use(ElementUI);
Vue.bw=Vue.prototype.$bw=remote.BrowserWindow;
Vue.ipc = Vue.prototype.$ipc = ipc
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
