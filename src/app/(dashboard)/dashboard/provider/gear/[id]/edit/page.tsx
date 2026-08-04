"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Trash2, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

import { useCategories } from "@/hooks/use-categories";
import { useAuthUser } from "@/hooks/use-auth";
import { useEditGear } from "@/hooks/use-provider";
import { useGearDetails } from "@/hooks/use-gear";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const editGearSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  brand: z.string().min(1, "Brand is required"),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(
    z.object({
      url: z.string().url("Must be a valid URL")
    })
  ).min(1, "At least one image is required"),
  pricePerDay: z.coerce.number().positive("Price must be greater than 0"),
  stockQuantity: z.coerce.number().int().nonnegative("Stock must be 0 or more"),
  condition: z.enum(["NEW", "GOOD", "FAIR"]),
  isAvailable: z.boolean().default(true),
});

type EditGearFormValues = z.infer<typeof editGearSchema>;

export default function EditGearPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { data: user } = useAuthUser();
  const { data: categories } = useCategories();
  const { id } = React.use(params);
  const { data: gear, isLoading: isGearLoading, isError: isGearError } = useGearDetails(id);
  const editGear = useEditGear();
  
  const [hasRedirected, setHasRedirected] = useState(false);

  const form = useForm<EditGearFormValues>({
    resolver: zodResolver(editGearSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      categoryId: "",
      images: [{ url: "" }],
      pricePerDay: 0,
      stockQuantity: 1,
      condition: "NEW",
      isAvailable: true,
    },
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: "images",
  });

  // Guard + Pre-fill
  useEffect(() => {
    if (gear && user) {
      if (gear.providerId !== user.id) {
        if (!hasRedirected) {
          toast.error("You don't have permission to edit this gear");
          router.replace("/dashboard/provider/gear");
          setHasRedirected(true);
        }
        return;
      }
      
      form.reset({
        name: gear.name,
        description: gear.description,
        brand: gear.brand,
        categoryId: gear.categoryId,
        images: gear.images.map(url => ({ url })),
        pricePerDay: Number(gear.pricePerDay),
        stockQuantity: gear.stockQuantity,
        condition: gear.condition,
        isAvailable: gear.isAvailable,
      });
    }
  }, [gear, user, form, router, hasRedirected]);

  const onSubmit = (data: EditGearFormValues) => {
    const payload = {
      ...data,
      images: data.images.map(img => img.url),
    };

    editGear.mutate({ id, data: payload }, {
      onSuccess: () => {
        toast.success("Gear updated successfully!");
        router.push("/dashboard/provider/gear");
      },
      onError: (error: any) => {
        // Specifically surface the 400 active rentals error
        const errorMessage = error.message || "";
        if (errorMessage.includes("active rentals")) {
          toast.error(errorMessage, { duration: 5000 });
          form.setError("stockQuantity", {
            type: "manual",
            message: errorMessage
          });
        }
        else if (
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
          toast.error(error.message || "Failed to update gear");
        }
      },
    });
  };

  if (isGearLoading) {
    return (
      <DashboardShell role="provider" title="Edit Gear" description="Loading gear details...">
        <div className="space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-[500px] w-full rounded-2xl" />
        </div>
      </DashboardShell>
    );
  }

  if (isGearError || !gear) {
    return (
      <DashboardShell role="provider" title="Edit Gear" description="Update your inventory item.">
        <div className="py-20 text-center text-destructive">
          Failed to load gear details. The item might have been deleted or you don't have access.
        </div>
      </DashboardShell>
    );
  }

  // Hide form if guard triggered
  if (gear.providerId !== user?.id) {
    return <DashboardShell role="provider" title="Edit Gear" description="Redirecting..." />;
  }

  return (
    <DashboardShell 
      role="provider" 
      title="Edit Gear" 
      description={`Updating: ${gear.name}`}
    >
      <div className="mb-6">
        <Link href="/dashboard/provider/gear" className="text-sm text-muted-foreground hover:text-primary flex items-center w-fit">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Inventory
        </Link>
      </div>

      <Card className="max-w-3xl rounded-2xl shadow-soft">
        <CardContent className="p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="name">Item Name <span className="text-destructive">*</span></Label>
                <Input 
                  id="name" 
                  {...form.register("name")} 
                  className="rounded-xl" 
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description <span className="text-destructive">*</span></Label>
                <Textarea 
                  id="description" 
                  {...form.register("description")} 
                  className="rounded-xl min-h-[100px]" 
                />
                {form.formState.errors.description && (
                  <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand <span className="text-destructive">*</span></Label>
                <Input 
                  id="brand" 
                  {...form.register("brand")} 
                  className="rounded-xl" 
                />
                {form.formState.errors.brand && (
                  <p className="text-xs text-destructive">{form.formState.errors.brand.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Category <span className="text-destructive">*</span></Label>
                <Select
                  value={form.watch("categoryId")}
                  onValueChange={(val) => form.setValue("categoryId", val || "", { shouldValidate: true })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select a category">
                      {form.watch("categoryId") && Array.isArray(categories)
                        ? categories.find((c: any) => c.id === form.watch("categoryId"))?.name || "Select a category"
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(categories) && categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoryId && (
                  <p className="text-xs text-destructive">{form.formState.errors.categoryId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerDay">Price Per Day ($) <span className="text-destructive">*</span></Label>
                <Input 
                  id="pricePerDay" 
                  type="number"
                  step="0.01"
                  {...form.register("pricePerDay")} 
                  className="rounded-xl" 
                />
                {form.formState.errors.pricePerDay && (
                  <p className="text-xs text-destructive">{form.formState.errors.pricePerDay.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockQuantity">Stock Quantity <span className="text-destructive">*</span></Label>
                <Input 
                  id="stockQuantity" 
                  type="number"
                  {...form.register("stockQuantity")} 
                  className="rounded-xl" 
                />
                {form.formState.errors.stockQuantity && (
                  <p className="text-xs text-destructive">{form.formState.errors.stockQuantity.message}</p>
                )}
              </div>

              <div className="space-y-3 sm:col-span-2">
                <Label>Condition <span className="text-destructive">*</span></Label>
                <RadioGroup 
                  value={form.watch("condition")} 
                  onValueChange={(val) => form.setValue("condition", val as any, { shouldValidate: true })}
                  className="flex flex-wrap gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NEW" id="r1" />
                    <Label htmlFor="r1" className="cursor-pointer font-normal">New (Never used)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="GOOD" id="r2" />
                    <Label htmlFor="r2" className="cursor-pointer font-normal">Good (Lightly used, fully functional)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="FAIR" id="r3" />
                    <Label htmlFor="r3" className="cursor-pointer font-normal">Fair (Noticeable wear, still usable)</Label>
                  </div>
                </RadioGroup>
                {form.formState.errors.condition && (
                  <p className="text-xs text-destructive">{form.formState.errors.condition.message}</p>
                )}
              </div>

              <div className="space-y-4 sm:col-span-2 border-t border-border/50 pt-6">
                <div className="flex items-center justify-between">
                  <Label>Images <span className="text-destructive">*</span></Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="rounded-full h-8"
                    onClick={() => appendImage({ url: "" })}
                  >
                    <Plus className="h-3 w-3 mr-1" /> Add Image URL
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {imageFields.map((field, index) => {
                    const currentUrl = form.watch(`images.${index}.url`);
                    return (
                      <div key={field.id} className="flex gap-3 items-start">
                        <div className="flex-1 space-y-2">
                          <Input
                            {...form.register(`images.${index}.url` as const)}
                            placeholder="https://example.com/image.jpg"
                            className="rounded-xl"
                          />
                          {form.formState.errors.images?.[index]?.url && (
                            <p className="text-xs text-destructive">
                              {form.formState.errors.images[index]?.url?.message}
                            </p>
                          )}
                        </div>
                        {currentUrl ? (
                          <div className="h-10 w-10 relative rounded-md overflow-hidden bg-muted border shrink-0">
                            <Image src={currentUrl} alt="Preview" fill className="object-cover" unoptimized />
                          </div>
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center rounded-md bg-muted border shrink-0">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => imageFields.length > 1 && removeImage(index)}
                          disabled={imageFields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                  {form.formState.errors.images && !Array.isArray(form.formState.errors.images) && (
                    <p className="text-xs text-destructive">{form.formState.errors.images.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3 sm:col-span-2 border-t border-border/50 pt-6 flex items-center justify-between">
                <div>
                  <Label htmlFor="isAvailable" className="text-base">List as Available</Label>
                  <p className="text-sm text-muted-foreground">Make this item immediately available for rent.</p>
                </div>
                <Switch 
                  id="isAvailable"
                  checked={form.watch("isAvailable")}
                  onCheckedChange={(val) => form.setValue("isAvailable", val)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/50">
              <Button 
                type="button" 
                variant="ghost" 
                className="rounded-full mr-2"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="rounded-full gradient-cta text-white px-8"
                disabled={editGear.isPending}
              >
                {editGear.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
