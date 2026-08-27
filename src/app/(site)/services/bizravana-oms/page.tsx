import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import DeferredSceneMount from "@/components/deferred-scene-mount";
import Button from "@/components/button";
import FaqList from "@/components/faq-list";
import Reveal from "@/components/reveal";
import JsonLd from "@/components/json-ld";
import { SITE_URL } from "@/config/site";

export const metadata: Metadata = {
  title: "BizRavana OMS — Order & Business Management System",
  description:
    "Manage orders, customers, inventory, expenses, quotations, deliveries and reports — all from one powerful platform.",
  alternates: {
    canonical: `${SITE_URL}/services/bizravana-oms`,
  },
};

type FeatureGroup = {
  heading: string;
  desc: string;
  bullets: string[];
};

type ReviewQuote = {
  text: string;
  author: string;
  business: string;
};

type FaqEntry = {
  question: string;
  answer: string;
};

type ReviewsCopy = {
  quotes: ReviewQuote[];
};

type SectionCopy = {
  title: string;
  desc?: string;
  bullets?: string[];
  groups?: FeatureGroup[];
  cta?: { label: string; href?: string };
  reviews?: ReviewsCopy;
  faq?: FaqEntry[];
};

type Section = {
  id: string;
  title?: string;
  copy?: SectionCopy;
};

