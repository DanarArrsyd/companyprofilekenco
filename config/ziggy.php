<?php

/*
 * Guests only receive public + sign-in route names in the page's Ziggy
 * payload; the full admin route map is emitted only for signed-in users
 * (see resources/views/app.blade.php).
 */
return [
    'groups' => [
        'public' => ['home', 'sitemap', 'robots', 'public.*', 'login', 'password.*'],
    ],
];
