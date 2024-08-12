import Aura from '@primevue/themes/aura';
import { createPinia } from "pinia";
import PrimeVue from 'primevue/config';
import { definePreset } from '@primevue/themes';
import { createApp } from "vue";

import EntryPoint from "@/components/EntryPoint.vue";
import { usePreferencesStore } from "@/stores/preferences";
import router from "./router";

import "material-icons/iconfont/material-icons.css";
import "./style.css";

const MyPreset = definePreset(Aura, {
    components: {
        menu: { submenuLabel: { fontWeight: 500, } },
    },
});

createApp(EntryPoint)
    .use(createPinia())
    .use(router)
    .use(PrimeVue, { theme: { preset: MyPreset } })
    .mount("#vue-container");

usePreferencesStore();
