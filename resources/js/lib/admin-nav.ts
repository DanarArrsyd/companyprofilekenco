import {
    Award,
    Boxes,
    Briefcase,
    Building2,
    Cog,
    Factory,
    FileText,
    FolderTree,
    Handshake,
    History,
    Home,
    Image,
    Inbox,
    KeyRound,
    LayoutDashboard,
    Newspaper,
    Search,
    Settings,
    Tags,
    Users,
    Wrench,
} from 'lucide-react';
import { ComponentType } from 'react';

export interface AdminNavItem {
    name: string;
    href: string;
    permission?: string;
}

/** A sidebar entry: a single link (`href`) or a collapsible group (`items`). */
export interface AdminNavEntry {
    label: string;
    icon: ComponentType<{ className?: string }>;
    href?: string;
    permission?: string;
    items?: AdminNavItem[];
}

export interface AdminNavSection {
    heading: string | null;
    entries: AdminNavEntry[];
}

/**
 * Admin menu, organised around the public website (user decision 2026-09-29):
 * website pages, content, then the option lists every form picks from
 * (Data Master) and system settings. Route names never change here.
 */
export const adminNavSections: AdminNavSection[] = [
    {
        heading: null,
        entries: [{ label: 'Dasbor', icon: LayoutDashboard, href: 'dashboard', permission: 'dashboard.view' }],
    },
    {
        heading: 'Halaman Website',
        entries: [
            { label: 'Beranda', icon: Home, href: 'admin.homepage', permission: 'pages.view' },
            { label: 'Pelanggan', icon: Handshake, href: 'admin.customers', permission: 'customers.view' },
            { label: 'Halaman', icon: FileText, href: 'admin.pages', permission: 'pages.view' },
            { label: 'Industri', icon: Building2, href: 'admin.industries', permission: 'industries.view' },
            { label: 'Tonggak Sejarah', icon: History, href: 'admin.milestones', permission: 'milestones.view' },
        ],
    },
    {
        heading: 'Konten',
        entries: [
            { label: 'Produk', icon: Boxes, href: 'admin.products', permission: 'products.view' },
            {
                label: 'Kapabilitas & Fasilitas',
                icon: Factory,
                permission: 'capabilities.view',
                items: [
                    { name: 'Kapabilitas', href: 'admin.capabilities', permission: 'capabilities.view' },
                    { name: 'Fasilitas', href: 'admin.facilities', permission: 'facilities.view' },
                ],
            },
            {
                label: 'Mutu & Sertifikasi',
                icon: Award,
                permission: 'certifications.view',
                items: [
                    { name: 'Sertifikasi', href: 'admin.certifications', permission: 'certifications.view' },
                    { name: 'Konten Mutu', href: 'admin.quality-content', permission: 'certifications.view' },
                ],
            },
            { label: 'Berita', icon: Newspaper, href: 'admin.news', permission: 'news.view' },
            {
                label: 'Karier',
                icon: Briefcase,
                permission: 'careers.manage',
                items: [
                    { name: 'Lowongan', href: 'admin.careers', permission: 'careers.manage' },
                    { name: 'Lamaran Masuk', href: 'admin.careers.applications', permission: 'careers.manage' },
                ],
            },
            { label: 'Pesan Masuk', icon: Inbox, href: 'admin.inquiries', permission: 'inquiries.manage' },
            { label: 'Media', icon: Image, href: 'admin.media', permission: 'media.manage' },
        ],
    },
    {
        heading: 'Data Master / Opsi',
        entries: [
            { label: 'Kategori Produk', icon: Tags, href: 'admin.products.categories', permission: 'products.view' },
            { label: 'Kategori Fasilitas', icon: FolderTree, href: 'admin.facilities.categories', permission: 'facilities.view' },
            { label: 'Kategori Berita', icon: Tags, href: 'admin.news.categories', permission: 'news.view' },
            { label: 'Mesin & Peralatan', icon: Wrench, href: 'admin.machines', permission: 'facilities.view' },
        ],
    },
    {
        heading: 'Sistem',
        entries: [
            { label: 'Pengguna', icon: Users, href: 'admin.users', permission: 'users.manage' },
            { label: 'Peran & Akses', icon: KeyRound, href: 'admin.roles', permission: 'users.manage' },
            { label: 'SEO', icon: Search, href: 'admin.seo', permission: 'seo.manage' },
            { label: 'Pengaturan Website', icon: Settings, href: 'admin.settings', permission: 'settings.manage' },
            { label: 'Log Aktivitas', icon: Cog, href: 'admin.activity-logs', permission: 'users.manage' },
        ],
    },
];
