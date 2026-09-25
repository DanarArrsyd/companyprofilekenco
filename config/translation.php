<?php

return [

    /*
    | Machine translation for the admin "Auto-translate the other language"
    | option (App\Actions\Translation\AutoTranslateChanges). Azure Translator
    | F0 is free up to 2 M characters a month and simply stops when that is
    | used up. Without a key the option is hidden and nothing is translated.
    */

    'azure' => [
        'key' => env('AZURE_TRANSLATOR_KEY'),
        'region' => env('AZURE_TRANSLATOR_REGION'),
        'endpoint' => env('AZURE_TRANSLATOR_ENDPOINT', 'https://api.cognitive.microsofttranslator.com'),
        'timeout' => 10,
    ],

    /*
    | Terms that stay as written in both languages (case-insensitive, whole
    | words): brand and legal names, and the manufacturing jargon and job
    | titles the company keeps in English on the Indonesian site.
    */

    'glossary' => [
        'PT. Kenco Manufactur Indonesia',
        'PT Kenco Manufactur Indonesia',
        'Kenco Manufactur Indonesia',
        'Kenco Manufacturing',
        'Kenco',
        'Metal Stamping',
        'Progressive Die Stamping',
        'Progressive Die',
        'CNC Machining',
        'Multi-Axis Machining',
        'CAM Programming',
        'Tool & Die Design',
        'Assembly & Testing',
        'Sub-Assembly',
        'Production Intern',
        'Manufacturing Engineer',
        'Quality Control Inspector',
        'ISO 9001',
        'IATF 16949',
    ],

];
