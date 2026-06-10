import type { Metadata } from "next";
import IntroVeil from "./components/IntroVeil";
import AtelierNav from "./atelier/components/AtelierNav";
import AtelierHero from "./atelier/components/AtelierHero";
import Marquee from "./atelier/components/Marquee";
import Manifesto from "./atelier/components/Manifesto";
import WorkIndex from "./atelier/components/WorkIndex";
import Process from "./atelier/components/Process";
import ServiceList from "./atelier/components/ServiceList";
import AtelierContact from "./atelier/components/AtelierContact";
import AtelierFooter from "./atelier/components/AtelierFooter";

export const metadata: Metadata = {
  title: "Teeth by Trev — Cosmetic & Implant Dentistry",
  description:
    "A couture atelier of cosmetic & implant dentistry by Dr. Trevor J. Thomas. Where the smile becomes art.",
};

export default function Home() {
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
