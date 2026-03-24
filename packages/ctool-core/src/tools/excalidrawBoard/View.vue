<template>
    <div class="ctool-excalidraw-board">
        <Card class="ctool-page-option" padding="10px">
            <div class="ctool-excalidraw-board-toolbar">
                <div>
                    <div class="ctool-excalidraw-board-desc">{{ $t("excalidrawBoard_description") }}</div>
                    <div class="ctool-excalidraw-board-hint">{{ $t("excalidrawBoard_hint") }}</div>
                </div>
                <Align>
                    <Button :size="'small'" :text="$t('excalidrawBoard_undo')" @click="undoHandle" />
                    <Button :size="'small'" :text="$t('excalidrawBoard_clear')" @click="clearHandle" />
                    <Button :size="'small'" :type="'primary'" :text="$t('excalidrawBoard_export')" @click="exportHandle" />
                </Align>
            </div>
            <div class="ctool-excalidraw-board-options">
                <div class="ctool-excalidraw-board-field">
                    <div class="ctool-excalidraw-board-label">{{ $t("excalidrawBoard_mode") }}</div>
                    <Select v-model="action.current.mode" :options="modeOptions" />
                </div>
                <div class="ctool-excalidraw-board-field">
                    <div class="ctool-excalidraw-board-label">{{ $t("excalidrawBoard_stroke") }}</div>
                    <InputNumber v-model="action.current.strokeWidth" :min="1" :max="32" />
                </div>
                <div class="ctool-excalidraw-board-field">
                    <div class="ctool-excalidraw-board-label">{{ $t("excalidrawBoard_color") }}</div>
                    <input class="ctool-excalidraw-board-color" type="color" v-model="action.current.color" />
                </div>
            </div>
        </Card>
        <HeightResize v-slot="{ height }" :append="['.ctool-page-option']" :reduce="5">
            <Card :title="$t('excalidrawBoard_canvas_title')">
                <div ref="containerRef" class="ctool-excalidraw-board-canvas-wrap" :style="{ height: `${height}px` }">
                    <canvas
                        ref="canvasRef"
                        class="ctool-excalidraw-board-canvas"
                        @pointerdown="pointerDownHandle"
                        @pointermove="pointerMoveHandle"
                        @pointerup="pointerUpHandle"
                        @pointerleave="pointerUpHandle"
                    />
                </div>
            </Card>
        </HeightResize>
    </div>
</template>

<script setup lang="ts">
import { initialize, useAction } from "@/store/action";
import { nextTick, onMounted, onUnmounted, watch } from "vue";

type DrawMode = "pen" | "eraser";

interface DrawPoint {
    x: number;
    y: number;
}

interface DrawStroke {
    mode: DrawMode;
    color: string;
    width: number;
    points: DrawPoint[];
}

const action = useAction(await initialize({
    mode: "pen" as DrawMode,
    strokeWidth: 3,
    color: "#1f2937",
}, { paste: false }));

const modeOptions = $computed(() => {
    return [
        { value: "pen", label: $t("excalidrawBoard_mode_pen") },
        { value: "eraser", label: $t("excalidrawBoard_mode_eraser") },
    ];
});

const canvasRef = $ref<HTMLCanvasElement | null>(null);
const containerRef = $ref<HTMLElement | null>(null);
let strokes = $ref<DrawStroke[]>([]);
let drawing = $ref(false);
let currentPoints = $ref<DrawPoint[]>([]);

const getCanvasContext = () => {
    const canvas = canvasRef;
    if (!canvas) {
        return null;
    }
    return canvas.getContext("2d");
};

const getPoint = (event: PointerEvent) => {
    const rect = canvasRef?.getBoundingClientRect();
    if (!rect) {
        return null;
    }
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
    };
};

const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#edf2f7";
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x += 24) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 0; y <= height; y += 24) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
};

