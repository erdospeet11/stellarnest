import { writable } from 'svelte/store';

export type ItemType = 'note' | 'image' | 'video' | 'link' | 'todo';

export interface Item {
    id: string;
    type: ItemType;
    x: number;
    y: number;
    w: number;
    h: number;
    content: string; // text content or image url
    title?: string;
    zIndex: number;
}

const initialItems: Item[] = [];

export const items = writable<Item[]>(initialItems);

export const boardTransform = writable({
    x: 0,
    y: 0,
    scale: 1
});
