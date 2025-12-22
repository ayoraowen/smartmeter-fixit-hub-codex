// import { useParams, useNavigate } from "react-router-dom";
// import { Layout } from "@/components/layout/Layout";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { ArrowLeft, Edit, Save, X } from "lucide-react";
// import { getAllMeters } from "@/data/meterData";
// import { useState, useEffect } from "react";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useToast } from "@/hooks/use-toast";
// import { useCommaSeparatedInput } from "@/hooks/use-comma-separated-input";
// import { Progress } from "@/components/ui/progress";
// import { Skeleton } from "@/components/ui/skeleton";
//ALL THE ABOVE IMPORTS WERE FOR VERSION 1.0 OF METER DETAIL PAGE
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Save, X, Wrench, AlertTriangle, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useCommaSeparatedInput } from "@/hooks/use-comma-separated-input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";


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

  //the following works with the custom hook for comma separated input
  const featuresInput = useCommaSeparatedInput("")
  // End of custom hook usage

  useEffect(() => {
    const fetchMeter = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://localhost:3000/meters/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
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
  // const handleEditToggle = () => {
  //   if (!isEditMode) {
  //     setEditedMeter({ ...meter });
  //   }
  //   setIsEditMode(!isEditMode);
  // };

  const handleEditToggle = () => {
    if (!isEditMode) {
      setEditedMeter({ ...meter });
      const initialFeatures = (Array.isArray(meter.features) 
      ? meter.features
      : JSON.parse(meter.features || "[]"));//.join(', ');
      featuresInput.setValue(initialFeatures.join(', '));
    }
    setIsEditMode(!isEditMode);
  }



  //Handle input changes in edit mode
  const handleInputChange = (field: string, value: string | string[]) => {//line 195 below was flagging error on featuresArray "Argument of type 'string[]' is not assignable to parameter of type 'string'" hence the previous commit after correction.
    setEditedMeter((prev: any) => ({ ...prev, [field]: value }));
  };

  //Handle save with API call
  const handleSave = async () => {
    try {
      const featuresArray = featuresInput.toArray();
      const response = await fetch(`https://localhost:3000/meters/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          brand: editedMeter.brand,
          model: editedMeter.model,
          connection_type: editedMeter.connection_type,
          year_of_manufacture: parseInt(editedMeter.year_of_manufacture),
          features: featuresArray,//editedMeter.features
          meter_type_code: editedMeter.meter_type_code || null, // Handle empty string or null
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

  if (isLoading) {
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

        <div className="max-w-md mx-auto space-y-4 mb-8">
          <div className="text-center">
            <h3 className="text-lg font-medium text-foreground mb-2">
              Loading meter details...
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Fetching meter information
            </p>
          </div>
          <Progress value={66} className="h-2" />
        </div>

        {/* Simple skeleton for details area */}
        <Card className="p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full mt-6" />
        </Card>

      </div>
    </Layout>
  );
}


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

//VERSION 1.0 SECTION
//   return (
//     <Layout>
//       <div className="container mx-auto px-4 py-8">
//         <Button
//           variant="ghost"
//           onClick={() => navigate("/directory")}
//           className="mb-6"
//         >
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           Back to Directory
//         </Button>

//         <div className="grid gap-6">
//           <Card>
//             <CardHeader>
//               <div className="flex items-start justify-between">
//                 <div className="flex-1">
//                   {isEditMode ? (
//                     <div className="space-y-4">
//                       <div className="space-y-2">
//                         <Label htmlFor="model">Model</Label>
//                         <Input
//                           id="model"
//                           value={editedMeter.model}
//                           onChange={(e) => handleInputChange('model', e.target.value)}
//                           placeholder="Model"
//                           className="text-2xl font-bold"
//                         />
//                       </div>
//                       {meter.meter_type_code?.trim() && (
//                       <div className="space-y-2">
//                         <Label htmlFor="model">Meter Type Code</Label>
//                         <Input
//                           id="meter_type_code"
//                           value={editedMeter.meter_type_code}
//                           onChange={(e) => handleInputChange('meter_type_code', e.target.value)}
//                           placeholder="Meter Type Code"
//                           className="text-2xl font-bold"
//                         />  
//                       </div>)}{/*only show if meter_type_code is not empty string or null*/}
//                       <div className="space-y-2">
//                         <Label htmlFor="brand">Brand</Label>
//                         <Input
//                           id="brand"
//                           value={editedMeter.brand}
//                           onChange={(e) => handleInputChange('brand', e.target.value)}
//                           placeholder="Brand"
//                         />
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="year">Year of Manufacture</Label>
//                         <Input
//                           id="year"
//                           value={editedMeter.year_of_manufacture}
//                           onChange={(e) => handleInputChange('year_of_manufacture', e.target.value)}
//                           placeholder="Year"
//                           type="number"
//                         />
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="connection_type">Connection Type</Label>
//                         <Input
//                           id="connection_type"
//                           value={editedMeter.connection_type}
//                           onChange={(e) => handleInputChange('connection_type', e.target.value)}
//                           placeholder="Connection Type"
//                         />
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="features">Features (comma-separated)</Label>
//                         {/* <Input
//                           id="features"
//                           value={(Array.isArray(editedMeter.features) 
//                             ? editedMeter.features
//                             : JSON.parse(editedMeter.features || "[]")).map((feature, index) => (`${feature}`)).join(', ')}
//                           onChange={(e) => {
//                             const featuresArray = e.target.value.split(',').map(f => f.trim());
//                             handleInputChange('features', featuresArray);
//                           }}
//                           placeholder="Feature 1, Feature 2, Feature 3"
//                         /> */}
//                         <Input
//                           id="features"
//                           value={featuresInput.value}
//                           onChange={featuresInput.handleChange}
//                           onKeyDown={featuresInput.handleKeyDown}
//                           placeholder="Feature 1, Feature 2, Feature 3"
//                         />
//                       </div>
//                     </div>
//                   ) : (
//                     <div>
//                       {meter.meter_type_code?.trim() ? (
//                         <CardTitle className="text-3xl mb-2">
//                           {meter.model} - {meter.meter_type_code}
//                         </CardTitle>
//                       ) : (
//                         <CardTitle className="text-3xl mb-2">
//                           {meter.model}
//                         </CardTitle>
//                       )}

//                       {/* <CardTitle className="text-3xl mb-2">
//                         {meter.model}
//                       </CardTitle> */}
//                       {/* <CardDescription className="text-lg">
//                         {meter.connection_type}
//                       </CardDescription> */}
//                       <p className="text-lg text-primary font-medium">{meter.brand}</p>
//                       <p className="text-sm text-muted-foreground mt-1">Year: {meter.year_of_manufacture}</p>
//                     </div>
//                   )}
//                 </div>
//                 <div className="flex items-center gap-2">
//                   {isEditMode ? (
//                     <>
//                       <Button size="sm" onClick={handleSave}>
//                         <Save className="h-4 w-4 mr-1" />
//                         Save
//                       </Button>
//                       <Button size="sm" variant="outline" onClick={handleCancel}>
//                         <X className="h-4 w-4 mr-1" />
//                         Cancel
//                       </Button>
//                     </>
//                   ) : (
//                     <Button size="sm" variant="outline" onClick={handleEditToggle}>
//                       <Edit className="h-4 w-4 mr-1" />
//                       Edit
//                     </Button>
//                   )}
//                   <Badge variant="secondary" className="text-sm">
//                     {meter.connection_type}
//                   </Badge>
//                 </div>
//               </div>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-6">
//                 <div>
//                   <h3 className="font-semibold mb-3">Features</h3>
//                   <div className="flex flex-wrap gap-2">
//                     {/* {meter.features.map((feature, index) => (
//                       <Badge key={index} variant="outline">
//                         {feature}
//                       </Badge>
//                     ))} */}
//                     {(Array.isArray(meter.features)
//                                             ? meter.features
//                                             : JSON.parse(meter.features || "[]")
//                                           ).map((feature, index) => (
//                                             <Badge
//                                               key={index}
//                                               variant="outline"
//                                               className="text-xs"
//                                             >
//                                               {feature}
//                                             </Badge>
//                                           ))}
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <Card>
//                     <CardContent className="pt-6">
//                       <div className="text-center">
//                         <p className="text-3xl font-bold text-primary">
//                           {meter.commonIssues}
//                         </p>
//                         <p className="text-sm text-muted-foreground mt-1">
//                           Common Issues
//                         </p>
//                       </div>
//                     </CardContent>
//                   </Card>

//                   <Card>
//                     <CardContent className="pt-6">
//                       <div className="text-center">
//                         <p className="text-3xl font-bold text-primary">
//                           {meter.guides}
//                         </p>
//                         <p className="text-sm text-muted-foreground mt-1">
//                           Available Guides
//                         </p>
//                       </div>
//                     </CardContent>
//                   </Card>
//                 </div>

//                 <div className="flex gap-4">
//                   <Button
//                     className="flex-1"
//                     onClick={() => navigate(`/meter-behaviors/${meter.id}`)}
//                   >
//                     View Common Issues
//                   </Button>
//                   <Button
//                     variant="outline"
//                     className="flex-1"
//                     onClick={() => navigate("/guides")}
//                   >
//                     Browse Guides
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </Layout>
//   );
// }
//END OF VERSION 1.0 SECTION
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Navigation */}
        <Button
          variant="ghost"
          onClick={() => navigate("/directory")}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Directory
        </Button>

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">
              {meter.model}
              {meter.meter_type_code?.trim() && ` - ${meter.meter_type_code}`}
            </h1>
            <Badge variant="secondary" className="text-sm font-medium">
              {meter.connection_type}
            </Badge>
            {!isEditMode && (
              <Button size="sm" variant="ghost" onClick={handleEditToggle} className="ml-auto">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
          <p className="text-lg text-primary font-medium">{meter.brand}</p>
        </div>

        {/* Edit Mode Form */}
        {isEditMode && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg">Edit Meter Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={editedMeter.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    placeholder="Model"
                  />
                </div>
                {meter.meter_type_code?.trim() && (
                  <div className="space-y-2">
                    <Label htmlFor="meter_type_code">Meter Type Code</Label>
                    <Input
                      id="meter_type_code"
                      value={editedMeter.meter_type_code}
                      onChange={(e) => handleInputChange('meter_type_code', e.target.value)}
                      placeholder="Meter Type Code"
                    />
                  </div>
                )}
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
                <div className="space-y-2">
                  <Label htmlFor="connection_type">Connection Type</Label>
                  <Input
                    id="connection_type"
                    value={editedMeter.connection_type}
                    onChange={(e) => handleInputChange('connection_type', e.target.value)}
                    placeholder="Connection Type"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="features">Features (comma-separated)</Label>
                  <Input
                    id="features"
                    value={featuresInput.value}
                    onChange={featuresInput.handleChange}
                    onKeyDown={featuresInput.handleKeyDown}
                    placeholder="Feature 1, Feature 2, Feature 3"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-1" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Features Card */}
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wrench className="h-5 w-5 text-primary" />
                Features
              </CardTitle>
            </CardHeader>
            <CardContent className="h-40 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="flex flex-wrap gap-2 pr-3">
                  {(Array.isArray(meter.features)
                    ? meter.features
                    : JSON.parse(meter.features || "[]")
                  ).map((feature: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Common Issues Card */}
          <Card className="border-l-4 border-l-warning">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Common Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">{meter.commonIssues || 0}</p>
              <p className="text-sm text-muted-foreground">reported issues</p>
            </CardContent>
          </Card>

          {/* Guides Card */}
          <Card className="border-l-4 border-l-success">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-success" />
                Guides Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-foreground">{meter.guides || 0}</p>
              <p className="text-sm text-muted-foreground">troubleshooting guides</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button onClick={() => navigate("/guides")} className="gap-2">
            <BookOpen className="h-4 w-4" />
            View Related Guides
          </Button>
          <Button variant="outline" onClick={() => navigate(`/meter-behaviors/${meter.id}`)} className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            View Error Codes
          </Button>
        </div>
      </div>
    </Layout>
  );
}
