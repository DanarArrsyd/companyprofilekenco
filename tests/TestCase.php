<?php

namespace Tests;

use App\Support\LocalizedContent;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // SetLocale sets these per request; a previous test's request must
        // not leak into factories and assertions of the next one.
        LocalizedContent::$serializeAllLocales = false;
        LocalizedContent::$autoTranslate = false;
    }
}
