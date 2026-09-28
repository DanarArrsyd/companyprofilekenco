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
