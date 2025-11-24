import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Save, X } from "lucide-react";
import { getAllMeters } from "@/data/meterData";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function MeterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  // API call to fetch meter details from backend
  const [meter, setMeter] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedMeter, setEditedMeter] = useState<any>(null);

  useEffect(() => {
    const fetchMeter = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://localhost:3000/meters/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch meter details');
        }
        const data = await response.json();
        setMeter(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeter();
  }, [id]);

  // Using local data for now
  // const allMeters = getAllMeters();
  // const meter = allMeters.find(m => m.id === Number(id));

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (!isEditMode) {
      setEditedMeter({ ...meter });
    }
    setIsEditMode(!isEditMode);
  };

  //Handle input changes in edit mode
  const handleInputChange = (field: string, value: string | string[]) => {
    setEditedMeter((prev: any) => ({ ...prev, [field]: value }));
  };

  //Handle save with API call
  const handleSave = async () => {
    try {
      const response = await fetch(`https://localhost:3000/meters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brand: editedMeter.brand,
          model: editedMeter.model,
          connection_type: editedMeter.connection_type,
          year_of_manufacture: parseInt(editedMeter.year_of_manufacture),
          features: JSON.stringify(editedMeter.features),
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update meter');
      }
  
      const updatedMeter = await response.json();
      setMeter(updatedMeter);
      setIsEditMode(false);
      toast({
        title: "Success",
        description: "Meter updated successfully",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update meter",
        variant: "destructive",
      });
    }
  };

  //Handle cancel edit
  const handleCancel = () => {
    setEditedMeter(null);
    setIsEditMode(false);
  };

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
                <div className="flex-1">
                  {isEditMode ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="model">Model</Label>
                        <Input
                          id="model"
                          value={editedMeter.model}
                          onChange={(e) => handleInputChange('model', e.target.value)}
                          placeholder="Model"
                          className="text-2xl font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand</Label>
                        <Input
                          id="brand"
                          value={editedMeter.brand}
                          onChange={(e) => handleInputChange('brand', e.target.value)}
                          placeholder="Brand"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Year of Manufacture</Label>
                        <Input
                          id="year"
                          value={editedMeter.year_of_manufacture}
                          onChange={(e) => handleInputChange('year_of_manufacture', e.target.value)}
                          placeholder="Year"
                          type="number"
                        />
                      </div>
                      {/* <div className="space-y-2">
                        <Label htmlFor="connection_type">Connection Type</Label>
                        <Input
                          id="connection_type"
                          value={editedMeter.connection_type}
                          onChange={(e) => handleInputChange('connection_type', e.target.value)}
                          placeholder="Connection Type"
                        />
                      </div> */}
                      {/* <div className="space-y-2">
                        <Label htmlFor="features">Features (comma-separated)</Label>
                        <Input
                          id="features"
                          value={Array.isArray(editedMeter.features) 
                            ? editedMeter.features.join(', ') 
                            : editedMeter.features}
                          onChange={(e) => {
                            const featuresArray = e.target.value.split(',').map(f => f.trim());
                            handleInputChange('features', featuresArray);
                          }}
                          placeholder="Feature 1, Feature 2, Feature 3"
                        />
                      </div> */}
                    </div>
                  ) : (
                    <div>
                      <CardTitle className="text-3xl mb-2">
                        {meter.model}
                      </CardTitle>
                      {/* <CardDescription className="text-lg">
                        {meter.connection_type}
                      </CardDescription> */}
                      <p className="text-lg text-primary font-medium">{meter.brand}</p>
                      <p className="text-sm text-muted-foreground mt-1">Year: {meter.year_of_manufacture}</p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isEditMode ? (
                    <>
                      <Button size="sm" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" onClick={handleEditToggle}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  <Badge variant="secondary" className="text-sm">
                    {meter.connection_type}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {/* {meter.features.map((feature, index) => (
                      <Badge key={index} variant="outline">
                        {feature}
                      </Badge>
                    ))} */}
                    {(Array.isArray(meter.features)
                                            ? meter.features
                                            : JSON.parse(meter.features || "[]")
                                          ).map((feature, index) => (
                                            <Badge
                                              key={index}
                                              variant="outline"
                                              className="text-xs"
                                            >
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
