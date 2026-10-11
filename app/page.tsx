import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Preloader from "@/components/Preloader";
import Anschnitt from "@/components/sections/Anschnitt";
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
  return (
    <>
      <Preloader />
      <Header />
      <main>
        <Hero />
        <Handschrift />
        <Lora />
        <Anschnitt />
        <Process />
        <Gallery />
        <Flavors />
        <Pricing />
        <InquiryLazy />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
