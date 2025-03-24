import "./assets/main.css";
import { supabase } from "./services/supabase";
import OneSignal from "onesignal-cordova-plugin";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { Capacitor } from "@capacitor/core";

const app = createApp(App);

app.use(createPinia());
app.use(router);

if (Capacitor.getPlatform() === "ios") {
    OneSignal.initialize("c19f1128-54dd-4667-82aa-b3d95bc55f4a");
}

app.mount("#app");
