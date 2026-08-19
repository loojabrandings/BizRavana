import type { Metadata } from "next";
import { Bot, Sparkles, MessageSquare } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Button from "@/components/button";
import Reveal from "@/components/reveal";
import { CONTACT } from "@/config/site";

export const metadata: Metadata = {
  title: "AI Chatbots — Coming Soon — BizRavana",
  description:
    "Intelligent 24/7 conversational AI chatbots for WhatsApp and web. Coming soon to BizRavana.",
};

export default function AIChatbotsServicePage() {
  const whatsappUrl = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(
    "Hi BizRavana team! I'm interested in the upcoming AI Chatbots service. Please notify me when it launches."
  )}`;

  return (
    <main className="min-h-screen flex flex-col justify-between">
      <Navbar />

      {/* Ambient background accent blobs */}
      <div className="scene-blobs" aria-hidden="true" />

      {/* Focused Coming Soon Hero */}
      <section className="feat-hero my-auto py-20 lg:py-28" aria-labelledby="ai-chatbots-heading">
        <div className="feat-hero__inner">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-6 tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Coming Soon</span>
            </div>

            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Bot className="w-8 h-8" />
            </div>

            <h1 id="ai-chatbots-heading" className="feat-hero__title">
              AI Chatbots
            </h1>

            <p className="feat-hero__desc">
              We are developing intelligent, 24/7 conversational AI assistants for WhatsApp and web. This service will be launching soon.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
              <Button
                variant="primary"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Notify Me on WhatsApp
              </Button>
              <Button variant="secondary" href="/services">
                Explore All Services
              </Button>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
