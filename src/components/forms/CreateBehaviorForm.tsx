import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveBehavior } from "@/data/behaviorData";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import API_BASE_URL from "@/config/api";

//interface needed for fetched meters so that we can populate the meter dropdown and have proper typing
interface ApiFetchedMeter {
  id: number;
  brand: string;
  model: string;
  connection_type: string;
  features: string;
  created_at: string;
  updated_at: string;
  user_id: number;
  meter_type_code: string;
  year_of_manufacture: string; 
}

const behaviorSchema = z.object({
  meterId: z.string().min(1, "Please select a meter"),
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  severity: z.enum(["low", "medium", "high", "critical"]),
  reportedBy: z.string().max(100).optional(),
});

type BehaviorFormData = z.infer<typeof behaviorSchema>;

export function CreateBehaviorForm() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState("");
  const [solutions, setSolutions] = useState<string[]>([]);
  const [solutionInput, setSolutionInput] = useState("");
  const [meters, setMeters] = useState<ApiFetchedMeter[]>([]);
  const [isLoadingMeters, setIsLoadingMeters] = useState(true);

  useEffect(() => {
    const fetchMeters = async () => {
      try {
        setIsLoadingMeters(true);
        const response = await fetch(`${API_BASE_URL}/meters`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`  
          }
        }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch meters');
        }
        
        const data: ApiFetchedMeter[] = await response.json();
        setMeters(data);
      } catch (error) {
        console.error('Error fetching meters:', error);
        toast({
          title: "Error",
          description: "Failed to load meters. Please try again later.",
          variant: "destructive",
        });
        setMeters([]);
      } finally {
        setIsLoadingMeters(false);
      }
    };

    fetchMeters();
  }, [toast]);

  const form = useForm<BehaviorFormData>({
    resolver: zodResolver(behaviorSchema),
    defaultValues: {
      meterId: "",
      title: "",
      description: "",
      severity: "medium",
      reportedBy: "",
    },
  });

  const addSymptom = () => {
    const nextSymptoms = symptomInput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (nextSymptoms.length === 0 || symptoms.length >= 10) {
      return;
    }

    setSymptoms([...symptoms, ...nextSymptoms].slice(0, 10));
    setSymptomInput("");
  };

  const removeSymptom = (index: number) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const addSolution = () => {
    const nextSolutions = solutionInput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (nextSolutions.length === 0 || solutions.length >= 10) {
      return;
    }

    setSolutions([...solutions, ...nextSolutions].slice(0, 10));
    setSolutionInput("");
  };

  const removeSolution = (index: number) => {
    setSolutions(solutions.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: BehaviorFormData) => {
    
      if (symptoms.length === 0) {
        toast({
          title: "Missing symptoms",
          description: "Please add at least one symptom",
          variant: "destructive",
        });
        return;
      }

      if (solutions.length === 0) {
        toast({
          title: "Missing solutions",
          description: "Please add at least one solution",
          variant: "destructive",
        });
        return;
      }

      const selectedMeter = meters.find(m => m.id.toString() === data.meterId);
      
      // Uncomment below to POST to API endpoint instead of local storage
      
      try {
        const response = await fetch(`${API_BASE_URL}/behaviors`, {
          method: 'POST',
          // credentials: "include", // 👈 sends the session cookie
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: JSON.stringify({
            meter_id: parseInt(data.meterId),
            // meterBrand: selectedMeter?.brand || "",
            // meterModel: selectedMeter?.model || "",
            title: data.title,
            description: data.description,
            // severity: data.severity,
            symptoms: symptoms,
            
            solutions: solutions,
            reported_by: data.reportedBy,
          }),
        });
console.log(data.meterId)
        if (!response.ok) {
          throw new Error('Failed to submit behavior');
        }

        const newBehavior = await response.json();

        toast({
          title: "Success",
          description: "Meter behavior reported successfully",
        });

        // Navigate back to behaviors page with refresh flag to trigger refetch
        navigate(`/behaviors`, { state: { refreshBehaviors: Date.now() } });
        // Or navigate to detail page: navigate(`/behaviors/${newBehavior.id}`);
      } catch (error) {
        console.error('Error submitting behavior:', error);
        toast({
          title: "Error",
          description: "Failed to submit behavior. Please try again.",
          variant: "destructive",
        });
      }
      

      // Current local storage implementation
    //   const newBehavior = saveBehavior({
    //     meterId: parseInt(data.meterId),
    //     meterBrand: selectedMeter?.brand || "",
    //     meterModel: selectedMeter?.model || "",
    //     title: data.title,
    //     description: data.description,
    //     severity: data.severity,
    //     symptoms,
    //     solutions,
    //     reportedBy: data.reportedBy,
    //   });

    //   toast({
    //     title: "Success",
    //     description: "Meter behavior reported successfully",
    //   });

    //   navigate(`/behaviors/${newBehavior.id}`);
    // } catch (error) {
    //   toast({
    //     title: "Error",
    //     description: "Failed to report behavior",
    //     variant: "destructive",
    //   });
    }//end of Current localStorage implementation
  ;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="meterId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meter</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingMeters}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingMeters ? "Loading meters..." : "Select a meter"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingMeters ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2 text-sm text-muted-foreground">Loading meters...</span>
                    </div>
                  ) : meters.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center">
                      No meters available
                    </div>
                  ) : (
                    meters.map((meter) => (
                      meter.meter_type_code?.trim() ? 
                      <SelectItem key={meter.id} value={meter.id.toString()}>
                        {meter.brand} | {meter.model} | {meter.meter_type_code} | {meter.year_of_manufacture}
                      </SelectItem> :
                      <SelectItem key={meter.id} value={meter.id.toString()}>
                        {meter.brand} | {meter.model} | {meter.year_of_manufacture}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Behavior Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Communication Timeout" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the behavior in detail..." 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="severity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Severity</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Symptoms</FormLabel>
          <div className="flex gap-2">
            <Textarea
              placeholder="Add symptom(s), one per line"
              value={symptomInput}
              onChange={(e) => setSymptomInput(e.target.value)}
              className="min-h-[80px]"
            />
            <Button type="button" onClick={addSymptom} variant="secondary">
              Add
            </Button>
          </div>
          <div className="space-y-2 mt-2">
            {symptoms.map((symptom, index) => (
              <div key={index} className="flex items-center gap-2 bg-secondary/50 p-2 rounded">
                <span className="flex-1 text-sm whitespace-pre-line">{symptom}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSymptom(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <FormLabel>Solutions</FormLabel>
          <div className="flex gap-2">
            <Textarea
              placeholder="Add solution(s), one per line"
              value={solutionInput}
              onChange={(e) => setSolutionInput(e.target.value)}
              className="min-h-[80px]"
            />
            <Button type="button" onClick={addSolution} variant="secondary">
              Add
            </Button>
          </div>
          <div className="space-y-2 mt-2">
            {solutions.map((solution, index) => (
              <div key={index} className="flex items-center gap-2 bg-secondary/50 p-2 rounded">
                <span className="flex-1 text-sm whitespace-pre-line">{solution}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSolution(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <FormField
          control={form.control}
          name="reportedBy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reported By (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Your name or role" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" className="flex-1">
            Report Behavior
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