const SECTIONS: Section[] = [
  {
    id: "features-order",
    copy: {
      title: "Orders, Invoices & Quotations",
      desc: "From the first quote to the final payment — manage your entire sales process in one place. Create professional quotations, turn them into orders instantly, generate invoices, and keep every payment and status organized.",
      bullets: [
        "Create & manage orders with automatic numbering",
        "Professional quotations with ready-to-use templates",
        "Convert quotations to orders in one click",
        "Generate invoices instantly",
        "Track every order from confirmation to delivery",
      ],
    },
  },
  {
    id: "features-courier",
    copy: {
      title: "Courier & Deliveries",
      desc: "Ship orders faster and keep every delivery under control. Connect your courier services with BizRavana to generate waybills, dispatch orders in bulk, and track shipments without switching between platforms.",
      bullets: [
        "Royal Express & Koombiyo integration",
        "Instant waybill generation",
        "Bulk order dispatch",
        "Shipment status & tracking",
        "Delivery status updates",
        "Centralized courier management",
      ],
    },
  },
  {
    id: "features-metrix",
    copy: {
      title: "Business Metrics & Insights",
      desc: "See what’s happening in your business at a glance. Track orders, revenue, profit, payments and deliveries with real-time metrics that help you make faster, smarter decisions.",
      bullets: [
        "Total orders & sales performance",
        "Net profit & expense tracking",
        "Pending & collected payments",
        "Delivery & fulfillment overview",
        "Month-over-month performance trends",
        "Real-time business dashboard",
      ],
    },
  },
  {
    id: "features-inventory",
    copy: {
      title: "Inventory & Expense Tracking",
      desc: "Know what’s in stock, where your money is going, and how it impacts your bottom line. Keep inventory and expenses connected, so every stock movement and business cost is easy to track.",
      bullets: [
        "Real-time inventory & stock levels",
        "Low-stock alerts & reorder visibility",
        "Supplier management & stock history",
        "Record and categorize business expenses",
        "Track paid & pending expenses",
        "Link inventory purchases to expenses",
        "Detailed expense & cost reports",
      ],
    },
  },
  {
    id: "features-reports",
    copy: {
      title: "Reports & Analytics",
      desc: "Turn your business data into clear insights you can act on. Get an accurate view of your sales, expenses and profitability with automated reports that help you understand performance and make better decisions.",
      bullets: [
        "Profit & loss reports",
        "Sales & order analytics",
        "Expense & cost summaries",
        "Revenue & profitability insights",
        "Business performance trends",
        "Automated reports & insights",
      ],
    },
  },
  {
    id: "features-smart",
    copy: {
      title: "Smart Features",
      groups: [
        {
          heading: "WhatsApp Integration",
          desc: "Send order confirmations, quotations, and invoice messages directly via WhatsApp using customizable templates.",
          bullets: [
            "Direct order and quotation notifications",
            "Customizable WhatsApp message templates",
            "Seamless automated messaging workflow",
          ],
        },
        {
          heading: "Team Collaboration",
          desc: "Invite team members with role-based access. Assign tasks, track activity, and work together seamlessly.",
          bullets: [
            "Multi-user support with custom roles",
            "Activity log to track team actions",
            "Effortless task assignment and management",
          ],
        },
        {
          heading: "Settings & Customization",
          desc: "Customize your business profile, branding, theme preferences, and configure courier accounts and templates.",
          bullets: [
            "Custom business profile and branding",
            "Theme preference setup",
            "Courier and template configurations",
          ],
        },
        {
          heading: "AI Assistant",
          desc: "Power your customer interactions with intelligent AI tools that handle inquiries and automate responses around the clock.",
          bullets: [
            "Smart WhatsApp integration",
            "24/7 automated chatbots",
            "Instant customer inquiry handling",
          ],
        },
        {
          heading: "Smart Automation",
          desc: "Put your business on autopilot with smart workflows that save time and keep your operations running smoothly.",
          bullets: [
            "Automated lead follow-ups",
            "Streamlined customer management",
            "Hands-free workflow triggers",
          ],
        },
      ],
    },
  },
  {
    id: "pricing",
    copy: {
      title: "Affordable Pricing, Powerful Results",
      cta: { label: "Choose Your Plan", href: "/pricing" },
    },
  },
  {
    id: "reviews",
    copy: {
      title: "Word of mouth",
      desc: "Shop owners who moved their orders, invoices and deliveries to BizRavana — in their own words.",
      reviews: {
        quotes: [
          {
            text: "A quotation used to take me half an hour. Now the customer gets it on WhatsApp before they've left the shop.",
            author: "Nadeesha",
            business: "Bella Boutique",
          },
          {
            text: "I used to hand-write waybills at midnight. Bulk dispatch gave me my evenings back.",
            author: "Kasun",
            business: "Kandy Craft",
          },
          {
            text: "For the first time I know my profit at the end of the day, not the end of the month.",
            author: "Fathima",
            business: "Cake Palace",
          },
        ],
      },
    },
  },
  {
    id: "faq",
    copy: {
      title: "FAQ",
      faq: [
        {
          question: "Is BizRavana really free?",
          answer:
            "Every new account includes a 3-day free trial with full access to explore the platform. After the trial, simply choose the plan that best fits your business.",
        },
        {
          question: "How is BizRavana different from using Excel or notebooks?",
          answer:
            "BizRavana brings orders, customers, inventory, expenses, quotations and reports together in one organized workspace. Everything stays connected automatically, reducing manual work and saving time.",
        },
        {
          question: "Which courier services are supported?",
          answer:
            "BizRavana currently supports Royal Express and Koombiyo Delivery, with both manual and automated dispatch workflows. More courier integrations will be introduced in future updates.",
        },
        {
          question: "Is my business data secure?",
          answer:
            "Yes. Every business has its own isolated workspace, ensuring your data remains private and secure.",
        },
        {
          question: "Do I need technical knowledge?",
          answer:
            "No. BizRavana is designed to be simple and easy to use, allowing you to get started in just a few minutes.",
        },
      ],
    },
  },
];

const FAQ_ITEMS = SECTIONS.find((section) => section.id === "faq")?.copy?.faq ?? [];

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "BizRavana OMS",
  url: `${SITE_URL}/services/bizravana-oms`,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "All-in-one business management for growing Sri Lankan businesses — orders, quotations, invoices, customers, inventory, expenses, courier deliveries and reports.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "LKR",
    description: "Free 3-day trial; subscription plans from Basic to Enterprise.",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

