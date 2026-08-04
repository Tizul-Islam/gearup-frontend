"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How do deposits and damage protection work?",
    answer:
      "When you rent an item, a temporary hold is placed on your card for the deposit amount. Once the item is returned in the same condition, the hold is released. If the gear is damaged, the repair cost is deducted from your deposit.",
  },
  {
    question: "Can I extend my rental period?",
    answer:
      "Yes, you can request a rental extension through your dashboard as long as the gear hasn't been booked by another customer. The provider must approve your extension request.",
  },
  {
    question: "When do providers get paid?",
    answer:
      "Providers receive their payouts 24 hours after the gear is successfully returned by the customer. Payments are processed securely via our payment partners directly to your linked bank account.",
  },
  {
    question: "What happens if a customer cancels their booking?",
    answer:
      "If a customer cancels more than 48 hours before the start date, they get a full refund. Cancellations within 48 hours may incur a penalty fee, part of which is paid to the provider to compensate for lost booking opportunities.",
  },
];

export function FaqAccordion() {
  return (
    <div className="w-full">
      <Accordion className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left text-lg font-medium">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-base leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
