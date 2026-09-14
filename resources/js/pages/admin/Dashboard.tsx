import { Head, Link } from '@inertiajs/react';
import { Activity, Boxes, Briefcase, Inbox, Newspaper } from 'lucide-react';

import { EmptyState } from '@/components/admin/EmptyState';
import { PageHeader } from '@/components/admin/PageHeader';
import { StatusBadge } from '@/components/admin/StatusBadge';
import AdminLayout from '@/layouts/AdminLayout';

interface RecentContentItem {
    type: string;
    title: string;
    status: string;
    updated_at: string;
}

interface RecentInquiry {
    id: number;
    name: string;
    subject: string | null;
    status: string;
    created_at: string;
}

interface RecentActivity {
    id: number;
    action: string;
    created_at: string;
    user: { id: number; name: string } | null;
}

export default function Dashboard({
    stats,
    recentContent,
    recentInquiries,
    recentActivity,
}: {
    stats: {
        publishedProducts: number;
        publishedNews: number;
        openJobVacancies: number;
        newInquiries: number;
    };
    recentContent: RecentContentItem[];
    recentInquiries: RecentInquiry[];
    recentActivity: RecentActivity[];
}) {
    const summaryCards = [
        { label: 'Published Products', value: stats.publishedProducts, icon: Boxes },
        { label: 'Published News', value: stats.publishedNews, icon: Newspaper },
        { label: 'Open Job Vacancies', value: stats.openJobVacancies, icon: Briefcase },
        { label: 'New Inquiries', value: stats.newInquiries, icon: Inbox },
    ];

    return (
        <AdminLayout>
            <Head title="Dashboard" />

            <PageHeader title="Dashboard" description="Overview of published content and recent activity." />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {summaryCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div key={card.label} className="rounded border border-border bg-surface p-5">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500">{card.label}</p>
                                <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                            </div>
                            <p className="mt-2 text-2xl font-semibold text-foreground">{card.value}</p>
                        </div>
                    );
                })}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="rounded border border-border bg-surface p-5 lg:col-span-1">
                    <h2 className="text-sm font-semibold text-foreground">Recent Content Updates</h2>

                    {recentContent.length === 0 ? (
                        <EmptyState
                            title="No content yet"
                            description="Updates to pages, products, and articles will appear here."
                        />
                    ) : (
                        <ul className="mt-4 space-y-3">
                            {recentContent.map((item, index) => (
                                <li key={index} className="flex items-start justify-between gap-3 text-sm">
                                    <div>
                                        <p className="font-medium text-foreground">{item.title}</p>
                                        <p className="text-xs text-slate-500">{item.type}</p>
                                    </div>
                                    <StatusBadge status={item.status} />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="rounded border border-border bg-surface p-5 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-foreground">Recent Contact Inquiries</h2>
                        <Link href={route('admin.inquiries')} className="text-xs text-primary hover:underline">
                            View all
                        </Link>
                    </div>

                    {recentInquiries.length === 0 ? (
                        <EmptyState
                            icon={Inbox}
                            title="No inquiries yet"
                            description="Contact form submissions will appear here."
                        />
                    ) : (
                        <ul className="mt-4 space-y-3">
                            {recentInquiries.map((inquiry) => (
                                <li key={inquiry.id} className="flex items-start justify-between gap-3 text-sm">
                                    <div>
                                        <p className="font-medium text-foreground">{inquiry.name}</p>
                                        <p className="text-xs text-slate-500">{inquiry.subject ?? 'No subject'}</p>
                                    </div>
                                    <StatusBadge status={inquiry.status} />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <section className="rounded border border-border bg-surface p-5 lg:col-span-1">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-foreground">Recent Admin Activity</h2>
                        <Link href={route('admin.activity-logs')} className="text-xs text-primary hover:underline">
                            View all
                        </Link>
                    </div>

                    {recentActivity.length === 0 ? (
                        <EmptyState
                            icon={Activity}
                            title="No activity yet"
                            description="Admin actions like logins will appear here."
                        />
                    ) : (
                        <ul className="mt-4 space-y-3">
                            {recentActivity.map((entry) => (
                                <li key={entry.id} className="text-sm">
                                    <p className="text-foreground">
                                        <span className="font-medium">{entry.user?.name ?? 'System'}</span>{' '}
                                        {entry.action.replace('admin.', '')}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {new Date(entry.created_at).toLocaleString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </AdminLayout>
    );
}
