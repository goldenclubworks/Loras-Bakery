import ReactDOM from "react-dom";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Preloader from "@/components/Preloader";
import Faq from "@/components/sections/Faq";
import Flavors from "@/components/sections/Flavors";
import Gallery from "@/components/sections/Gallery";
import Handschrift from "@/components/sections/Handschrift";
import Hero from "@/components/sections/Hero";
import InquiryLazy from "@/components/sections/InquiryLazy";
import Lora from "@/components/sections/Lora";
import Pricing from "@/components/sections/Pricing";
import Process from "@/components/sections/Process";

export default function Home() {
  // Das Spitzenband liegt im ersten Bildschirm (Hero): früh laden, nicht erst nach dem CSS entdecken
  ReactDOM.preload("/lace/lace-band.avif", { as: "image", type: "image/avif", fetchPriority: "high" });
  return (
    <>
      <Preloader />
      <Header />
      <main>
        <Hero />
        <Handschrift />
        <Lora />
        <Faq />
        <Process />
        <Gallery />
        <Pricing />
        <Flavors />
        <InquiryLazy />
      </main>
      <Footer />
    </>
  );
}
