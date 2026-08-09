"use client";

import { useEffect, useState } from "react";
import {
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  SparklesIcon,
  Building2,
  Clock,
  Send,
  CheckCircle2,
} from "lucide-react";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { BlurFade } from "@/components/landing/velora/blur-fade";
import { ShimmerButton } from "@/components/landing/velora/shimmer-button";
import { ScrollProgress } from "@/components/landing/velora/scroll-progress";
import { ScrollToTop } from "@/components/landing/velora/scroll-to-top";
import { DotPattern } from "@/components/landing/velora/grid-pattern";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
}

const DEFAULT_COMPANY: CompanyInfo = {
  name: "BizRavana",
  address: "Colombo, Sri Lanka",
  phone: "",
  email: "support@bizravana.com",
  whatsapp: "94750350109",
};

export default function ContactPage() {
  const [company, setCompany] = useState<CompanyInfo>(DEFAULT_COMPANY);
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  // ── Load admin settings for company info ──
  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data } = await supabase
          .from("admin_settings")
          .select("value")
          .eq("key", "admin_settings")
          .maybeSingle();

        if (data?.value) {
          const v = data.value as Record<string, unknown>;
          setCompany({
            name: String(v.company_name || DEFAULT_COMPANY.name),
            address: String(v.company_address || DEFAULT_COMPANY.address),
            phone: String(v.company_phone || DEFAULT_COMPANY.phone),
            email: String(v.support_email || DEFAULT_COMPANY.email),
            whatsapp: String(v.support_whatsapp || DEFAULT_COMPANY.whatsapp),
          });
        }
      } catch {
        // Use defaults on error
      }
    };
    fetchCompanyInfo();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const whatsappMsg = encodeURIComponent(
      `Hi BizRavana! I have a question.%0A%0AName: ${formState.name}%0AEmail: ${formState.email}%0AMessage: ${formState.message}`
    );
    window.open(`https://wa.me/${company.whatsapp}?text=${whatsappMsg}`, "_blank");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <main className="relative">
      <ScrollProgress />
      <SiteHeader />

      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden pt-40 pb-24 lg:pt-48 lg:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklch,var(--primary)_15%,transparent),transparent_60%)]" />
        <DotPattern className="[mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent)] stroke-border/20 fill-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 text-center lg:px-8">
          <BlurFade>
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 text-sm backdrop-blur">
              <SparklesIcon className="size-3.5 text-primary" />
              <span className="font-medium">Get in touch</span>
            </div>
          </BlurFade>
          <BlurFade delay={0.1}>
            <h1 className="mx-auto mt-8 max-w-3xl text-5xl font-semibold tracking-tight text-balance lg:text-7xl">
              We&apos;d love to hear{" "}
              <span className="text-primary">from you</span>
            </h1>
          </BlurFade>
          <BlurFade delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
              Have a question about BizRavana? Want a demo for your business?
              Our team is ready to help.
            </p>
          </BlurFade>
        </div>
      </section>

      {/* ═══ Contact Section ═══ */}
      <section id="contact" className="pb-24 lg:pb-32">
        <div className="mx-auto max-w-6xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* ── Left: Contact Info Cards ── */}
            <BlurFade direction="right">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Contact Information
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Reach out to us through any of these channels. We typically
                  respond within a few hours.
                </p>

                <div className="mt-8 space-y-4">
                  {/* Company name card */}
                  <div className="flex items-start gap-4 rounded-2xl border bg-card p-5">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Building2 className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        Company
                      </h3>
                      <p className="mt-0.5 text-base font-medium">
                        {company.name}
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-4 rounded-2xl border bg-card p-5">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <MapPin className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        Address
                      </h3>
                      <p className="mt-0.5 text-base font-medium">
                        {company.address}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4 rounded-2xl border bg-card p-5">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Phone className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        Phone
                      </h3>
                      <p className="mt-0.5 text-base font-medium">
                        {company.phone || "+94 75 035 0109"}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <a
                    href={`mailto:${company.email}`}
                    className="flex items-start gap-4 rounded-2xl border bg-card p-5 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        Email
                      </h3>
                      <p className="mt-0.5 text-base font-medium text-primary">
                        {company.email}
                      </p>
                    </div>
                  </a>

                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${company.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-4 rounded-2xl border bg-card p-5 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">
                      <MessageCircle className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        WhatsApp
                      </h3>
                      <p className="mt-0.5 text-base font-medium text-green-600 dark:text-green-400">
                        +{company.whatsapp}
                      </p>
                    </div>
                  </a>

                  {/* Response time */}
                  <div className="flex items-center gap-3 rounded-xl bg-muted/30 px-5 py-3">
                    <Clock className="size-4 text-muted-foreground/60 shrink-0" />
                    <p className="text-sm text-muted-foreground">
                      We typically respond within a few hours during business hours.
                    </p>
                  </div>
                </div>
              </div>
            </BlurFade>

            {/* ── Right: Contact Form ── */}
            <BlurFade direction="left" delay={0.15}>
              <div className="rounded-2xl border bg-card p-8">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Send us a message
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fill in the form below and we&apos;ll get back to you via WhatsApp.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-foreground/90"
                    >
                      Your Name
                    </label>
                    <Input
                      id="name"
                      required
                      value={formState.name}
                      onChange={(e) =>
                        setFormState((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="Kasun Perera"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-foreground/90"
                    >
                      Your Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formState.email}
                      onChange={(e) =>
                        setFormState((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="kasun@example.com"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium text-foreground/90"
                    >
                      Message
                    </label>
                    <Textarea
                      id="message"
                      required
                      value={formState.message}
                      onChange={(e) =>
                        setFormState((p) => ({ ...p, message: e.target.value }))
                      }
                      placeholder="Hi! I'd like to learn more about BizRavana..."
                      className="min-h-[140px] resize-y"
                      rows={5}
                    />
                  </div>

                  <Button
                    type="submit"
                  size="lg"
                  className="group relative w-full text-white"
                  >
                    {sent ? (
                      <>
                        <CheckCircle2 className="size-4 mr-2" />
                        Message sent via WhatsApp
                      </>
                    ) : (
                      <>
                        <Send className="size-4 mr-2" />
                        Send via WhatsApp
                      </>
                    )}
                    <span
                      aria-hidden
                      className="animate-shimmer absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.2)_50%,transparent_70%)] bg-[length:250%_100%] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  </Button>

                  <p className="text-center text-xs text-muted-foreground/60">
                    By submitting, you agree to our{" "}
                    <a href="#" className="underline hover:text-foreground">
                      Privacy Policy
                    </a>
                    . We&apos;ll respond via WhatsApp using the number you provide.
                  </p>
                </form>
              </div>
            </BlurFade>
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative overflow-hidden border-t border-border/40 py-24 lg:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-4 text-center lg:px-8">
          <BlurFade>
            <h2 className="text-4xl font-semibold tracking-tight text-balance lg:text-6xl">
              Ready to get started with{" "}
              <span className="text-primary">BizRavana?</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Start your 3-day free trial today. No credit card required.
            </p>
            <div className="mt-10">
              <a href="/register">
                <ShimmerButton className="h-14 px-10 text-base">
                  <SparklesIcon className="size-5" />
                  Start 3-Day Free Trial
                </ShimmerButton>
              </a>
            </div>
          </BlurFade>
        </div>
      </section>

      <SiteFooter />
      <ScrollToTop />
    </main>
  );
}
