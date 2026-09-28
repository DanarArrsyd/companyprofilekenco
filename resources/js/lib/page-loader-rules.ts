/** Which Inertia visits the page loader covers (pure, so tests can run it in node). */

export interface VisitLike {
    url: URL;
    method: string;
    prefetch: boolean;
    async: boolean;
    only: string[];
    except: string[];
}

/** `/en/products` and `/products` are the same page in another language. */
export function pagePath(url: URL): string {
    const path = url.pathname.replace(/\/+$/, '') || '/';
    if (path === '/en') return '/';
    return path.startsWith('/en/') ? path.slice(3) : path;
}

export function shouldCover(visit: VisitLike, current: URL): boolean {
    if (visit.method.toLowerCase() !== 'get' || visit.prefetch || visit.async) return false;
    if (visit.only.length > 0 || visit.except.length > 0) return false;
    if (visit.url.origin !== current.origin || visit.url.pathname.startsWith('/admin')) return false;

    return pagePath(visit.url) !== pagePath(current);
}

/**
 * Runner progress, as a fraction of the rail (the runner's head). `floor` is
 * the last real milestone; between milestones the target creeps towards
 * TRICKLE_CAP, slower the closer it gets, so a slow network shows as a crawl
 * and never as a stop or a fake finish. The shown value follows the target
 * smoothly, capped at MAX_SPEED rails per second so milestones that land
 * together read as one sprint, not a jump. Once `done`, it runs to `exit`
 * (just past the right end) at no less than MIN_EXIT_SPEED. Never backwards.
 */
export interface ProgressState {
    shown: number;
    target: number;
    floor: number;
    done: boolean;
    exit: number;
}

export const TRICKLE_CAP = 0.9;
const TRICKLE_TAU = 2.5;
const FOLLOW_TAU = 0.16;
const MAX_SPEED = 1.5;
const MIN_EXIT_SPEED = 0.8;

export function stepProgress(state: ProgressState, dt: number): ProgressState {
    const trickled = state.target + Math.max(0, TRICKLE_CAP - state.target) * (1 - Math.exp(-dt / TRICKLE_TAU));
    const target = state.done ? state.exit : Math.max(state.floor, trickled);

    const gap = target - state.shown;
    let move = Math.min(gap * (1 - Math.exp(-dt / FOLLOW_TAU)), MAX_SPEED * dt);
    if (state.done) move = Math.max(move, Math.min(gap, MIN_EXIT_SPEED * dt));

    return { ...state, target, shown: state.shown + Math.max(0, move) };
}
