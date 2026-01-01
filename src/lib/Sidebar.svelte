<script lang="ts">
    import { createEventDispatcher } from "svelte";

    const tools = [
        {
            id: "note",
            label: "Note",
            icon: '<rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" stroke-width="2"/><line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2"/>',
        },
        {
            id: "link",
            label: "Link",
            icon: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" fill="none"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" fill="none"/>',
        },
        {
            id: "todo",
            label: "To-do",
            icon: '<path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="2" fill="none"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" stroke-width="2" fill="none"/>',
        },
        {
            id: "image",
            label: "Add Image",
            icon: '<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><polyline points="21 15 16 10 5 21" stroke="currentColor" stroke-width="2" fill="none"/>',
        },
    ];

    function onDragStart(event: DragEvent, type: string) {
        if (event.dataTransfer) {
            event.dataTransfer.setData("type", type);
            event.dataTransfer.effectAllowed = "copy";
        }
    }
</script>

<aside class="sidebar">
    <div class="tools">
        {#each tools as tool}
            <div
                class="tool"
                draggable="true"
                on:dragstart={(e) => onDragStart(e, tool.id)}
                role="button"
                tabindex="0"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" class="icon">
                    {@html tool.icon}
                </svg>
                <span class="label">{tool.label}</span>
            </div>
        {/each}
    </div>

    <div class="bottom-tools">
        <div class="tool trash">
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
            >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                ></path>
            </svg>
            <span class="label">Trash</span>
        </div>
    </div>
</aside>

<style>
    .sidebar {
        width: var(--sidebar-width);
        height: 100vh;
        background-color: var(--sidebar-bg);
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 16px;
        border-right: 1px solid var(--border-color);
        z-index: 10;
        position: relative;
    }

    .tools {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        align-items: center;
        overflow-y: auto;
        flex: 1;
    }

    .bottom-tools {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-bottom: 16px;
    }

    .tool {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        padding: 12px 0;
        cursor: grab;
        color: var(--text-secondary);
        transition:
            color 0.2s,
            background-color 0.2s;
    }

    .tool:hover {
        color: var(--text-primary);
        background-color: rgba(255, 255, 255, 0.05);
    }

    .icon {
        width: 20px;
        height: 20px;
        margin-bottom: 4px;
    }

    .label {
        font-size: 10px;
        font-weight: 500;
    }

    .trash {
        color: #ef5350;
    }
    .trash:hover {
        background-color: rgba(239, 83, 80, 0.1);
        color: #ff8a80;
    }
</style>
