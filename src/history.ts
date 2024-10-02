import { useScroll, watchThrottled, whenever, } from "@vueuse/core";
import { MaybeRef, Ref, toRaw, WatchSource, } from "vue";
import { useScrollSizeObserver } from "vue-use-scroll-size-observer";

export interface HistoryValue {
    save: () => any,
    restore: (v: any) => void,
    restoreWhen?: (v: any) => WatchSource,
}

export function saveScrollState(el: MaybeRef<HTMLElement | null>): HistoryValue {
    const { y: scrollY } = useScroll(el);
    const { scrollHeight } = useScrollSizeObserver(el);
    return {
        save: () => [scrollY.value, scrollHeight.value],
        restore: ([y, h]) => scrollY.value = y,
        restoreWhen: ([y, h]) => () => scrollHeight.value >= h,
    };
}

export function useHistory(key: string, values: (Ref | HistoryValue)[]) {

    let pendingRestores = 0;

    const watchSources = values.map(r => {
        if ("save" in r) {
            return () => r.save();
        } else {
            return r;
        }
    });

    watchThrottled(watchSources, () => {
        if (pendingRestores > 0) {
            return;
        }
        const state = values.map(r => {
            if ("save" in r) {
                return r.save();
            } else {
                return toRaw(r.value);
            }
        });
        history.replaceState({ ...history.state, [key]: state }, "");
    }, { throttle: 500 });


    const state = history.state[key] as any[] | undefined;
    if (!state) {
        return false;
    }

    pendingRestores = values.length;
    for (let [i, v] of state.entries()) {
        const r = values[i];
        if ("restore" in r) {
            if (r.restoreWhen) {
                whenever(r.restoreWhen(v), () => {
                    pendingRestores -= 1;
                    r.restore(v);
                }, { once: true });
            } else {
                pendingRestores -= 1;
                r.restore(v);
            }
        } else {
            pendingRestores -= 1;
            r.value = v;
        }
    }

    return true;
}
