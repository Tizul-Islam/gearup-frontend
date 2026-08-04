import Link from "next/link";
import { FaqAccordion } from "./faq-accordion";

export const metadata = {
  title: "FAQ | GearUp",
  description: "Answers about deposits, damage protection, extensions and provider payouts.",
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="flex mb-8 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">FAQ</span>
        </nav>

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Frequently asked questions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Everything about renting, listing and getting paid.
          </p>
        </div>

        {/* FAQ Accordion */}
        <FaqAccordion />
      </div>
    </div>
  );
}
