"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isPending, setIsPending] = React.useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsPending(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsPending(false);
    
    toast.success("Message sent successfully! We'll get back to you soon.");
    form.reset();
  };

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Contact Us</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Have a question about GearUp? We're here to help. Reach out to our team and we'll respond as soon as we can.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Information */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Email</h3>
                <p className="text-muted-foreground">Our friendly team is here to help.</p>
                <a href="mailto:support@gearup.com" className="text-primary font-medium mt-2 block hover:underline">
                  support@gearup.com
                </a>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Phone</h3>
                <p className="text-muted-foreground">Mon-Fri from 8am to 5pm.</p>
                <a href="tel:+15550000000" className="text-primary font-medium mt-2 block hover:underline">
                  +1 (555) 000-0000
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/10">
            <CardContent className="p-6 flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-full text-primary shrink-0">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Office</h3>
                <p className="text-muted-foreground">Come say hello at our office HQ.</p>
                <p className="text-primary font-medium mt-2">
                  100 Adventure Way<br />
                  San Francisco, CA 94105
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-border/50">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      {...form.register("name")}
                      className={form.formState.errors.name ? "border-destructive" : ""}
                    />
                    {form.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      {...form.register("email")}
                      className={form.formState.errors.email ? "border-destructive" : ""}
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="How can we help you?"
                    {...form.register("subject")}
                    className={form.formState.errors.subject ? "border-destructive" : ""}
                  />
                  {form.formState.errors.subject && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.subject.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    {...form.register("message")}
                    className={form.formState.errors.message ? "border-destructive resize-none" : "resize-none"}
                  />
                  {form.formState.errors.message && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.message.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-white"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
