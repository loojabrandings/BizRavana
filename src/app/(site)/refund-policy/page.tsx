import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Reveal from "@/components/reveal";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — BizRavana",
  description:
    "How subscription cancellations and refund requests are handled when you use the BizRavana services.",
};

const sections = [
  {
    title: "1. Free Trial",
    content: [
      "BizRavana offers a 3-day free trial to eligible new users.",
      "The purpose of the free trial is to allow you to evaluate the platform and determine whether it meets your business requirements before purchasing a subscription.",
      "No payment is required to start the free trial.",
    ],
  },
  {
    title: "2. Subscription Payments",
    content: [
      "BizRavana is a subscription-based Software as a Service (SaaS) platform.",
      "Subscription payments provide access to the selected plan and its available features for the chosen billing period.",
      "Subscription fees are charged securely through trusted third-party payment providers, including PayHere.",
    ],
  },
  {
    title: "3. Cancellation",
    content: [
      "You may cancel your subscription at any time.",
      "If you cancel: Your subscription will remain active until the end of your current billing period. You will continue to have access to all features included in your subscription until that period expires. Cancellation prevents future subscription renewals but does not immediately terminate your account.",
      "If automatic recurring billing is available and enabled, cancellation will stop future recurring payments.",
      "If automatic recurring billing is not available, no further action is required after your current subscription expires.",
    ],
  },
  {
    title: "4. Refund Policy",
    content: [
      "Because BizRavana provides a free trial before purchase, subscription payments are generally non-refundable.",
      "Once a subscription payment has been successfully processed and access to the subscribed plan has been provided, refunds will not be issued simply because: You no longer wish to use the Service, You changed your mind after purchasing, You did not use the Service, Your business requirements changed, You forgot to cancel before the next renewal date, or You only used part of your subscription period.",
    ],
  },
  {
    title: "5. Duplicate or Incorrect Payments",
    content: [
      "If you believe you were charged incorrectly or a duplicate payment was processed, you must contact BizRavana within 14 days of the transaction date.",
      "Each request will be reviewed individually.",
      "If BizRavana confirms that a duplicate payment was processed, an incorrect amount was charged due to a billing error, or another payment error occurred that was the responsibility of BizRavana, an appropriate refund may be approved.",
    ],
  },
  {
    title: "6. Approved Refunds",
    content: [
      "Where a refund is approved, BizRavana will initiate the refund within 3 business days after approval.",
      "Refunds will be issued to the original payment method whenever possible.",
      "Please note that the time taken for the refunded amount to appear in your account depends on your payment provider or financial institution and is outside the control of BizRavana.",
    ],
  },
  {
    title: "7. Situations Where Refunds Will Not Be Provided",
    content: [
      "Refunds will generally not be provided in the following situations:",
      "Subscription payments after successful activation.",
      "Partial use of a subscription period.",
      "Failure to cancel before the next billing cycle.",
      "Change of mind after purchasing.",
      "Lack of usage after subscription activation.",
      "Suspension or termination of an account due to violation of our Terms & Conditions.",
      "Service interruptions caused by third-party providers or circumstances beyond our reasonable control.",
    ],
  },
  {
    title: "8. Subscription Expiry",
    content: [
      "If your subscription expires:",
      "Your account may enter Read-Only Mode.",
      "Existing business data may remain available during the applicable retention period.",
      "Certain features, including creating or editing records, may be restricted until your subscription is renewed.",
    ],
  },
  {
    title: "9. How to Request a Refund",
    content: [
      "To request a refund for an eligible payment issue, please contact us with the following information:",
      "Registered email address, Business name, Transaction ID or payment reference, Payment date, Amount paid, and Description of the issue.",
      "Providing complete information helps us process your request more efficiently.",
    ],
  },
  {
    title: "10. Changes to This Policy",
    content: [
      "BizRavana reserves the right to update or modify this Refund & Cancellation Policy at any time.",
      "Any changes will be published on this page together with the revised \"Last Updated\" date.",
      "Continued use of the Services after changes become effective constitutes acceptance of the updated policy.",
    ],
  },
  {
    title: "11. Contact Us",
    content: [
      "If you have any questions regarding this Refund & Cancellation Policy, please contact us.",
      "BizRavana",
      "Address: Near the temple, Seelagama, Belihuloya",
      "Email: loojabrandings@gmail.com",
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <main>
      <Navbar />

      {/* Ambient accent blobs — the landing pages' fixed background layer. */}
      <div className="scene-blobs" aria-hidden="true" />

      {/* 1. Hero — centered statement, same rhythm as the other editorial pages. */}
      <section className="feat-hero" aria-labelledby="refund-hero-heading">
        <div className="feat-hero__inner">
          <Reveal>
            <p className="about-eyebrow">Legal</p>
            <h1 id="refund-hero-heading" className="feat-hero__title">
              Refund &amp; Cancellation Policy
            </h1>
            <p className="feat-hero__desc">
              This Refund &amp; Cancellation Policy explains how subscription
              cancellations and refund requests are handled when you use our
              Services. By purchasing a BizRavana subscription, you agree to
              this policy.
            </p>
            <p className="legal__updated">Last updated: July 2026</p>
          </Reveal>
        </div>
      </section>

      {/* 2. The document — one hairline-divided section per clause. */}
      <section className="about-section" aria-label="Refund and cancellation policy">
        <div className="about-section__inner legal__list">
          {sections.map((section) => (
            <Reveal key={section.title} className="legal__item">
              <h2 className="legal__heading">{section.title}</h2>
              <div className="legal__content">
                {section.content.map((item) => (
                  <p key={item}>{item}</p>
                ))}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
