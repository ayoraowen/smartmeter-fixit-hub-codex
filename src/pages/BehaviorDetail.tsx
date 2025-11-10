import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBehaviorById } from "@/data/behaviorData";
import { ArrowLeft, AlertTriangle, CheckCircle, Calendar, User } from "lucide-react";

export default function BehaviorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // For API implementation:
  const [behavior, setBehavior] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchBehavior = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://localhost:3000/behaviors/${id}`);
        if (!response.ok) throw new Error('Failed to fetch behavior');
        const data = await response.json();
        setBehavior(data);
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

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{behavior.title}</h1>
                <p className="text-muted-foreground">
                  {behavior.meter.brand} - {behavior.meter.model}
                </p>
              </div>
              <Badge variant={getSeverityColor(behavior.severity)}>
                {/* {behavior.severity.toUpperCase()} */}
              </Badge>
            </div>

            <div className="flex gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(behavior.created_at).toLocaleDateString()}</span>
              </div>
              {behavior.reported_by && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{behavior.reported_by}</span>
                </div>
              )}
            </div>

            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground mb-6">{behavior.description}</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <h2 className="text-xl font-semibold">Symptoms</h2>
            </div>
            <ul className="space-y-2">
              {behavior.symptoms.map((symptom, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>{symptom}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">Solutions</h2>
            </div>
            <ol className="space-y-3">
              {behavior.solutions.map((solution, index) => (
                <li key={index} className="flex gap-3">
                  <span className="font-semibold text-primary">{index + 1}.</span>
                  <span>{solution}</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
