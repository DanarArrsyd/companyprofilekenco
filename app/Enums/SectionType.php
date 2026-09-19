<?php

namespace App\Enums;

enum SectionType: string
{
    // Generic page sections
    case Text = 'text';
    case ImageText = 'image_text';
    case Hero = 'hero';
    case Stats = 'stats';
    case Gallery = 'gallery';
    case CallToAction = 'call_to_action';
    case VisionMission = 'vision_mission';

    // Homepage-specific sections
    case CompanyIntro = 'company_intro';
    case Capabilities = 'capabilities';
    case Products = 'products';
    case Facilities = 'facilities';
    case Quality = 'quality';
    case News = 'news';
    case CareerCta = 'career_cta';
    case ContactCta = 'contact_cta';

    public function label(): string
    {
        return match ($this) {
            self::Text => 'Text',
            self::ImageText => 'Image + Text',
            self::Hero => 'Hero',
            self::Stats => 'Statistics',
            self::Gallery => 'Gallery',
            self::CallToAction => 'Call to Action',
            self::VisionMission => 'Vision & Mission (split cards)',
            self::CompanyIntro => 'Company Introduction',
            self::Capabilities => 'Capabilities',
            self::Products => 'Products',
            self::Facilities => 'Facilities',
            self::Quality => 'Quality',
            self::News => 'News',
            self::CareerCta => 'Career CTA',
            self::ContactCta => 'Contact CTA',
        };
    }

    /**
     * Section types selectable on a generic (non-homepage) page.
     *
     * @return array<int, self>
     */
    public static function forGenericPage(): array
    {
        return [self::Text, self::ImageText, self::Hero, self::Stats, self::Gallery, self::CallToAction, self::VisionMission];
    }

    /**
     * Fixed section types that make up the homepage, in display order.
     *
     * @return array<int, self>
     */
    public static function forHomepage(): array
    {
        return [
            self::Hero,
            self::CompanyIntro,
            self::Stats,
            self::Capabilities,
            self::Products,
            self::Facilities,
            self::Quality,
            self::News,
            self::CareerCta,
            self::ContactCta,
        ];
    }
}
