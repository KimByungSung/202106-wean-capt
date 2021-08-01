import Vue from 'vue'
import App from './App.vue'
import mixins from './mixins'
// import VideoPlayer from 'vue-videojs7'
// Vue.use(VideoPlayer);

Vue.config.productionTip = false
Vue.mixin(mixins)

window.$vm = new Vue({
  render: h => h(App),
}).$mount('#app')
