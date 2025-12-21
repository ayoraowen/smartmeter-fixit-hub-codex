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



export default function BehaviorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // For API implementation:
  const [behavior, setBehavior] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
//   const [editData, setEditData] = useState({
//   description: "",
//   symptoms: [] as string[],
//   solutions: [] as string[],
// });
const [editData, setEditData] = useState<any>(null);


  
  useEffect(() => {
    const fetchBehavior = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://localhost:3000/behaviors/${id}`,
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
        setEditData({
          //title: data.title || "",

  description: data.description || "",
  symptoms: Array.isArray(data.symptoms)
    ? data.symptoms
    : JSON.parse(data.symptoms || "[]"),
  solutions: Array.isArray(data.solutions)
    ? data.solutions
    : JSON.parse(data.solutions || "[]"),
});

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    fetchBehavior();
  }, [id]);
  
  // For now, using local data:
  // const behavior = getBehaviorById(id || "");

  const updateListItem = (field: "symptoms" | "solutions", index: number, value: string) => {
  setEditData(prev => {
    const arr = [...prev[field]];
    arr[index] = value;
    return { ...prev, [field]: arr };
  });
};

const addListItem = (field: "symptoms" | "solutions") => {
  setEditData(prev => ({
    ...prev,
    [field]: [...prev[field], ""],
  }));
};

const removeListItem = (field: "symptoms" | "solutions", index: number) => {
  setEditData(prev => {
    const arr = prev[field].filter((_, i) => i !== index);
    return { ...prev, [field]: arr };
  });
};

const handleSave = async () => {
  try {
    const response = await fetch(`https://localhost:3000/behaviors/${id}`, {
      method: "PUT",//or PUT based on your API
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        title: behavior.title,
        meter_id: behavior.meter_id,
        description: editData.description,
        symptoms: editData.symptoms,
        solutions: editData.solutions,
        reported_by: behavior.reported_by,
        // created_at: behavior.created_at,//not permitted to change in backend permitted params
      }
        
        ),
    });

    if (!response.ok) throw new Error("Failed to save");

    const updated = await response.json();

    setBehavior(updated);
    setIsEditing(false);
    console.log("Changes saved", updated);
  } catch (error) {
    console.error(error);
    alert("Could not save changes");
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
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
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
            <Textarea
              value={editData.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
              className="min-h-[120px]"
            />
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
              {editData.symptoms.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-destructive">•</span> {s}
                </li>
              ))}
            </ul>
          ) : (
            <div className="space-y-4">
              {editData.symptoms.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <Input
                    value={s}
                    onChange={(e) => updateListItem("symptoms", i, e.target.value)}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeListItem("symptoms", i)}
                  >
                    <Minus />
                  </Button>
                </div>
              ))}
              <Button size="sm" onClick={() => addListItem("symptoms")}>
                <Plus className="mr-2 h-4 w-4" /> Add Symptom
              </Button>
            </div>
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
              {editData.solutions.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className="font-semibold">{i + 1}.</span> {s}
                </li>
              ))}
            </ol>
          ) : (
            <div className="space-y-4">
              {editData.solutions.map((s, i) => (
                <div key={i} className="flex gap-3">
                  <Input
                    value={s}
                    onChange={(e) => updateListItem("solutions", i, e.target.value)}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeListItem("solutions", i)}
                  >
                    <Minus />
                  </Button>
                </div>
              ))}
              <Button size="sm" onClick={() => addListItem("solutions")}>
                <Plus className="mr-2 h-4 w-4" /> Add Solution
              </Button>
            </div>
          )}
        </Card>

      </div>
    </div>
  </Layout>
);

}
