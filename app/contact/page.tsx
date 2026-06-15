import type { Metadata } from "next";
import IntroVeil from "../components/IntroVeil";
import AtelierNav from "../atelier/components/AtelierNav";
import AtelierFooter from "../atelier/components/AtelierFooter";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import InquiryForm from "./InquiryForm";

export const metadata: Metadata = {
  title: "Start Your Smile Journey — Teeth by Trev",
  description:
    "Fill out the form and Dr. Trevor J. Thomas will personally review your inquiry. Tell us about your goals, your city, and the smile you imagine.",
};

export default function ContactPage() {
  return (
    <div className="bg-onyx text-ivory">
      <IntroVeil variant="dark" />
      <AtelierNav />
      <main>
        <PageHero
          eyebrow="Begin Your Smile Transformation"
          title="Book your consultation."
          intro="Step one — schedule a consultation with Dr. Trev and take the first step toward the smile you deserve."
          image="/gallery/trev-exam.jpg"
          imageAlt="Dr. Trevor J. Thomas performing a detailed examination in the studio"
        />

        <section className="bg-onyx py-24 lg:py-32">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <Reveal>
              <InquiryForm />
            </Reveal>

            <p className="mx-auto mt-16 max-w-2xl border-t border-ivory/10 pt-8 text-center text-[0.72rem] uppercase tracking-[0.2em] text-ivory/45">
              Questions? Text{" "}
              <a
                href="tel:+14243946159"
                className="text-ivory/70 transition-colors hover:text-gold"
              >
                424-394-6159
              </a>{" "}
              · DM{" "}
              <a
                href="https://www.instagram.com/dr.trevthomas/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-ivory/70 transition-colors hover:text-gold"
              >
                @dr.trevthomas
              </a>
            </p>
          </div>
        </section>
      </main>
      <AtelierFooter />
    </div>
  );
}
