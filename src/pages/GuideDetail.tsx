import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Star, User, Calendar, Tag, CheckCircle2, AlertCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Layout } from "@/components/layout/Layout";
import { getGuideById } from "@/data/guideData";
import { getAllMeters } from "@/data/meterData";

export default function GuideDetail() {
  const { id } = useParams<{ id: string }>();
  
  // For API implementation:
  // const [guide, setGuide] = useState<any>(null);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  
  // useEffect(() => {
  //   const fetchGuide = async () => {
  //     try {
  //       setIsLoading(true);
  //       const response = await fetch(`https://localhost:3000/guides/${id}`);
  //       if (!response.ok) throw new Error('Failed to fetch guide');
  //       const data = await response.json();
  //       setGuide(data);
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : 'An error occurred');
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   fetchGuide();
  // }, [id]);
  
  // For now, using local data:
  const guide = getGuideById(Number(id));
  const meters = getAllMeters();
  const meter = meters.find(m => m.id.toString() === guide?.meterId);

  if (!guide) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Guide Not Found</h2>
            <p className="text-muted-foreground mb-6">The guide you're looking for doesn't exist.</p>
            <Link to="/guides">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Guides
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "success";
      case "Intermediate":
        return "warning";
      case "Advanced":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Link to="/guides">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Guides
          </Button>
        </Link>

        {/* Guide Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">{guide.title}</h1>
          <p className="text-lg text-muted-foreground mb-6">{guide.description}</p>

          {/* Metadata */}
          <div className="flex flex-wrap gap-3 mb-6">
            <Badge variant="outline">{guide.category}</Badge>
            <Badge variant={getDifficultyColor(guide.difficulty) as any}>
              {guide.difficulty}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {guide.duration}
            </div>
            {guide.rating > 0 && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Star className="h-4 w-4 mr-1 fill-warning text-warning" />
                {guide.rating} ({guide.votes} votes)
              </div>
            )}
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-1" />
              {guide.author}
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              Updated {guide.lastUpdated}
            </div>
          </div>

          {/* Meter Information */}
          {meter && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Applies to:</p>
                    <p className="font-medium text-foreground">
                      {meter.brand} {meter.model}
                    </p>
                    <Badge variant="outline" className="mt-2">{meter.type}</Badge>
                  </div>
                  <Link to="/directory">
                    <Button variant="outline" size="sm">
                      View Meter Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {guide.tags && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {guide.tags.split(",").map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator className="my-8" />

        {/* Steps */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Step-by-Step Guide ({guide.steps.length} steps)
          </h2>

          {guide.steps.map((step, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {index + 1}
                  </div>
                  <span>{step.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>

                  {step.tips && (
                    <div className="flex items-start gap-3 p-4 bg-accent/50 rounded-lg border border-accent">
                      <Lightbulb className="h-5 w-5 text-warning mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-foreground mb-1">Tips & Notes</p>
                        <p className="text-sm text-muted-foreground">{step.tips}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link to="/guides">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Guides
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
