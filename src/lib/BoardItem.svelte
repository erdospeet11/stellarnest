<script lang="ts">
    import { createEventDispatcher, tick } from "svelte";
    import type { Item } from "./store";

    export let item: Item;
    export let selected = false;

    const dispatch = createEventDispatcher();

    let isEditing = false;
    let textareaEl: HTMLTextAreaElement;

    $: if (!selected) {
        isEditing = false;
    }

    function onMouseDown(e: MouseEvent) {
        if (e.button !== 0) return;

        e.stopPropagation();
        dispatch("itemDragStart", { e, id: item.id });
    }

    async function onDoubleClick(e: MouseEvent) {
        if (item.type === "note") {
            e.stopPropagation();
            isEditing = true;
            await tick();
            textareaEl?.focus();
        }
    }

    function onResizeStart(e: MouseEvent, handle: string) {
        e.stopPropagation();
        dispatch("itemResizeStart", { e, id: item.id, handle });
    }

    function onInputClick(e: MouseEvent) {
        if (isEditing) {
            e.stopPropagation();
        }
    }
</script>

<div
    class="board-item {item.type} {selected ? 'selected' : ''}"
    style="
    left: {item.x}px; 
    top: {item.y}px; 
    width: {item.w}px; 
    height: {item.h}px; 
    z-index: {item.zIndex};
  "
    role="group"
    aria-label="Board Item"
    on:mousedown={onMouseDown}
    on:dblclick={onDoubleClick}
>
    {#if selected}
        <div
            class="resize-handle n"
            on:mousedown={(e) => onResizeStart(e, "n")}
        ></div>
        <div
            class="resize-handle e"
            on:mousedown={(e) => onResizeStart(e, "e")}
        ></div>
        <div
            class="resize-handle s"
            on:mousedown={(e) => onResizeStart(e, "s")}
        ></div>
        <div
            class="resize-handle w"
            on:mousedown={(e) => onResizeStart(e, "w")}
        ></div>
        <div
            class="resize-handle se"
            on:mousedown={(e) => onResizeStart(e, "se")}
        ></div>
    {/if}

    <div class="content-wrapper">
        {#if item.type === "note"}
            <div class="note-content">
                <textarea
                    class="note-textarea {isEditing ? 'editing' : ''}"
                    bind:value={item.content}
                    bind:this={textareaEl}
                    readonly={!isEditing}
                    on:mousedown={onInputClick}
                    placeholder="Write a note..."
                ></textarea>
            </div>
        {:else if item.type === "image"}
            <div class="image-content">
                <img src={item.content} alt="Visual" draggable="false" />
                {#if item.title}
                    <div class="caption">{item.title}</div>
                {/if}
            </div>
        {:else if item.type === "video"}
            <div class="video-content">
                <div
                    class="video-placeholder"
                    style={item.content && item.content.startsWith("http")
                        ? `background-image: url(${item.content}); background-size: cover; background-position: center;`
                        : ""}
                >
                    {#if !item.content || !item.content.startsWith("http")}
                        <div class="play-btn">▶</div>
                    {/if}
                </div>
                {#if item.title}
                    <div class="caption is-link">
                        <span class="link-icon">🔗</span>
                        <span class="link-text">{item.title}</span>
                    </div>
                {/if}
            </div>
        {:else if item.type === "link"}
            <div class="link-content">
                {#if !item.content}
                    <div class="link-input-container">
                        <input
                            class="link-input"
                            placeholder="Paste a link..."
                            on:keydown={(e) => {
                                if (e.key === "Enter") {
                                    const url = e.currentTarget.value;
                                    if (!url) return;

                                    const ytMatch = url.match(
                                        /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
                                    );

                                    if (ytMatch) {
                                        item = {
                                            ...item,
                                            type: "video",
                                            content: `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`,
                                            title: "YouTube Video",
                                        };
                                    } else {
                                        item = {
                                            ...item,
                                            content: url,
                                            title: url,
                                        };
                                    }
                                    dispatch("itemUpdate", item);
                                }
                            }}
                            on:mousedown|stopPropagation
                        />
                    </div>
                {:else}
                    <div class="link-preview">
                        <span class="browser-icon">🌐</span>
                    </div>
                    <div class="caption is-link">
                        <span class="link-text"
                            >{item.title || item.content}</span
                        >
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>

<style>
    .board-item {
        position: absolute;
        background-color: var(--card-bg);
        border-radius: 4px;
        box-shadow:
            0 4px 6px -1px rgba(0, 0, 0, 0.3),
            0 2px 4px -1px rgba(0, 0, 0, 0.15);
        display: flex;
        flex-direction: column;
        cursor: grab;
        border: 1px solid transparent;
    }

    .board-item:active {
        cursor: grabbing;
    }

    .board-item.selected {
        border: 2px solid var(--accent-color);
        box-shadow:
            0 0 0 1px var(--accent-color),
            0 10px 15px -3px rgba(0, 0, 0, 0.5);
        z-index: 100 !important;
    }

    .content-wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: 2px;
    }

    .note-content {
        padding: 12px;
        height: 100%;
        background-color: #262626;
    }

    .note-textarea {
        width: 100%;
        height: 100%;
        background: transparent;
        border: none;
        resize: none;
        color: var(--text-primary);
        font-family: inherit;
        font-size: 14px;
        outline: none;
        pointer-events: none;
    }

    .note-textarea.editing {
        pointer-events: auto;
        cursor: text;
    }

    /* Image Styles */
    .image-content {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .image-content img {
        width: 100%;
        flex-grow: 1;
        object-fit: cover;
        min-height: 0;
    }

    .caption {
        padding: 8px 12px;
        font-size: 12px;
        background-color: #2d2d2d;
        color: var(--text-secondary);
        border-top: 1px solid #333;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Video / Link Styles */
    .video-content,
    .link-content {
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .video-placeholder,
    .link-preview {
        flex-grow: 1;
        background: #111;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
    }

    .play-btn {
        width: 48px;
        height: 48px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 20px;
    }

    .is-link {
        display: flex;
        align-items: center;
        gap: 6px;
        color: #64b5f6; /* Link blue */
        text-decoration: underline;
        cursor: pointer;
    }

    .resize-handle {
        position: absolute;
        width: 10px;
        height: 10px;
        background: white;
        border: 1px solid var(--accent-color);
        border-radius: 50%;
        z-index: 10;
    }

    .resize-handle.n {
        top: -5px;
        left: 50%;
        transform: translateX(-50%);
        cursor: ns-resize;
    }
    .resize-handle.e {
        top: 50%;
        right: -5px;
        transform: translateY(-50%);
        cursor: ew-resize;
    }
    .resize-handle.s {
        bottom: -5px;
        left: 50%;
        transform: translateX(-50%);
        cursor: ns-resize;
    }
    .resize-handle.w {
        top: 50%;
        left: -5px;
        transform: translateY(-50%);
        cursor: ew-resize;
    }
    .resize-handle.se {
        bottom: -5px;
        right: -5px;
        cursor: nwse-resize;
    }

    .link-input-container {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px;
    }

    .link-input {
        width: 100%;
        background: transparent;
        border: none;
        border-bottom: 2px solid var(--accent-color);
        color: white;
        padding: 4px;
        font-size: 14px;
        outline: none;
        text-align: center;
    }
</style>
