"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuthUser, useUpdateProfile } from "@/hooks/use-auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email(),
  phone: z.string().min(10, "Please enter a valid phone number."),
  address: z.string().min(5, "Please enter a valid address."),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProviderProfilePage() {
  const { data: user, isLoading } = useAuthUser();
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  React.useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user, form]);

  const onSubmit = (data: ProfileFormValues) => {
    // Exclude email from the payload since it's likely read-only or handled differently
    const { email, ...updateData } = data;
    
    updateProfile.mutate(updateData, {
      onSuccess: () => {
        toast.success("Profile updated successfully");
      },
      onError: (error: any) => {
        if (
          error?.errorDetails?.errorSource &&
          Array.isArray(error.errorDetails.errorSource)
        ) {
          error.errorDetails.errorSource.forEach((err: any) => {
            if (err.path && err.message) {
              form.setError(err.path as any, {
                type: "manual",
                message: err.message,
              });
            }
          });
        } else {
          toast.error(error.message || "Failed to update profile.");
        }
      },
    });
  };

  if (isLoading) {
    return (
      <DashboardShell role="provider" title="Profile" description="View and edit your GearUp profile details.">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </DashboardShell>
    );
  }

  if (!user) {
    return <div>Failed to load profile.</div>;
  }

  // Get initials for Avatar
  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "GU";

  return (
    <DashboardShell role="provider" title="Profile" description="View and edit your GearUp profile details.">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Left Column - Avatar Card */}
        <Card className="h-fit rounded-2xl shadow-sm border-border/50">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10 text-lg text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <p className="mt-4 font-semibold text-lg">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Button variant="outline" className="mt-5 w-full rounded-full">
              Change photo
            </Button>
          </CardContent>
        </Card>

        {/* Right Column - Form Details Card */}
        <Card className="rounded-2xl shadow-sm border-border/50">
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input 
                  id="name" 
                  {...form.register("name")} 
                  className="rounded-xl" 
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  {...form.register("email")} 
                  className="rounded-xl bg-muted/50" 
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  {...form.register("phone")} 
                  className="rounded-xl" 
                  placeholder="+8801XXXXXXXXX"
                />
                {form.formState.errors.phone && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address / City</Label>
                <Input 
                  id="address" 
                  {...form.register("address")} 
                  className="rounded-xl" 
                />
                {form.formState.errors.address && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.address.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2 pt-2">
                <Button 
                  type="submit" 
                  className="rounded-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white" 
                  disabled={updateProfile.isPending}
                >
                  {updateProfile.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
