/*
 * @Version: 2.0
 * @Autor: xieyan
 * @Date: 2021-06-12 16:44:00
 * @LastEditors: xieyan
 * @LastEditTime: 2021-06-17 11:53:12
 */
import Vue from 'vue';
import Router from 'vue-router';
import _import from './_import';
Vue.use(Router);
export default new Router({
   routes: [
       {
           path: '/home',
           name: 'home',
           component: _import('Home')
       },
       {
           path: '/room',
            name: 'Room',
            component: _import('Room')
       },
       {
           path: '/',
           name: 'entry',
           component: _import('Entry')
       }
   ] 
});