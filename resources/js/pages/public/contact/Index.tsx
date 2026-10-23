import { useForm, usePage } from '@inertiajs/react';
import { ArrowRight, ArrowUpRight, CheckCircle2, Mail } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import { Breadcrumb } from '@/components/public/Breadcrumb';
import { ContactInfoPanel } from '@/components/public/ContactInfoPanel';
import { SeoHead } from '@/components/public/SeoHead';
import { Container } from '@/components/public/Section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/hooks/use-locale';
import PublicLayout from '@/layouts/PublicLayout';
import { ResolvedSeo } from '@/types/cms';

export default function Index({ seo }: { seo: ResolvedSeo }) {
    const { localizedRoute, t } = useLocale();
    const { siteSettings } = usePage().props;
    const [submitted, setSubmitted] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', company: '', email: '', phone: '', subject: '', message: '', website: '',
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(localizedRoute('public.contact.store'), {
            onSuccess: () => { reset(); setSubmitted(true); },
        });
    };

    const inputClass = 'mt-2 rounded-lg border-border bg-background focus-visible:ring-navy-700';
    const errorClass = 'mt-1.5 text-small text-danger';

    return (
        <PublicLayout>
            <SeoHead seo={seo} />

            <Container className="pt-7 sm:pt-9">
                <Breadcrumb items={[{ label: t('Home'), href: '/' }, { label: t('Contact Us') }]} />
            </Container>

            <section className="mt-7 bg-navy-900 text-white sm:mt-9" aria-labelledby="contact-heading">
                <Container className="grid gap-10 py-16 md:grid-cols-[minmax(0,1.3fr)_minmax(17rem,0.7fr)] md:items-end md:gap-16 md:py-24">
                    <div>
                        <p className="text-caption font-semibold uppercase tracking-[0.16em] text-white/70">{t('Get In Touch')}</p>
                        <h1 id="contact-heading" className="mt-5 max-w-3xl text-balance text-h1">{t('Let’s talk about your next project.')}</h1>
                    </div>
                    <div className="border-l border-white/30 pl-5 md:pl-8">
                        <p className="max-w-md text-body-lg text-white/85">
                            {t('Tell us what you need. Our team is ready to discuss production, partnerships, and general enquiries.')}
                        </p>
                        {siteSettings.email && (
                            <a href={`mailto:${siteSettings.email}`} className="mt-7 inline-flex max-w-full items-center gap-2 border-b border-white/60 pb-2 text-small font-semibold text-white transition-colors hover:border-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
                                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                                <span className="truncate">{siteSettings.email}</span>
                                <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                            </a>
                        )}
                    </div>
                </Container>
            </section>

            <Container as="section" spacing="section" className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(19rem,0.85fr)] lg:gap-14" aria-labelledby="contact-form-heading">
                <div className="min-w-0 rounded-2xl border border-border bg-surface p-6 sm:p-9 lg:p-11">
                    <p className="text-caption font-semibold uppercase tracking-[0.12em] text-navy-700">{t('Send an enquiry')}</p>
                    <h2 id="contact-form-heading" className="mt-3 text-h2 text-navy-900">{t('How can we help?')}</h2>
                    <p className="mt-3 max-w-xl text-body text-slate-700">{t('Share a few details and our team will get back to you.')}</p>

                    {submitted ? (
                        <div role="status" className="mt-10 border-t border-success/30 pt-8">
                            <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
                            <p className="mt-4 text-body font-medium text-success">{t('Your message has been sent. We will get back to you soon.')}</p>
                            <button type="button" onClick={() => setSubmitted(false)} className="mt-5 text-small font-semibold text-navy-700 underline underline-offset-4 hover:text-navy-900">
                                {t('Send another message')}
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="mt-9 space-y-6">
                            <input type="text" name="website" value={data.website} onChange={(event) => setData('website', event.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="name">{t('Name')} <span aria-hidden="true">*</span></Label>
                                    <Input id="name" name="name" required autoComplete="name" value={data.name} onChange={(event) => setData('name', event.target.value)} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} className={inputClass} />
                                    {errors.name && <p id="name-error" className={errorClass}>{errors.name}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="company">{t('Company')}</Label>
                                    <Input id="company" name="company" autoComplete="organization" value={data.company} onChange={(event) => setData('company', event.target.value)} aria-invalid={!!errors.company} aria-describedby={errors.company ? 'company-error' : undefined} className={inputClass} />
                                    {errors.company && <p id="company-error" className={errorClass}>{errors.company}</p>}
                                </div>
                            </div>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <Label htmlFor="email">{t('Email')} <span aria-hidden="true">*</span></Label>
                                    <Input id="email" name="email" type="email" required autoComplete="email" value={data.email} onChange={(event) => setData('email', event.target.value)} aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} className={inputClass} />
                                    {errors.email && <p id="email-error" className={errorClass}>{errors.email}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="phone">{t('Phone')}</Label>
                                    <Input id="phone" name="phone" type="tel" autoComplete="tel" value={data.phone} onChange={(event) => setData('phone', event.target.value)} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-error' : undefined} className={inputClass} />
                                    {errors.phone && <p id="phone-error" className={errorClass}>{errors.phone}</p>}
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="subject">{t('Subject')}</Label>
                                <Input id="subject" name="subject" value={data.subject} onChange={(event) => setData('subject', event.target.value)} aria-invalid={!!errors.subject} aria-describedby={errors.subject ? 'subject-error' : undefined} className={inputClass} />
                                {errors.subject && <p id="subject-error" className={errorClass}>{errors.subject}</p>}
                            </div>
                            <div>
                                <Label htmlFor="message">{t('Message')} <span aria-hidden="true">*</span></Label>
                                <textarea id="message" name="message" required rows={6} value={data.message} onChange={(event) => setData('message', event.target.value)} aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : undefined} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-small text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-700" />
                                {errors.message && <p id="message-error" className={errorClass}>{errors.message}</p>}
                            </div>
                            <Button type="submit" disabled={processing} className="h-12 w-full gap-3 rounded-full sm:w-auto sm:px-8">
                                {t('Send Message')} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Button>
                        </form>
                    )}
                </div>

                <aside className="min-w-0 rounded-2xl bg-secondary p-6 sm:p-9 lg:p-10" aria-labelledby="contact-details-heading">
                    <p className="text-caption font-semibold uppercase tracking-[0.12em] text-navy-700">{t('Our details')}</p>
                    <h2 id="contact-details-heading" className="mt-3 text-h3 text-navy-900">{t('Find us here.')}</h2>
                    <div className="mt-7"><ContactInfoPanel /></div>
                </aside>
            </Container>
        </PublicLayout>
    );
}
