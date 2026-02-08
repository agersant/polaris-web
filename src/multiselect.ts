import { computed, ComputedRef, MaybeRefOrGetter, Ref, ref, toValue } from "vue";

interface Item { key: string | number };

class Multiselect<T extends Item> {
    items: MaybeRefOrGetter<T[]>;
    options: MultiselectOptions;
    selectedKeys: Ref<Set<string | number>> = ref(new Set());
    focusedKey: Ref<string | number | undefined> = ref();
    pivotKey: Ref<string | number | undefined> = ref();
    selection: ComputedRef<T[]>;

    constructor(items: MaybeRefOrGetter<T[]>, options: MultiselectOptions) {
        this.items = items;
        this.options = options;
        this.selection = computed(() => {
            let keys = this.selectedKeys.value;
            return toValue(items).filter(i => keys.has(i.key));
        });
    }

    selectItem(item: T) {
        this.selectedKeys.value.clear();
        this.selectedKeys.value.add(item.key);
        this.pivotKey.value = item.key;
        this.focusedKey.value = item.key;
    }

    clickItem(event: MouseEvent, item: T) {

        this.focusedKey.value = item.key;

        const pivotIndex = this.pivotKey ? toValue(this.items).findIndex(i => i.key == this.pivotKey.value) : -1;

        if (event.shiftKey && pivotIndex >= 0) {
            const clickedIndex = toValue(this.items).findIndex(i => i.key == item.key);
            const from = Math.min(pivotIndex, clickedIndex);
            const to = Math.max(pivotIndex, clickedIndex);

            if (event.ctrlKey) {
                for (let i = from; i <= to; i++) {
                    const keyIter = toValue(this.items)[i].key;
                    this.selectedKeys.value.add(keyIter);
                }
            } else {
                this.selectedKeys.value.clear();
                for (let i = from; i <= to; i++) {
                    const keyIter = toValue(this.items)[i].key;
                    if (this.selectedKeys.value.has(keyIter)) {
                        this.selectedKeys.value.delete(keyIter);
                    } else {
                        this.selectedKeys.value.add(keyIter);
                    }
                }
            }

        } else if (event.ctrlKey) {
            if (this.selectedKeys.value.has(item.key)) {
                this.selectedKeys.value.delete(item.key);
                this.pivotKey.value = undefined;
            } else {
                this.selectedKeys.value.add(item.key);
                this.pivotKey.value = item.key;
            }
        } else {
            this.selectItem(item);
        }
    }

    onKeyDown(event: KeyboardEvent) {
        switch (event.code) {
            case 'ArrowUp':
                this.move(event, -1);
                event.preventDefault();
                break;
            case 'ArrowDown':
                this.move(event, 1);
                event.preventDefault();
                break;
            case 'PageUp':
                this.move(event, -10);
                event.preventDefault();
                break;
            case 'PageDown':
                this.move(event, 10);
                event.preventDefault();
                break;
            case 'Home':
                this.move(event, Number.NEGATIVE_INFINITY);
                event.preventDefault();
                break;
            case 'End':
                this.move(event, Number.POSITIVE_INFINITY);
                event.preventDefault();
                break;
            case 'Escape':
                this.selectedKeys.value.clear();
                this.focusedKey.value = undefined;
                this.pivotKey.value = undefined;
                break;
            case 'KeyA':
                if (event.ctrlKey) {
                    this.selectedKeys.value = new Set(toValue(this.items).map(i => i.key));
                    this.focusedKey.value = toValue(this.items)[0]?.key;
                    this.pivotKey.value = this.focusedKey.value;
                }
                event.preventDefault();
                event.stopImmediatePropagation();
                break;
            default:
                break;
        }
    }

    move(event: KeyboardEvent, delta: number) {
        if (delta == 0) {
            return;
        }

        const pivotIndex = toValue(this.items).findIndex(i => i.key == this.pivotKey.value);
        const fromIndex = Math.max(0, Math.min(toValue(this.items).findIndex(item => item.key == this.focusedKey.value), toValue(this.items).length - 1));
        const toIndex = Math.max(0, Math.min(fromIndex + delta, toValue(this.items).length - 1));
        const toItem = toValue(this.items)[toIndex];

        if (!event.shiftKey || pivotIndex < 0) {
            this.selectedKeys.value.clear();
            this.selectedKeys.value.add(toItem.key);
            this.pivotKey.value = toItem.key;
        } else {
            for (let index = fromIndex; true; index += Math.sign(delta)) {
                if ((delta > 0 && index > pivotIndex) || (delta < 0 && index < pivotIndex)) {
                    this.selectedKeys.value.add(toValue(this.items)[index].key);
                } else if (index != pivotIndex && index != toIndex) {
                    this.selectedKeys.value.delete(toValue(this.items)[index].key);
                }
                if (index == toIndex) {
                    break;
                }
            }
        }

        this.focusedKey.value = toItem.key;
        if (this.options.onMove) {
            this.options.onMove();
        }
    }
}

export interface MultiselectOptions {
    onMove?: () => void,
}

export default function useMultiselect<T extends Item>(items: MaybeRefOrGetter<T[]>, options?: MultiselectOptions) {
    const multiselect = new Multiselect(items, options || {});

    return {
        multiselect,
        focusedKey: multiselect.focusedKey,
        selectedKeys: multiselect.selectedKeys,
        pivotKey: multiselect.pivotKey,
        selection: multiselect.selection,

        clickItem: (event: MouseEvent, item: T) => multiselect.clickItem(event, item),
        move: (event: KeyboardEvent, delta: number) => multiselect.move(event, delta),
        onKeyDown: (event: KeyboardEvent) => multiselect.onKeyDown(event),
        selectItem: (item: T) => multiselect.selectItem(item),
    }
}
