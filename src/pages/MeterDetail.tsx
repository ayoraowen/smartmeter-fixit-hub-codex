import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { getAllMeters } from "@/data/meterData";
// import { useState, useEffect } from "react";

export default function MeterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Commented-out API call to fetch meter details from backend
  // const [meter, setMeter] = useState<any>(null);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchMeter = async () => {
  //     try {
  //       setIsLoading(true);
  //       const response = await fetch(`https://localhost:3000/meters/${id}`);
  //       if (!response.ok) {
  //         throw new Error('Failed to fetch meter details');
  //       }
  //       const data = await response.json();
  //       setMeter(data);
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : 'An error occurred');
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchMeter();
  // }, [id]);

  // Using local data for now
  const allMeters = getAllMeters();
  const meter = allMeters.find(m => m.id === Number(id));

  if (!meter) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/directory")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Directory
          </Button>
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Meter not found</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/directory")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Directory
        </Button>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">
                    {meter.brand} {meter.model}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {meter.type}
                  </CardDescription>
                  {/* <p className="text-sm text-muted-foreground mt-1">Year: {meter.year_of_manufacture}</p> */}
                </div>
                <Badge variant="secondary" className="text-sm">
                  {meter.brand}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {meter.features.map((feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary">
                          {meter.commonIssues}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Common Issues
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-primary">
                          {meter.guides}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Available Guides
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-4">
                  <Button
                    className="flex-1"
                    onClick={() => navigate(`/meter-behaviors/${meter.id}`)}
                  >
                    View Common Issues
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/guides")}
                  >
                    Browse Guides
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
