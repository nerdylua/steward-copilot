import Header from "@/components/landing-page/header";
import Hero from "@/components/landing-page/hero";
import { Footer } from "@/components/landing-page/footer-cta/Footer";
import { FooterCTA } from "@/components/landing-page/footer-cta";
import { FooterCTASectionSeparator } from "@/components/landing-page/footer-cta/FooterCTASectionSeparator";
import { EditorialLines } from "@/components/landing-page/hero/EditorialLines";
import { FAQSection } from "@/components/landing-page/faq";
import { FeaturesSection } from "@/components/landing-page/hero/FeaturesSection";
import { SectionSeparators } from "@/components/landing-page/hero/SectionSeparators";
import { DesktopPlayground } from "@/components/landing-page/playground/DesktopPlayground";
import { TemplatesSection } from "@/components/landing-page/templates";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function MarketingHomePage() {
  return (
    <main className="h-screen bg-[#151515]">
      <ScrollArea type="scroll" scrollHideDelay={500} className="h-full w-full">
        <EditorialLines />
        <Header />
        <Hero />

        <div className="mx-auto w-[90%] max-w-[1400px] sm:w-[88%] md:w-[85%] md:px-4 lg:w-[80%] lg:px-6 xl:w-[80%] xl:px-8">
          <SectionSeparators />

          <div className="snap-y snap-mandatory">
            <FeaturesSection />
            <DesktopPlayground />
            <TemplatesSection />
          </div>

          <div className="md:hidden">
            <SectionSeparators />
          </div>

          <FAQSection />
          <FooterCTA />
        </div>

        <FooterCTASectionSeparator />

        <div className="mx-auto w-[90%] max-w-[1400px] sm:w-[88%] md:w-[85%] md:px-4 lg:w-[80%] lg:px-6 xl:w-[80%] xl:px-8">
          <Footer />
        </div>
      </ScrollArea>
    </main>
  );
}