const drawStroke = (ctx: CanvasRenderingContext2D, stroke: DrawStroke) => {
    if (stroke.points.length < 2) {
        return;
    }
    ctx.save();
    ctx.globalCompositeOperation = stroke.mode === "eraser" ? "destination-out" : "source-over";
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    for (let index = 1; index < stroke.points.length; index++) {
        const point = stroke.points[index];
        ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
    ctx.restore();
};

const redraw = () => {
    const canvas = canvasRef;
    const ctx = getCanvasContext();
    if (!canvas || !ctx) {
        return;
    }
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    ctx.save();
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    drawBackground(ctx, width, height);
    strokes.forEach(stroke => drawStroke(ctx, stroke));
    if (drawing && currentPoints.length > 1) {
        drawStroke(ctx, {
            mode: action.current.mode,
            color: action.current.color,
            width: action.current.strokeWidth,
            points: currentPoints,
        });
    }
    ctx.restore();
};

const resizeCanvas = () => {
    const canvas = canvasRef;
    const container = containerRef;
    if (!canvas || !container) {
        return;
    }
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(320, Math.floor(container.clientWidth));
    const height = Math.max(180, Math.floor(container.clientHeight));
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    redraw();
};

const pointerDownHandle = (event: PointerEvent) => {
    if (!canvasRef) {
        return;
    }
    canvasRef.setPointerCapture(event.pointerId);
    const point = getPoint(event);
    if (!point) {
        return;
    }
    drawing = true;
    currentPoints = [point];
    redraw();
};

const pointerMoveHandle = (event: PointerEvent) => {
    if (!drawing) {
        return;
    }
    const point = getPoint(event);
    if (!point) {
        return;
    }
    currentPoints = [...currentPoints, point];
    redraw();
};

const pointerUpHandle = (event: PointerEvent) => {
    if (!drawing) {
        return;
    }
    canvasRef?.releasePointerCapture(event.pointerId);
    drawing = false;
    if (currentPoints.length > 1) {
        strokes = [...strokes, {
            mode: action.current.mode,
            color: action.current.color,
            width: action.current.strokeWidth,
            points: currentPoints,
        }];
    }
    currentPoints = [];
    redraw();
};

const clearHandle = () => {
    strokes = [];
    currentPoints = [];
    drawing = false;
    redraw();
};

const undoHandle = () => {
    if (strokes.length < 1) {
        return;
    }
    strokes = strokes.slice(0, -1);
    redraw();
};

const exportHandle = () => {
    const canvas = canvasRef;
    if (!canvas) {
        return;
    }
    canvas.toBlob(blob => {
        if (!blob) {
            return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.style.display = "none";
        link.href = url;
        link.download = "drawing-board.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });
};

watch(() => action.current, () => action.save(), { deep: true });

onMounted(async () => {
    await nextTick();
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
});

onUnmounted(() => {
    window.removeEventListener("resize", resizeCanvas);
});

watch(() => containerRef?.clientHeight, async () => {
    await nextTick();
    resizeCanvas();
});
</script>

<style>
.ctool-excalidraw-board {
    height: 100%;
}

.ctool-excalidraw-board-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
}

.ctool-excalidraw-board-desc {
    font-size: .95rem;
}

.ctool-excalidraw-board-hint {
    margin-top: 4px;
    font-size: .75rem;
    color: var(--ctool-info-color);
}

.ctool-excalidraw-board-options {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.ctool-excalidraw-board-label {
    margin-bottom: 4px;
    font-size: .8rem;
    color: var(--ctool-info-color);
}

.ctool-excalidraw-board-color {
    width: 100%;
    height: 32px;
    border: 1px solid var(--ctool-border-color);
    border-radius: var(--border-radius);
    padding: 2px;
    background: var(--ctool-background-color);
}

.ctool-excalidraw-board-canvas-wrap {
    width: 100%;
    border: 1px solid var(--ctool-border-color);
    border-radius: var(--border-radius);
    overflow: hidden;
    background: #fff;
}

.ctool-excalidraw-board-canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
    cursor: crosshair;
}

@media (max-width: 960px) {
    .ctool-excalidraw-board-toolbar {
        flex-direction: column;
    }

    .ctool-excalidraw-board-options {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
