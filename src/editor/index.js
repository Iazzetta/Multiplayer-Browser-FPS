import Vue from "vue/dist/vue.esm.js";
import store from "./store/store";

// @ts-ignore
import App from "./App.vue";

new Vue({
    store,
    components: { App }
}).$mount("#app");
