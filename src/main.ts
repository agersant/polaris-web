import { createPinia } from "pinia";
import { createApp } from "vue";
import router from "./router";
import EntryPoint from "@/components/EntryPoint.vue";
import "./fonts.css";
import "./index.css";

createApp(EntryPoint).use(createPinia()).use(router).mount("#vue-container");
