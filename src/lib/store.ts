import { writable } from 'svelte/store';

export type ItemType = 'note' | 'image' | 'video' | 'link' | 'todo';

export interface Item {
    id: string;
    type: ItemType;
    x: number;
    y: number;
    w: number;
    h: number;
    content: string;
    title?: string;
    zIndex: number;
}

const initialItems: Item[] = [];
const STORAGE_KEY = 'stellarnest_data';

let savedData = { items: initialItems, transform: { x: 0, y: 0, scale: 1 } };
if (typeof localStorage !== 'undefined') {
    const json = localStorage.getItem(STORAGE_KEY);
    if (json) {
        try {
            savedData = JSON.parse(json);
        } catch (e) {
            console.error("Failed to parse local storage", e);
        }
    }
}

export const items = writable<Item[]>(savedData.items || []);

export const boardTransform = writable(savedData.transform || {
    x: 0,
    y: 0,
    scale: 1
});

if (typeof localStorage !== 'undefined') {
    items.subscribe(value => {
        savedData.items = value;
        save();
    });

    boardTransform.subscribe(value => {
        savedData.transform = value;
        save();
    });
}

function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));
}
