<?php

use Illuminate\Support\Facades\Route;

test('every admin menu entry points at an existing route', function () {
    $source = file_get_contents(resource_path('js/lib/admin-nav.ts'));
    preg_match_all("/href: '([^']+)'/", $source, $matches);

    expect($matches[1])->not->toBeEmpty();

    foreach ($matches[1] as $name) {
        expect(Route::has($name))->toBeTrue("Missing route [{$name}]");
    }
});
