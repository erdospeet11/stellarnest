<script lang="ts">
    import { onMount } from "svelte";
    import { items, boardTransform } from "./store";
    import BoardItem from "./BoardItem.svelte";
    import type { Item, ItemType } from "./store.ts";

    let canvasRef: HTMLDivElement;
    let isPanning = false;
    let panStart = { x: 0, y: 0 };

    let draggingItemId: string | null = null;
    let dragStart = { x: 0, y: 0 };
    let itemStart = { x: 0, y: 0 };

    let resizingItemId: string | null = null;
    let resizeStart = { x: 0, y: 0 };
    let itemSizeStart = { w: 0, h: 0 };
    let resizeHandle: string = "";

    let selectedItemId: string | null = null;

    let _items: Item[] = [];
    items.subscribe((val) => (_items = val));

    let _transform = { x: 0, y: 0, scale: 1 };
    boardTransform.subscribe((val) => (_transform = val));

    function onMouseDown(e: MouseEvent) {
        if (
            e.target !== canvasRef &&
            (e.target as HTMLElement).closest(".board-item")
        )
            return;

        if (e.button === 0 || e.button === 1) {
            selectedItemId = null;
            isPanning = true;
            panStart = {
                x: e.clientX - _transform.x,
                y: e.clientY - _transform.y,
            };
            e.preventDefault();
        }
    }

    function onMouseMove(e: MouseEvent) {
        // 1. Panning
        if (isPanning) {
            boardTransform.update((t) => ({
                ...t,
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y,
            }));
            return;
        }

        if (draggingItemId) {
            const dx = (e.clientX - dragStart.x) / _transform.scale;
            const dy = (e.clientY - dragStart.y) / _transform.scale;

            items.update((all) =>
                all.map((item) => {
                    if (item.id === draggingItemId) {
                        return {
                            ...item,
                            x: itemStart.x + dx,
                            y: itemStart.y + dy,
                        };
                    }
                    return item;
                }),
            );
            return;
        }

        if (resizingItemId) {
            const dx = (e.clientX - resizeStart.x) / _transform.scale;
            const dy = (e.clientY - resizeStart.y) / _transform.scale;

            items.update((all) =>
                all.map((item) => {
                    if (item.id === resizingItemId) {
                        let newW = item.w;
                        let newH = item.h;
                        if (resizeHandle === "se") {
                            newW = Math.max(100, itemSizeStart.w + dx);
                            newH = Math.max(100, itemSizeStart.h + dy);
                        } else if (resizeHandle === "e") {
                            newW = Math.max(100, itemSizeStart.w + dx);
                        } else if (resizeHandle === "s") {
                            newH = Math.max(100, itemSizeStart.h + dy);
                        }
                        return { ...item, w: newW, h: newH };
                    }
                    return item;
                }),
            );
        }
    }

    function onMouseUp() {
        isPanning = false;
        draggingItemId = null;
        resizingItemId = null;
    }

    function onWheel(e: WheelEvent) {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const zoomSensitivity = 0.001;
            const delta = -e.deltaY * zoomSensitivity;
            const newScale = Math.min(
                Math.max(0.1, _transform.scale + delta),
                5,
            );
            boardTransform.update((t) => ({ ...t, scale: newScale }));
        } else {
            boardTransform.update((t) => ({
                ...t,
                x: t.x - e.deltaX,
                y: t.y - e.deltaY,
            }));
        }
    }

    function handleItemDragStart(event: CustomEvent) {
        const { e, id } = event.detail;
        draggingItemId = id;
        selectedItemId = id;
        dragStart = { x: e.clientX, y: e.clientY };
        const item = _items.find((i) => i.id === id);
        if (item) {
            itemStart = { x: item.x, y: item.y };
        }
    }

    function handleItemResizeStart(event: CustomEvent) {
        const { e, id, handle } = event.detail;
        resizingItemId = id;
        resizeHandle = handle;
        resizeStart = { x: e.clientX, y: e.clientY };
        const item = _items.find((i) => i.id === id);
        if (item) {
            itemSizeStart = { w: item.w, h: item.h };
        }
    }

    function handleItemUpdate(event: CustomEvent) {
        const updatedItem = event.detail;
        items.update((all) =>
            all.map((i) => (i.id === updatedItem.id ? updatedItem : i)),
        );
    }

    function onDragOver(e: DragEvent) {
        e.preventDefault();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    }

    function onDrop(e: DragEvent) {
        e.preventDefault();
        const type = e.dataTransfer?.getData("type") as ItemType;
        if (!type) return;

        const rect = canvasRef.getBoundingClientRect();
        const x = (e.clientX - rect.left - _transform.x) / _transform.scale;
        const y = (e.clientY - rect.top - _transform.y) / _transform.scale;

        let w = 240,
            h = 160;
        let content = "";

        if (type === "image") {
            w = 300;
            h = 220;
            content = "https://picsum.photos/300/220";
        } else if (type === "note") {
            content = "New Note";
        }

        const newItem: Item = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            x: x - w / 2,
            y: y - h / 2,
            w,
            h,
            content,
            zIndex: _items.length + 1,
        };

        items.update((i) => [...i, newItem]);
        selectedItemId = newItem.id;
    }
</script>

<svelte:window on:mousemove={onMouseMove} on:mouseup={onMouseUp} />

<div
    class="canvas-container"
    bind:this={canvasRef}
    on:mousedown={onMouseDown}
    on:wheel|nonpassive={onWheel}
    on:dragover={onDragOver}
    on:drop={onDrop}
    role="presentation"
>
    <!-- Grid Background -->
    <div
        class="grid-layer"
        style="
           background-position: {_transform.x}px {_transform.y}px;
           background-size: {20 * _transform.scale}px {20 * _transform.scale}px;
        "
    ></div>

    <!-- Content Layer -->
    <div
        class="content-layer"
        style="transform: translate({_transform.x}px, {_transform.y}px) scale({_transform.scale}); transform-origin: 0 0;"
    >
        {#each _items as item (item.id)}
            <BoardItem
                {item}
                selected={item.id === selectedItemId}
                on:itemDragStart={handleItemDragStart}
                on:itemResizeStart={handleItemResizeStart}
                on:itemUpdate={handleItemUpdate}
            />
        {/each}
    </div>
</div>

<style>
    .canvas-container {
        flex: 1;
        position: relative;
        background-color: var(--bg-color);
        overflow: hidden;
        cursor: default;
        height: 100%;
        width: 100%;
    }

    .grid-layer {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        background-image: radial-gradient(
            var(--grid-color) 1.5px,
            transparent 1.5px
        );
        opacity: 0.8;
    }

    .content-layer {
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
    }
</style>
