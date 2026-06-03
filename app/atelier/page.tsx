import type { Metadata } from "next";
import IntroVeil from "../components/IntroVeil";
import AtelierNav from "./components/AtelierNav";
import AtelierHero from "./components/AtelierHero";
import Marquee from "./components/Marquee";
import Manifesto from "./components/Manifesto";
import WorkIndex from "./components/WorkIndex";
import Process from "./components/Process";
import ServiceList from "./components/ServiceList";
import AtelierContact from "./components/AtelierContact";
import AtelierFooter from "./components/AtelierFooter";

export const metadata: Metadata = {
  title: "The Atelier — Teeth by Trev",
  description:
    "A couture atelier of cosmetic & implant dentistry by Dr. Trevor J. Thomas. Where the smile becomes art.",
};

export default function AtelierPage() {
  return (
    <div className="bg-onyx">
      <IntroVeil variant="dark" />
      <AtelierNav />
      <main>
        <AtelierHero />
        <Marquee />
        <Manifesto />
        <WorkIndex />
        <Process />
        <ServiceList />
        <AtelierContact />
      </main>
      <AtelierFooter />
    </div>
  );
}
