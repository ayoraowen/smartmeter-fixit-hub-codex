import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save, Clock, Users } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";

const createGuideSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(500, "Description must be less than 500 characters"),
  category: z.enum(["Communication", "Configuration", "Power", "Maintenance", "Network"], {
    required_error: "Please select a category"
  }),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"], {
    required_error: "Please select a difficulty level"
  }),
  estimatedDuration: z.string().min(1, "Please specify estimated duration"),
  steps: z.array(z.object({
    title: z.string().min(3, "Step title must be at least 3 characters"),
    description: z.string().min(10, "Step description must be at least 10 characters"),
    tips: z.string().optional()
  })).min(1, "At least one step is required"),
  tags: z.string().optional()
});

type CreateGuideFormData = z.infer<typeof createGuideSchema>;

interface CreateGuideFormProps {
  onSubmit: (data: CreateGuideFormData) => Promise<void>;
  isLoading?: boolean;
}

export type { CreateGuideFormData };

export function CreateGuideForm({ onSubmit, isLoading = false }: CreateGuideFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<CreateGuideFormData>({
    resolver: zodResolver(createGuideSchema),
    defaultValues: {
      title: "",
      description: "",
      category: undefined,
      difficulty: undefined,
      estimatedDuration: "",
      steps: [{ title: "", description: "", tips: "" }],
      tags: ""
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "steps"
  });

  const categories = [
    { value: "Communication", label: "Communication Issues" },
    { value: "Configuration", label: "Configuration & Setup" },
    { value: "Power", label: "Power & Quality" },
    { value: "Maintenance", label: "Maintenance & Updates" },
    { value: "Network", label: "Network & Connectivity" }
  ];

  const difficultyLevels = [
    { value: "Beginner", label: "Beginner", description: "Basic procedures, minimal technical knowledge required" },
    { value: "Intermediate", label: "Intermediate", description: "Some technical experience recommended" },
    { value: "Advanced", label: "Advanced", description: "Expert level, extensive technical knowledge required" }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "default";
      case "Intermediate": return "secondary";
      case "Advanced": return "destructive";
      default: return "outline";
    }
  };

  const handleSubmit = async (data: CreateGuideFormData) => {
    setError(null);
    setSuccess(null);
    
    try {
      await onSubmit(data);
      setSuccess("Guide created successfully!");
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create guide. Please try again.");
    }
  };

  const addStep = () => {
    append({ title: "", description: "", tips: "" });
  };

  const removeStep = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          Create New Troubleshooting Guide
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Guide Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Resolving Communication Failures..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Duration</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="e.g., 15 min" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide a detailed description of what this guide covers..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    A clear description helps users understand when to use this guide
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category and Difficulty */}
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Difficulty Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {difficultyLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            <div className="flex items-center gap-2">
                              <Badge variant={getDifficultyColor(level.value) as any} className="text-xs">
                                {level.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{level.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., meter, reset, troubleshooting (comma-separated)" {...field} />
                  </FormControl>
                  <FormDescription>
                    Add relevant tags to help users find this guide
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Steps */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-medium">Guide Steps</Label>
                <Button type="button" onClick={addStep} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Step
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="font-medium">Step {index + 1}</Label>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeStep(index)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <FormField
                        control={form.control}
                        name={`steps.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Step Title</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Check network connectivity" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`steps.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Step Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Detailed instructions for this step..."
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`steps.${index}.tips`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tips & Notes (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Additional tips, warnings, or helpful notes..."
                                className="min-h-[60px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6">
              <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                {isLoading ? (
                  <>
                    <Users className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Guide
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}