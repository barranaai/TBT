import type { Metadata } from "next";
import IntroVeil from "../components/IntroVeil";
import Nav from "../components/Nav";
import Hero from "../components/Hero";
import Philosophy from "../components/Philosophy";
import Stats from "../components/Stats";
import Services from "../components/Services";
import Gallery from "../components/Gallery";
import Process from "../components/Process";
import FeatureBand from "../components/FeatureBand";
import Financing from "../components/Financing";
import Testimonials from "../components/Testimonials";
import Consultation from "../components/Consultation";
import Footer from "../components/Footer";
import SectionDivider from "../components/SectionDivider";
import PullQuote from "../components/PullQuote";
import Clientele from "../components/Clientele";

export const metadata: Metadata = {
  title: "Teeth by Trev — Classic",
  description:
    "The classic Teeth by Trev experience. Cosmetic & implant dentistry by Dr. Trevor J. Thomas.",
};

export default function ClassicHome() {
  return (
    <>
      <IntroVeil variant="light" />
      <Nav />
      <main className="flex-1">
        <Hero />
        <Philosophy />
        <PullQuote />
        <Stats />
        <Services />
        <div className="bg-ivory py-20">
          <SectionDivider />
        </div>
        <Gallery />
        <Clientele />
        <Process />
        <FeatureBand />
        <Testimonials />
        <Financing />
        <Consultation />
      </main>
      <Footer />
    </>
  );
}
