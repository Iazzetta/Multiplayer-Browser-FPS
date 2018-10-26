import Vue from "vue";
// @ts-ignore
import App from "./App.vue";

new Vue({
    components: { App },
    render: h => h(App)
}).$mount("#editor");
