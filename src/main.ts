import { createPinia } from "pinia";
import { createApp } from "vue";
import VueApexCharts from "vue3-apexcharts";

import setupBroadcasts from "./broadcast";
import EntryPoint from "@/components/EntryPoint.vue";
import { usePreferencesStore } from "@/stores/preferences";
import router from "./router";

import "material-icons/iconfont/round.css";
import "./style.css";

createApp(EntryPoint)
    .use(createPinia())
    .use(router)
    .use(VueApexCharts)
    .mount("#vue-container");

usePreferencesStore();
setupBroadcasts();
