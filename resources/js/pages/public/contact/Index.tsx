import { useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

import { ContactInfoPanel } from '@/components/public/ContactInfoPanel';
import { SectionHeader } from '@/components/public/SectionHeader';
import { SeoHead } from '@/components/public/SeoHead';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PublicLayout from '@/layouts/PublicLayout';
import { ResolvedSeo } from '@/types/cms';

export default function Index({ seo }: { seo: ResolvedSeo }) {
    const [submitted, setSubmitted] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', company: '', email: '', phone: '', subject: '', message: '', website: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('public.contact.store'), {
            onSuccess: () => {
                reset();
                setSubmitted(true);
            },
        });
    };

    return (
        <PublicLayout>
            <SeoHead seo={seo} />

            <section className="border-b border-border">
                <div className="mx-auto max-w-content px-5 py-16 sm:px-6 lg:px-8">
                    <SectionHeader
                        as="h1"
                        eyebrow="Get In Touch"
                        heading="Contact Us"
                        description="Send us a message and our team will get back to you."
                    />
                </div>
            </section>

            <div className="mx-auto max-w-content px-5 py-16 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_380px] lg:gap-16">
                    <div>
                        {submitted ? (
                            <p className="border-t border-success/30 pt-6 text-small font-medium text-success">
                                Your message has been sent. We will get back to you soon.
                            </p>
                        ) : (
                            <form onSubmit={submit} className="space-y-4">
                                {/* Honeypot: hidden from real visitors, bots that fill every field trip this. */}
                                <input
                                    type="text"
                                    name="website"
                                    value={data.website}
                                    onChange={(e) => setData('website', e.target.value)}
                                    tabIndex={-1}
                                    autoComplete="off"
                                    className="hidden"
                                    aria-hidden="true"
                                />

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} className="mt-1.5" />
                                        {errors.name && <p className="mt-1 text-sm text-danger">{errors.name}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="company">Company</Label>
                                        <Input id="company" value={data.company} onChange={(e) => setData('company', e.target.value)} className="mt-1.5" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} className="mt-1.5" />
                                        {errors.email && <p className="mt-1 text-sm text-danger">{errors.email}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="phone">Phone</Label>
                                        <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} className="mt-1.5" />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input id="subject" value={data.subject} onChange={(e) => setData('subject', e.target.value)} className="mt-1.5" />
                                </div>
                                <div>
                                    <Label htmlFor="message">Message</Label>
                                    <textarea id="message" value={data.message} onChange={(e) => setData('message', e.target.value)} rows={6} className="mt-1.5 w-full border border-border bg-surface px-3 py-2 text-sm" />
                                    {errors.message && <p className="mt-1 text-sm text-danger">{errors.message}</p>}
                                </div>
                                <Button type="submit" disabled={processing}>Send Message</Button>
                            </form>
                        )}
                    </div>

                    <ContactInfoPanel />
                </div>
            </div>
        </PublicLayout>
    );
}
