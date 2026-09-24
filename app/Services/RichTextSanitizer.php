<?php

namespace App\Services;

use Symfony\Component\HtmlSanitizer\HtmlSanitizer;
use Symfony\Component\HtmlSanitizer\HtmlSanitizerConfig;

/**
 * Server-side allowlist for CMS rich text. Article bodies are rendered as raw
 * HTML on the public site, so anything outside what the TipTap editor
 * (StarterKit + Link) can produce is dropped — script tags, event handlers,
 * inline styles and javascript: URLs never reach the page, even when a
 * request bypasses the editor.
 */
class RichTextSanitizer
{
    private const BLOCK_ELEMENTS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'ul', 'ol', 'li', 'pre', 'code', 'hr', 'br'];

    private const INLINE_ELEMENTS = ['strong', 'b', 'em', 'i', 's', 'u'];

    private HtmlSanitizer $sanitizer;

    public function __construct()
    {
        $config = (new HtmlSanitizerConfig)
            ->allowLinkSchemes(['http', 'https', 'mailto', 'tel'])
            ->allowRelativeLinks()
            ->allowElement('a', ['href', 'target', 'rel'])
            ->forceAttribute('a', 'rel', 'noopener noreferrer nofollow')
            ->withMaxInputLength(500_000);

        foreach ([...self::BLOCK_ELEMENTS, ...self::INLINE_ELEMENTS] as $element) {
            $config = $config->allowElement($element);
        }

        $this->sanitizer = new HtmlSanitizer($config);
    }

    public function sanitize(?string $html): ?string
    {
        if ($html === null || trim($html) === '') {
            return $html;
        }

        return $this->sanitizer->sanitize($html);
    }
}
