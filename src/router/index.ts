import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'MembersLive',
    component: () => import(/* webpackChunkName: "about" */ '../views/MemberLive.vue'),
  },
  {
    path: '/open-live',
    name: 'OpenLive',
    component: () => import(/* webpackChunkName: "about" */ '../views/OpenLive.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
