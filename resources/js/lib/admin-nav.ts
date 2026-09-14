import {
    Bell,
    Boxes,
    Briefcase,
    Building2,
    FileText,
    Factory,
    Image,
    LayoutDashboard,
    Newspaper,
    Search,
    Settings,
    ShieldCheck,
    Users,
} from 'lucide-react';
import { ComponentType } from 'react';

export interface AdminNavItem {
    name: string;
    href: string;
    permission?: string;
}

export interface AdminNavGroup {
    label: string;
    icon: ComponentType<{ className?: string }>;
    permission?: string;
    items: AdminNavItem[];
}

export const adminNavGroups: AdminNavGroup[] = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        permission: 'dashboard.view',
        items: [{ name: 'Dashboard', href: 'dashboard', permission: 'dashboard.view' }],
    },
    {
        label: 'Content',
        icon: FileText,
        permission: 'pages.view',
        items: [
            { name: 'Pages', href: 'admin.pages', permission: 'pages.view' },
            { name: 'Homepage', href: 'admin.homepage', permission: 'pages.view' },
        ],
    },
    {
        label: 'Products',
        icon: Boxes,
        permission: 'products.view',
        items: [
            { name: 'Products', href: 'admin.products', permission: 'products.view' },
            { name: 'Categories', href: 'admin.products.categories', permission: 'products.view' },
        ],
    },
    {
        label: 'Manufacturing',
        icon: Factory,
        permission: 'capabilities.view',
        items: [
            { name: 'Capabilities', href: 'admin.capabilities', permission: 'capabilities.view' },
            { name: 'Facilities', href: 'admin.facilities', permission: 'facilities.view' },
            { name: 'Machines', href: 'admin.machines', permission: 'facilities.view' },
        ],
    },
    {
        label: 'Quality',
        icon: ShieldCheck,
        permission: 'certifications.view',
        items: [
            { name: 'Certifications', href: 'admin.certifications', permission: 'certifications.view' },
        ],
    },
    {
        label: 'Corporate',
        icon: Building2,
        permission: 'industries.view',
        items: [{ name: 'Industries', href: 'admin.industries', permission: 'industries.view' }],
    },
    {
        label: 'News',
        icon: Newspaper,
        permission: 'news.view',
        items: [
            { name: 'Articles', href: 'admin.news', permission: 'news.view' },
            { name: 'Categories', href: 'admin.news.categories', permission: 'news.view' },
        ],
    },
    {
        label: 'Career',
        icon: Briefcase,
        permission: 'careers.manage',
        items: [
            { name: 'Job Vacancies', href: 'admin.careers', permission: 'careers.manage' },
            { name: 'Applications', href: 'admin.careers.applications', permission: 'careers.manage' },
        ],
    },
    {
        label: 'Communication',
        icon: Bell,
        permission: 'inquiries.manage',
        items: [{ name: 'Contact Inquiries', href: 'admin.inquiries', permission: 'inquiries.manage' }],
    },
    {
        label: 'Media',
        icon: Image,
        permission: 'media.manage',
        items: [{ name: 'Media Library', href: 'admin.media', permission: 'media.manage' }],
    },
    {
        label: 'SEO',
        icon: Search,
        permission: 'seo.manage',
        items: [{ name: 'SEO Manager', href: 'admin.seo', permission: 'seo.manage' }],
    },
    {
        label: 'Administration',
        icon: Users,
        permission: 'users.manage',
        items: [
            { name: 'Users', href: 'admin.users', permission: 'users.manage' },
            { name: 'Roles', href: 'admin.roles', permission: 'users.manage' },
            { name: 'Activity Logs', href: 'admin.activity-logs', permission: 'users.manage' },
        ],
    },
    {
        label: 'Settings',
        icon: Settings,
        permission: 'settings.manage',
        items: [{ name: 'Website Settings', href: 'admin.settings', permission: 'settings.manage' }],
    },
];