function ReviewsBlock({ id, copy }: { id: string; copy: SectionCopy }) {
  const reviews = copy.reviews;
  if (!reviews) return null;

  return (
    <div className="features">
      <Reveal>
        <h2 id={`${id}-heading`} className="features__title">
          {copy.title}
        </h2>
      </Reveal>
      {copy.desc ? (
        <Reveal delay={90}>
          <p className="features__desc">{copy.desc}</p>
        </Reveal>
      ) : null}
      <ul className="reviews__list">
        {reviews.quotes.map((quote, i) => (
          <li key={quote.text} className="reviews__item">
            <Reveal delay={i * 120}>
              <figure className="reviews__figure">
                <blockquote className="reviews__quote">{quote.text}</blockquote>
                <figcaption className="reviews__author">
                  {quote.author} — {quote.business}
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function BizRavanaOmsPage() {
  return (
    <main>
      <Navbar />
      <DeferredSceneMount />

      <section
        id="hero"
        className="section section--hero"
        aria-labelledby="hero-heading"
      >
        <div className="hero">
          <Reveal>
            <h1 id="hero-heading" className="hero__title">
              <span className="hero__title-line">Work Smarter</span>
              <span className="hero__title-line">Grow Faster</span>
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="hero__subtitle">
              Manage orders, customers, inventory, expenses, quotations,
              deliveries and reports — all from one powerful platform.
            </p>
          </Reveal>
          <Reveal delay={280}>
            <div className="hero__actions">
              <Button href="#pricing" variant="primary">
                Start Free Trial
              </Button>
              <Button href="/features" variant="secondary">
                Explore features
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      {SECTIONS.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className={`section section--${section.id}`}
          aria-labelledby={section.copy ? `${section.id}-heading` : undefined}
        >
          {section.copy ? (
            section.copy.reviews ? (
              <ReviewsBlock id={section.id} copy={section.copy} />
            ) : (
              <div className="features">
                <Reveal>
                  <h2 id={`${section.id}-heading`} className="features__title">
                    {section.copy.title}
                  </h2>
                </Reveal>
                {section.copy.desc ? (
                  <Reveal delay={90}>
                    <p className="features__desc">{section.copy.desc}</p>
                  </Reveal>
                ) : null}
                {section.copy.groups ? (
                  <div className="features__groups">
                    {section.copy.groups.map((group, gi) => (
                      <Reveal
                        key={group.heading}
                        className="features__group"
                        delay={gi * 90}
                      >
                        <h3 className="features__group-heading">
                          {group.heading}
                        </h3>
                        <p className="features__group-desc">{group.desc}</p>
                        <ul className="features__group-list">
                          {group.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      </Reveal>
                    ))}
                  </div>
                ) : (
                  <Reveal delay={180}>
                    <ul className="features__list">
                      {section.copy.bullets?.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  </Reveal>
                )}
                {section.copy.faq ? (
                  <Reveal delay={180}>
                    <FaqList items={section.copy.faq} />
                  </Reveal>
                ) : null}
                {section.copy?.cta ? (
                  <Reveal delay={260}>
                    <div className="features__actions">
                      <Button
                        {...(section.copy.cta.href
                          ? { href: section.copy.cta.href }
                          : {})}
                        variant="primary"
                      >
                        {section.copy.cta.label}
                      </Button>
                    </div>
                  </Reveal>
                ) : SECTIONS[index + 1] ? (
                  <Reveal delay={260}>
                    <div className="features__actions">
                      <Button href="/features" variant="secondary">
                        Explore all features
                      </Button>
                    </div>
                  </Reveal>
                ) : null}
              </div>
            )
          ) : (
            <h2 className="section__title">{section.title}</h2>
          )}
        </section>
      ))}

      <section
        id="cta"
        className="section section--cta"
        aria-labelledby="cta-heading"
      >
        <div className="cta">
          <Reveal>
            <h2 id="cta-heading" className="cta__title">
              Ready to take control of your business?
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="cta__desc">
              Start your 3-day free trial and see everything in one place.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="cta__actions">
              <Button href="/login" variant="primary">
                Start Free Trial →
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <JsonLd data={softwareJsonLd} />
      <JsonLd data={faqJsonLd} />

      <Footer />
    </main>
  );
}
