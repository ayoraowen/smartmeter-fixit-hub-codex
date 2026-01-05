import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBehaviorById } from "@/data/behaviorData";
import { ArrowLeft, AlertTriangle, CheckCircle, Calendar, User, Beaker } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Save, X, Plus, Minus } from "lucide-react";
import API_BASE_URL from "@/config/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

// Validation schema for behavior edit form
const behaviorEditSchema = z.object({
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(1000, "Description must be less than 1000 characters"),
  symptoms: z.array(z.string().trim().min(1, "Symptom cannot be empty")).min(1, "At least one symptom is required"),
  solutions: z.array(z.string().trim().min(1, "Solution cannot be empty")).min(1, "At least one solution is required"),
});

type BehaviorEditFormData = z.infer<typeof behaviorEditSchema>;

export default function BehaviorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [behavior, setBehavior] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<BehaviorEditFormData>({
    resolver: zodResolver(behaviorEditSchema),
    defaultValues: {
      description: "",
      symptoms: [],
      solutions: [],
    },
  });


  
  useEffect(() => {
    const fetchBehavior = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/behaviors/${id}`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${localStorage.getItem('authToken')}`,
              }
          }
        );
        if (!response.ok) throw new Error('Failed to fetch behavior');
        const data = await response.json();
        setBehavior(data);
        
        // Initialize form with fetched data
        const symptoms = Array.isArray(data.symptoms)
          ? data.symptoms
          : JSON.parse(data.symptoms || "[]");
        const solutions = Array.isArray(data.solutions)
          ? data.solutions
          : JSON.parse(data.solutions || "[]");
          
        form.reset({
          description: data.description || "",
          symptoms: symptoms,
          solutions: solutions,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBehavior();
  }, [id]);

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Reset form to original behavior data
    const symptoms = Array.isArray(behavior.symptoms)
      ? behavior.symptoms
      : JSON.parse(behavior.symptoms || "[]");
    const solutions = Array.isArray(behavior.solutions)
      ? behavior.solutions
      : JSON.parse(behavior.solutions || "[]");
      
    form.reset({
      description: behavior.description || "",
      symptoms: symptoms,
      solutions: solutions,
    });
    setIsEditing(false);
  };

  const addListItem = (field: "symptoms" | "solutions") => {
    const currentValues = form.getValues(field);
    form.setValue(field, [...currentValues, ""], { shouldValidate: true });
  };

  const removeListItem = (field: "symptoms" | "solutions", index: number) => {
    const currentValues = form.getValues(field);
    const newValues = currentValues.filter((_, i) => i !== index);
    form.setValue(field, newValues, { shouldValidate: true });
  };

  const handleSave = async (data: BehaviorEditFormData) => {
    try {
      setIsSaving(true);
      const response = await fetch(`${API_BASE_URL}/behaviors/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          title: behavior.title,
          meter_id: behavior.meter_id,
          description: data.description,
          symptoms: data.symptoms.filter(s => s.trim() !== ""),
          solutions: data.solutions.filter(s => s.trim() !== ""),
          reported_by: behavior.reported_by,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      const updated = await response.json();
      setBehavior(updated);
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Behavior updated successfully",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not save changes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };


if (isLoading) {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Header + progress bar */}
        <div className="max-w-md mx-auto space-y-4 mb-10 mt-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-foreground mb-2">
              Loading behaviour guide…
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Fetching detailed steps and meter info
            </p>
          </div>

          <Progress value={70} className="h-2" />
        </div>

        {/* Skeleton detail cards */}
        <div className="space-y-6">

          <Card className="p-6 space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />

            <div className="pt-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </Card>

          <Card className="p-6 space-y-4">
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </Card>

        </div>
      </div>
    </Layout>
  );
}


  if (!behavior) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Behaviour Guide Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The requested behaviour guide could not be found.
            </p>
            <Button onClick={() => navigate("/directory")}>
              Back to Directory
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  // return (
  //   <Layout>
  //     <div className="container mx-auto px-4 py-8">
  //       <Button
  //         variant="ghost"
  //         onClick={() => navigate(-1)}
  //         className="mb-6"
  //       >
  //         <ArrowLeft className="mr-2 h-4 w-4" />
  //         Back
  //       </Button>

  //       <div className="space-y-6">
  //         <Card className="p-6">
  //           <div className="flex items-start justify-between mb-4">
  //             <div>
  //               <h1 className="text-3xl font-bold mb-2">{behavior.title}</h1>
  //               <p className="text-muted-foreground">
  //                 {behavior.meter.brand} - {behavior.meter.model}
  //               </p>
  //             </div>
  //             <Badge variant={getSeverityColor(behavior.severity)}>
  //               {/* {behavior.severity.toUpperCase()} */}
  //             </Badge>
  //           </div>

  //           <div className="flex gap-4 text-sm text-muted-foreground mb-6">
  //             <div className="flex items-center gap-1">
  //               <Calendar className="h-4 w-4" />
  //               <span>{new Date(behavior.created_at).toLocaleDateString()}</span>
  //             </div>
  //             {behavior.reported_by && (
  //               <div className="flex items-center gap-1">
  //                 <User className="h-4 w-4" />
  //                 <span>{behavior.reported_by}</span>
  //               </div>
  //             )}
  //           </div>

  //           <div className="prose prose-sm max-w-none">
  //             <h3 className="text-lg font-semibold mb-2">Description</h3>
  //             <p className="text-muted-foreground mb-6">{behavior.description}</p>
  //           </div>
  //         </Card>

  //         <Card className="p-6">
  //           <div className="flex items-center gap-2 mb-4">
  //             <AlertTriangle className="h-5 w-5 text-destructive" />
  //             <h2 className="text-xl font-semibold">Symptoms</h2>
  //           </div>
  //           <ul className="space-y-2">
  //             {Array.isArray(behavior.symptoms) ? behavior.symptoms.map((symptom, index) => (
  //               <li key={index} className="flex items-start gap-2">
  //                 <span className="text-destructive mt-0">•</span>
  //                 <span>{symptom}</span>
  //               </li>
  //             )) : JSON.parse(behavior.symptoms || "[]").map((symptom: string, index: number) => (
  //               <li key={index} className="flex items-start gap-2">
  //                 <span className="text-destructive mt-0">•</span>
  //                 <span>{symptom}</span>
  //               </li>
  //             )) 
  //               }
  //           </ul>
  //         </Card>

  //         <Card className="p-6">
  //           <div className="flex items-center gap-2 mb-4">
  //             <CheckCircle className="h-5 w-5 text-green-600" />
  //             <h2 className="text-xl font-semibold">Solutions</h2>
  //           </div>
  //           <ol className="space-y-3">
  //             {Array.isArray(behavior.solutions) ? behavior.solutions.map((solution, index) => (
  //               <li key={index} className="flex gap-3">
  //                 <span className="font-semibold text-primary">{index + 1}.</span>
  //                 <span>{solution}</span>
  //               </li>
  //             )) : JSON.parse(behavior.solutions || "[]").map((solution: string, index: number) => (
  //               <li key={index} className="flex gap-3">
  //                 <span className="font-semibold text-primary">{index + 1}.</span>
  //                 <span>{solution}</span>
  //               </li>
  //             ))
  //               }
  //           </ol>
  //         </Card>
  //       </div>
  //     </div>
  //   </Layout>
  // );

  const symptoms = form.watch("symptoms");
  const solutions = form.watch("solutions");

  return (
  <Layout>
    <div className="container mx-auto px-4 py-8">

      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Edit / Save button */}
      <div className="flex justify-end mb-4">
        {!isEditing ? (
          <Button onClick={handleStartEdit}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button onClick={form.handleSubmit(handleSave)} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" /> {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">

        {/* Header Card */}
        <Card className="p-6">
          <h1 className="text-3xl font-bold mb-2">{behavior.title}</h1>
          {behavior.meter?.meter_type_code?.trim() ? 
          <p className="text-sm text-muted-foreground mb-2"> {behavior.meter?.brand} - {behavior.meter?.model} - {behavior.meter?.meter_type_code} </p> : 
          <p className="text-sm text-muted-foreground mb-2"> {behavior.meter?.brand} - {behavior.meter?.model} </p>
          }
          <div className="text-sm text-muted-foreground flex gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(behavior.created_at).toLocaleDateString()}
            </div>

            {behavior.reported_by && (
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {behavior.reported_by}
              </div>
            )}
          </div>
        </Card>

        {/* DESCRIPTION */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Description</h2>

          {!isEditing ? (
            <p className="text-muted-foreground">{behavior.description}</p>
          ) : (
            <Form {...form}>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-[120px]"
                        placeholder="Enter behavior description..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Form>
          )}
        </Card>

        {/* SYMPTOMS */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="text-xl font-semibold">Symptoms</h2>
          </div>

          {!isEditing ? (
            <ul className="space-y-2">
              {symptoms.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-destructive">•</span> {s}
                </li>
              ))}
            </ul>
          ) : (
            <Form {...form}>
              <div className="space-y-4">
                {symptoms.map((s, i) => (
                  <FormField
                    key={i}
                    control={form.control}
                    name={`symptoms.${i}`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-3">
                          <FormControl>
                            <Input {...field} placeholder="Enter symptom..." />
                          </FormControl>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeListItem("symptoms", i)}
                            disabled={symptoms.length <= 1}
                          >
                            <Minus />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                {form.formState.errors.symptoms?.message && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.symptoms.message}</p>
                )}
                <Button type="button" size="sm" onClick={() => addListItem("symptoms")}>
                  <Plus className="mr-2 h-4 w-4" /> Add Symptom
                </Button>
              </div>
            </Form>
          )}
        </Card>

        {/* SOLUTIONS */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold">Solutions</h2>
          </div>

          {!isEditing ? (
            <ol className="space-y-2">
              {solutions.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-semibold">{i + 1}.</span> {s}
                </li>
              ))}
            </ol>
          ) : (
            <Form {...form}>
              <div className="space-y-4">
                {solutions.map((s, i) => (
                  <FormField
                    key={i}
                    control={form.control}
                    name={`solutions.${i}`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex gap-3">
                          <FormControl>
                            <Input {...field} placeholder="Enter solution..." />
                          </FormControl>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => removeListItem("solutions", i)}
                            disabled={solutions.length <= 1}
                          >
                            <Minus />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                {form.formState.errors.solutions?.message && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.solutions.message}</p>
                )}
                <Button type="button" size="sm" onClick={() => addListItem("solutions")}>
                  <Plus className="mr-2 h-4 w-4" /> Add Solution
                </Button>
              </div>
            </Form>
          )}
        </Card>

      </div>
    </div>
  </Layout>
);

}
