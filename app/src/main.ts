import './index.css';

import { createApp } from 'vue';
import VueCookies from 'vue-cookies';

import App from './App.vue';

createApp(App).use(VueCookies).mount('#app');
