import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
// import { useState, useEffect } from "react"; // Uncomment when enabling search
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
  year_of_manufacture: z.string().regex(/^\d{4}$/, "Must be a valid year (YYYY)"),//.optional(),
  meter_type_code: z.string().optional()
});

export function CreateMeterForm() {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Backend search implementation (commented out - enable when backend is ready)
  // const [searchResults, setSearchResults] = useState<any[]>([]);
  // const [isSearching, setIsSearching] = useState(false);
  // const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  // const [duplicateExists, setDuplicateExists] = useState(false);

  const form = useForm<z.infer<typeof createMeterSchema>>({
    resolver: zodResolver(createMeterSchema),
    defaultValues: {
      brand: "",
      model: "",
      type: "",
      features: "",
      // year_of_manufacture: "",
      // meter_type_code: ""
    },
  });

  // Debounced search function to find similar meters in backend
  // const searchSimilarMeters = async (brand: string, model: string, type: string, features: string) => {
  //   if (!brand && !model && !type && !features) {
  //     setSearchResults([]);
  //     setDuplicateExists(false);
  //     return;
  //   }
  //
  //   setIsSearching(true);
  //   try {
  //     const params = new URLSearchParams();
  //     if (brand) params.append('brand', brand);
  //     if (model) params.append('model', model);
  //     if (type) params.append('type', type);
  //     if (features) params.append('features', features);
  //
  //     const response = await fetch(`https://localhost:3000/meters/search?${params.toString()}`, {
  //       method: 'GET',
  //       credentials: "include",
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });
  //
  //     if (response.ok) {
  //       const data = await response.json();
  //       setSearchResults(data);
  //       
  //       // Check for exact duplicates (brand + model match)
  //       const exactMatch = data.find((meter: any) => 
  //         meter.brand.toLowerCase() === brand.toLowerCase() && 
  //         meter.model.toLowerCase() === model.toLowerCase()
  //       );
  //       
  //       if (exactMatch) {
  //         setDuplicateExists(true);
  //         toast({
  //           title: "Duplicate meter detected",
  //           description: `${exactMatch.brand} ${exactMatch.model} already exists in the directory.`,
  //           variant: "destructive",
  //         });
  //       } else {
  //         setDuplicateExists(false);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Search error:', error);
  //     setDuplicateExists(false);
  //   } finally {
  //     setIsSearching(false);
  //   }
  // };

  // Watch form fields and trigger search with debounce
  // useEffect(() => {
  //   const subscription = form.watch((value, { name }) => {
  //     if (name === 'brand' || name === 'model' || name === 'type' || name === 'features') {
  //       // Clear existing timeout
  //       if (searchTimeout) {
  //         clearTimeout(searchTimeout);
  //       }
  //       
  //       // Set new timeout for debounced search (500ms delay)
  //       const timeout = setTimeout(() => {
  //         searchSimilarMeters(
  //           value.brand || '', 
  //           value.model || '', 
  //           value.type || '', 
  //           value.features || ''
  //         );
  //       }, 500);
  //       
  //       setSearchTimeout(timeout);
  //     }
  //   });
  //   
  //   return () => subscription.unsubscribe();
  // }, [form.watch, searchTimeout]);

  const onSubmit = async (values: z.infer<typeof createMeterSchema>) => {
    // API Implementation (commented out - replace localStorage when backend is ready)
    
    // Prevent submission if duplicate exists
    // if (duplicateExists) {
    //   toast({
    //     title: "Cannot add meter",
    //     description: "This meter already exists in the directory.",
    //     variant: "destructive",
    //   });
    //   return;
    // }
    
    try {
      const response = await fetch('https://localhost:3000/meters', {
        method: 'POST',
        // credentials: "include", // 👈 sends the session cookie
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          brand: values.brand,
          model: values.model,
          connection_type: values.type,
          features: values.features.split(",").map(f => f.trim()),
          year_of_manufacture: values.year_of_manufacture, //? parseInt(values.year_of_manufacture) : null,//i now get this boolean expression, its because we want this to be optional
          meter_type_code: values.meter_type_code || null
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Error data:', errorData);
        throw new Error(errorData.error || 'Failed to create meter');
      }

      const newMeter = await response.json();
      // Expected response format:
      // {
      //   id: number,
      //   brand: string,
      //   model: string,
      //   type: string,
      //   features: string[],
      //   commonIssues: number,
      //   guides: number,
      //   createdAt: string
      // }

      toast({
        title: "Meter added successfully",
        description: `${newMeter.brand} ${newMeter.model} has been added to the directory.`,
      });

      form.reset();
      navigate("/directory");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create meter",
        variant: "destructive",
      });
    }
    

    // Current localStorage implementation
    // const existingMeters = JSON.parse(localStorage.getItem("customMeters") || "[]");
    
    // const newMeter = {
    //   id: Date.now(),
    //   brand: values.brand,
    //   model: values.model,
    //   type: values.type,
    //   features: values.features.split(",").map(f => f.trim()),
    //   commonIssues: 0,
    //   guides: 0,
    // };

    // const updatedMeters = [...existingMeters, newMeter];
    // localStorage.setItem("customMeters", JSON.stringify(updatedMeters));

    // toast({
    //   title: "Meter added successfully",
    //   description: `${values.brand} ${values.model} has been added to the directory.`,
    // });

    // form.reset();// duplicated above
    // navigate("/directory");//duplicated above
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
              <FormLabel>Connection Type</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 3 Phase CT-PT Meter" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="meter_type_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meter Type Code</FormLabel>
              <FormControl>
                <Input placeholder="e.g., ZMD402CT44.0457 S4" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="year_of_manufacture"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year of Manufacture (optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 2024" {...field} />
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
          <Button 
            type="submit" 
            className="flex-1"
            // disabled={duplicateExists} // Uncomment to disable when duplicate exists
          >
            Add Meter
          </Button>
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
