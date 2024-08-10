import Aura from '@primevue/themes/aura';
import { createPinia } from "pinia";
import PrimeVue from 'primevue/config';
import { createApp } from "vue";

import EntryPoint from "@/components/EntryPoint.vue";
import { usePreferencesStore } from "@/stores/preferences";
import router from "./router";

import "./style.css";

createApp(EntryPoint)
    .use(createPinia())
    .use(router)
    .use(PrimeVue, { theme: { preset: Aura } })
    .mount("#vue-container");

usePreferencesStore();
