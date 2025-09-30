import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const createMeterSchema = z.object({
  brand: z.string().min(1, "Brand is required").max(100),
  model: z.string().min(1, "Model is required").max(100),
  type: z.string().min(1, "Type is required").max(100),
  features: z.string().min(1, "At least one feature is required"),
});

export function CreateMeterForm() {
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof createMeterSchema>>({
    resolver: zodResolver(createMeterSchema),
    defaultValues: {
      brand: "",
      model: "",
      type: "",
      features: "",
    },
  });

  const onSubmit = (values: z.infer<typeof createMeterSchema>) => {
    // Get existing meters from localStorage
    const existingMeters = JSON.parse(localStorage.getItem("customMeters") || "[]");
    
    // Create new meter object
    const newMeter = {
      id: Date.now(),
      brand: values.brand,
      model: values.model,
      type: values.type,
      features: values.features.split(",").map(f => f.trim()),
      commonIssues: 0,
      guides: 0,
    };

    // Add to existing meters
    const updatedMeters = [...existingMeters, newMeter];
    localStorage.setItem("customMeters", JSON.stringify(updatedMeters));

    toast({
      title: "Meter added successfully",
      description: `${values.brand} ${values.model} has been added to the directory.`,
    });

    form.reset();
    navigate("/directory");
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Schneider Electric" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <FormControl>
                <Input placeholder="e.g., ION 7550" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Smart Grid Meter" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="features"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Features (comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 3-Phase, CT/PT, Ethernet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">Add Meter</Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/directory")}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
