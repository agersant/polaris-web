// src/composables/useKeyboardNavigation.ts
import { onMounted, onUnmounted } from "vue";
import router from "@/router";

export function useKeyboardNavigation() {
    onMounted(() => {
        window.addEventListener("keydown", handleKeydown);
    });

    onUnmounted(() => {
        window.removeEventListener("keydown", handleKeydown);
    });

    const handleKeydown = (event: KeyboardEvent) => {
        if (event.ctrlKey) {
            let route;
            switch (event.key) {
                case "1":
                case "f":
                    route = "/files";
                    break;
                case "2":
                case "g":
                    route = "/genres";
                    break;
                case "3":
                case "a":
                    route = "/artists";
                    break;
                case "4":
                case "l":
                    route = "/albums";
                    break;
                case "5":
                case "p":
                    route = "/playlists";
                    break;
                case "6":
                case "s":
                    route = "/search";
                    break;
                case "7":
                case ".":
                    route = "/settings";
                    break;
                default:
                    break;
            }

            if (route) {
                router.push(route);
            }

            event.preventDefault();
        }
    };
}
