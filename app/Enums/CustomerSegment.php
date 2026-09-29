<?php

namespace App\Enums;

/**
 * Which production line a customer belongs to; the homepage "Customers
 * Served" shows one scrolling row per segment, Stamping on top. The names
 * stay English in both languages, like the division names.
 */
enum CustomerSegment: string
{
    case Stamping = 'stamping';
    case Engineering = 'engineering';

    public function label(): string
    {
        return match ($this) {
            self::Stamping => 'Stamping Production',
            self::Engineering => 'Engineering Production',
        };
    }
}
