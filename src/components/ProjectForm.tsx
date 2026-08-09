"use client";

import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

const projectSchema = z.object({
  title: z.string().min(1, "Project Title is required"),
  liveUrl: z.string().url("Must be a valid URL").min(1, "Live URL is required"),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  imageUrl: z.string().min(1, "Image URL or Path is required"),
  description: z.string().min(1, "Description is required"),
  keyFeatures: z.array(z.object({ value: z.string().min(1, "Feature cannot be empty") })),
  techTags: z.string().min(1, "Tech tags are required"),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

export default function ProjectForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      liveUrl: "",
      githubUrl: "",
      imageUrl: "",
      description: "",
      keyFeatures: [{ value: "" }],
      techTags: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "keyFeatures",
    control,
  });

  const onSubmit = async (data: ProjectFormValues) => {
    // Here you can handle the submission, for example API calls
    console.log("Form submitted with:", data);
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-neutral-200 dark:border-neutral-800">
      <CardHeader className="bg-neutral-50/50 dark:bg-neutral-900/50 border-b border-neutral-100 dark:border-neutral-800 pb-6">
        <CardTitle className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Add New Project</CardTitle>
        <CardDescription className="text-neutral-500 dark:text-neutral-400">
          Enter the details of your project below to showcase it in your portfolio.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">Project Title <span className="text-red-500">*</span></Label>
            <Input id="title" placeholder="e.g. GearUp" {...register("title")} className="focus-visible:ring-indigo-500 transition-all" />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="liveUrl" className="text-sm font-semibold">Live URL <span className="text-red-500">*</span></Label>
              <Input id="liveUrl" placeholder="https://..." {...register("liveUrl")} className="focus-visible:ring-indigo-500 transition-all" />
              {errors.liveUrl && <p className="text-red-500 text-sm mt-1">{errors.liveUrl.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="githubUrl" className="text-sm font-semibold">GitHub URL <span className="text-neutral-400 font-normal">(optional)</span></Label>
              <Input id="githubUrl" placeholder="https://github.com/..." {...register("githubUrl")} className="focus-visible:ring-indigo-500 transition-all" />
              {errors.githubUrl && <p className="text-red-500 text-sm mt-1">{errors.githubUrl.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-sm font-semibold">Image URL / Path <span className="text-red-500">*</span></Label>
            <Input id="imageUrl" placeholder="https://i.postimg.cc/..." {...register("imageUrl")} className="focus-visible:ring-indigo-500 transition-all" />
            <p className="text-xs text-neutral-500">Paste an image link or a local path like /projects/image.png</p>
            {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">Description <span className="text-red-500">*</span></Label>
            <Textarea 
              id="description" 
              placeholder="Describe your project, what it does, and why you built it..." 
              className="min-h-32 focus-visible:ring-indigo-500 transition-all resize-y"
              {...register("description")} 
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          <div className="space-y-3 bg-neutral-50 dark:bg-neutral-900/30 p-4 rounded-lg border border-neutral-100 dark:border-neutral-800/50">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Key Features</Label>
            </div>
            
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start group">
                  <div className="flex-1 space-y-1">
                    <Input
                      placeholder={`Feature ${index + 1}...`}
                      {...register(`keyFeatures.${index}.value` as const)}
                      className="focus-visible:ring-indigo-500 transition-all"
                    />
                    {errors?.keyFeatures?.[index]?.value && (
                      <p className="text-red-500 text-xs">{errors.keyFeatures[index]?.value?.message}</p>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors opacity-100 md:opacity-0 md:group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ value: "" })}
              className="mt-2 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950"
            >
              <Plus className="mr-2 h-4 w-4" /> Add feature
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="techTags" className="text-sm font-semibold">Tech Tags <span className="text-red-500">*</span></Label>
            <Input id="techTags" placeholder="e.g. React, Node.js, Tailwind (comma separated)" {...register("techTags")} className="focus-visible:ring-indigo-500 transition-all" />
            {errors.techTags && <p className="text-red-500 text-sm mt-1">{errors.techTags.message}</p>}
          </div>
          
          <Button type="submit" disabled={isSubmitting} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md hover:shadow-lg">
            {isSubmitting ? "Saving Project..." : "Save Project"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
