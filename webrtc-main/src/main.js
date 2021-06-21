/*
 * @Version: 2.0
 * @Autor: xieyan
 * @Date: 2021-06-12 16:39:58
 * @LastEditors: xieyan
 * @LastEditTime: 2021-06-12 17:24:18
 */
import Vue from 'vue';
import App from './App.vue';
import router from './router';
import socket from './utils/socket';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.use(ElementUI);

socket.on('connect', () => {
    console.log('连接成功')
})

socket.on('disconnect', () => {
    console.log('连接断开了')
})

Vue.config.productionTip = false;
// Vue.protoType.$bus = new Vue();
new Vue({
    router,
    render: h => h(App)
}).$mount('#app');