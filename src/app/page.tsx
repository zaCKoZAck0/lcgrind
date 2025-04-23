import { CompaniesSection } from "~/components/home/companies";
import { CTA } from "~/components/home/cta";
import { Features } from "~/components/home/features";
import { HeroSection } from "~/components/home/hero";
import { Sponsors } from "~/components/home/sponsors";
import { TestimonialsSection } from "~/components/home/testimonial";

export default function Home() {
  return <div className="flex flex-col min-h-screen">
    <HeroSection />
    <Features />
    <CompaniesSection />
    <TestimonialsSection />
    <CTA />
    <Sponsors />
  </div>;
}
