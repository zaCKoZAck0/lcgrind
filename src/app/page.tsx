import { CompaniesSection } from "~/components/home/companies";
import { CTA } from "~/components/home/cta";
import { Features } from "~/components/home/features";
import { HeroSection } from "~/components/home/hero";
import { Sponsors } from "~/components/home/sponsors";
import { TestimonialsSection } from "~/components/home/testimonial";
import { SoftwareApplicationJsonLd, FAQJsonLd } from "~/components/seo/json-ld";

const faqItems = [
  {
    question: "What is LC Grind?",
    answer: "LC Grind is a free platform for practicing company-wise LeetCode problems and interview preparation. It provides access to coding interview questions from top tech companies like Google, Meta, Amazon, Microsoft, and Apple.",
  },
  {
    question: "Is LC Grind free to use?",
    answer: "Yes, LC Grind is completely free to use. You can access all company-wise LeetCode problems, DSA sheets like Blind 75 and NeetCode 150, and premium problem access without any cost.",
  },
  {
    question: "How do I prepare for FAANG interviews using LC Grind?",
    answer: "LC Grind helps you prepare for FAANG interviews by providing company-specific problem lists, popular DSA sheets like Blind 75, LeetCode 75, and NeetCode 150, and tracking your progress across different companies and topics.",
  },
  {
    question: "What companies are covered on LC Grind?",
    answer: "LC Grind covers interview questions from all major tech companies including Google, Meta (Facebook), Amazon, Apple, Microsoft, Netflix, Uber, Airbnb, LinkedIn, and many more top product companies worldwide.",
  },
];

export default function Home() {
  return <div className="flex flex-col min-h-screen">
    <SoftwareApplicationJsonLd />
    <FAQJsonLd items={faqItems} />
    <HeroSection />
    <Features />
    <CompaniesSection />
    <TestimonialsSection />
    <CTA />
    <Sponsors />
  </div>;
}
