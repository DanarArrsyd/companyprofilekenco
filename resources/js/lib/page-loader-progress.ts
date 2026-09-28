import { stepProgress, type ProgressState } from '@/lib/page-loader-rules';

export interface Progress {
    /** A real milestone was reached: the runner is at least this far (0..1). */
    stage(value: number): void;
    /** Loading is over: run off the right end; resolves once the runner is gone. */
    complete(): Promise<void>;
    stop(): void;
}

interface Elements {
    track: HTMLElement;
    mover: HTMLElement;
    fill: HTMLElement;
}

/** Drives the page loader's runner and rail fill every frame from stepProgress(). */
export function createProgress({ track, mover, fill }: Elements, from: number): Progress {
    let state: ProgressState = { shown: from, target: from, floor: from, done: false, exit: 1.2 };
    let frameId = 0;
    let last = performance.now();
    let finished: (() => void) | null = null;

    const exitPoint = () => 1 + mover.offsetWidth / Math.max(1, track.clientWidth) + 0.02;

    const render = () => {
        const width = track.clientWidth;
        const p = state.shown;
        mover.style.transform = `translate3d(${(p * width - mover.offsetWidth).toFixed(2)}px, 0, 0)`;
        fill.style.transform = `scaleX(${Math.min(p, 1).toFixed(4)})`;
        fill.style.opacity = p <= 1 ? '1' : String(Math.max(0, 1 - (p - 1) / (state.exit - 1)));
    };

    const settle = () => {
        cancelAnimationFrame(frameId);
        frameId = 0;
        finished?.();
        finished = null;
    };

    const frame = (now: number) => {
        const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
        last = now;
        state = stepProgress(state, dt);
        render();

        if (state.done && state.shown >= state.exit) {
            settle();
            return;
        }

        frameId = requestAnimationFrame(frame);
    };

    render();
    frameId = requestAnimationFrame(frame);

    return {
        stage(value) {
            if (!state.done) state = { ...state, floor: Math.max(state.floor, Math.min(value, 0.97)) };
        },
        complete() {
            state = { ...state, done: true, exit: exitPoint() };

            return new Promise((resolve) => {
                finished = resolve;
                // A hidden tab runs no frames; nobody is watching, so finish at once.
                if (document.hidden || frameId === 0) settle();
            });
        },
        stop() {
            cancelAnimationFrame(frameId);
            frameId = 0;
        },
    };
}
