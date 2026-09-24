<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;
use Illuminate\Support\Facades\Vite;
use Symfony\Component\HttpFoundation\Response;

/**
 * Browser-side hardening for every web response: a nonce-based CSP so only
 * our own bundles and the inline scripts we emit can run, plus the standard
 * anti-framing, MIME-sniffing and referrer headers.
 *
 * The CSP is sent both as a header and as a <meta> tag: Hostinger's edge
 * replaces the Content-Security-Policy header with its own
 * "upgrade-insecure-requests", while the meta copy in the HTML survives.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        // Set before the view renders so @vite and @routes stamp the nonce.
        Vite::useCspNonce();

        $policy = Vite::isRunningHot() ? null : $this->contentSecurityPolicy(Vite::cspNonce(), $request->isSecure());

        // frame-ancestors is ignored in <meta>; X-Frame-Options covers framing.
        View::share('contentSecurityPolicyMeta', $policy ? str_replace("; frame-ancestors 'self'", '', $policy) : null);

        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');
        $response->headers->remove('X-Powered-By');
        header_remove('X-Powered-By');

        if ($request->isSecure()) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000');
        }

        if ($policy) {
            $response->headers->set('Content-Security-Policy', $policy);
        }

        return $response;
    }

    private function contentSecurityPolicy(string $nonce, bool $secure): string
    {
        return implode('; ', array_filter([
            "default-src 'self'",
            "script-src 'self' 'nonce-{$nonce}'",
            // React style props and TipTap write inline style attributes.
            "style-src 'self' 'unsafe-inline' https://fonts.bunny.net",
            "font-src 'self' https://fonts.bunny.net data:",
            "img-src 'self' data: blob: https:",
            // Contact page Google Maps embed.
            "frame-src 'self' https://www.google.com https://maps.google.com",
            "connect-src 'self'",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'self'",
            $secure ? 'upgrade-insecure-requests' : null,
        ]));
    }
}
