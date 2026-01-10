import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllBehaviors } from "@/data/behaviorData";
import { Search, Plus, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast"; //in CreateMeterForm we used useToast hook, what is the difference?
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity } from "lucide-react";
import API_BASE_URL from "@/config/api";


// Uncomment for API integration
interface ApiBehavior {
  id: number;
  meter_id: number;
  title: string;
  description: string;
  symptoms: string;
  solutions: string;
  reported_by?: string;
  created_at: string;
  updated_at: string;
  meter?: { //already frontend is intelligent enough to expect meter brand and model here
    brand: string;
    model: string;
    meter_type_code: string;
    year_of_manufacture: string;
  };//To revisit-Need now to add user info when backend supports it. This will require user_id field in behaviors table
}

export default function MeterBehaviors() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  
  // Current local storage implementation
  // const behaviors = getAllBehaviors();
  
  // Uncomment for API integration
  const [behaviors, setBehaviors] = useState<ApiBehavior[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");

  
  useEffect(() => {
    const fetchBehaviors = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/behaviors`, {
          // method: 'GET',//without method what happens?
          // credentials: "include",
          // headers: {
          //   'Content-Type': 'application/json',
          //   // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          // },
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          }

        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch behaviors');
        }
        
        const data: ApiBehavior[] = await response.json();
        setBehaviors(data);
      } catch (error) {
        console.error('Error fetching behaviors:', error);
        toast({
          title: "Error",
          description: "Failed to load behaviors. Please try again later.",
          variant: "destructive",
        });
        setBehaviors([]);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchBehaviors();
    
    // Refetch when returning from create page
    // The location.state?.refreshBehaviors flag is set in CreateBehaviorForm
  }, [location.state?.refreshBehaviors]);

  // This implementation is for local storage data
  // const filteredBehaviors = behaviors.filter(behavior => {
  //   const matchesSearch = 
  //     behavior.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     behavior.meterBrand.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     behavior.meterModel.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     behavior.description.toLowerCase().includes(searchTerm.toLowerCase());
    
  //   const matchesSeverity = selectedSeverity === "all" || behavior.severity === selectedSeverity;
    
  //   return matchesSearch && matchesSeverity;
  // });

  const availableBrands = Array.from(
  new Set(
    behaviors
      .map(b => b.meter?.brand)
      .filter(Boolean)
  )
).sort();

  
  // Uncomment for API integration - adjust filter logic for API data structure
  const filteredBehaviors = behaviors.filter(behavior => {
    const matchesSearch = 
      behavior.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (behavior.meter?.brand || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (behavior.meter?.model || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      behavior.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Note: API might need severity field added to match this filtering
    // const matchesSeverity = selectedSeverity === "all" || behavior.severity === selectedSeverity;
    //const matchesSeverity = true; // Remove if API has severity field

    const matchesBrand =
    selectedBrand === "all" ||
    behavior.meter?.brand === selectedBrand;

  return matchesSearch && matchesBrand; //&& matchesSeverity;
    
  });
console.log(filteredBehaviors.map(b => b.symptoms.length))

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  if (isLoading) {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">

        <div className="max-w-md mx-auto space-y-4 mb-10 mt-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-foreground mb-2">
              Loading behaviour guides...
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Fetching meter behaviour reports
            </p>
          </div>

          <Progress value={66} className="h-2" />
        </div>

        {/* Skeleton list for behaviors */}
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />

              <div className="flex justify-between pt-4 border-t">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-24" />
              </div>
            </Card>
          ))}
        </div>

      </div>
    </Layout>
  );
}


  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold mb-2 text-foreground">Behaviour Guides</h1>
              
            </div>
            <Button onClick={() => navigate("/behaviors/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Report Behaviour
            </Button>
          </div>
          <p className="text-lg text-muted-foreground mb-8">
                Browse reported meter behaviours, issues, and their solutions
          </p>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search behaviour guides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All Brands</option>
                  {availableBrands.map((brand) => (
                  <option key={brand} value={brand}>
                  {brand}
                </option>
                ))}
              </select>
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Uncomment for API integration loading state */}
        {/* {isLoading ? (
          <Card className="p-8 text-center">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Loading behaviors...</h3>
          </Card>
        ) : */}
        {filteredBehaviors.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No behaviour guides found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {filteredBehaviors.map((behavior) => (
              <Card key={behavior.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{behavior.title}</h3>
                      {/* <Badge variant={getSeverityColor(behavior.severity)}>
                        {behavior.severity}
                      </Badge> */}
                    </div>
                    {/* <p className="text-sm text-muted-foreground mb-2"> */}
                      {behavior.meter?.meter_type_code?.trim() ? 
                      <p className="text-sm text-muted-foreground mb-2"> {behavior.meter?.brand} | {behavior.meter?.model} | {behavior.meter?.meter_type_code} | {behavior.meter?.year_of_manufacture} </p> : 
                      <p className="text-sm text-muted-foreground mb-2"> {behavior.meter?.brand} | {behavior.meter?.model} | {behavior.meter?.year_of_manufacture}</p>}
                      {/* {behavior.meter?.brand} - {behavior.meter?.model} */}
                      {/* For API: {behavior.meter?.brand} - {behavior.meter?.model} */}
                    {/* </p> */}
                    <p className="text-muted-foreground">{behavior.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>
                      {Array.isArray(behavior.symptoms) ? behavior.symptoms.length : JSON.parse(behavior.symptoms || "[]").length} symptoms
                    </span>{/*Bug in calculating length now corrected*/}
                    <span>
                      {Array.isArray(behavior.solutions) ? behavior.solutions.length : JSON.parse(behavior.solutions || "[]").length} solutions
                    </span>{/*Bug in calculating length now corrected*/}
                    {/* <span>Reported: {behavior.dateReported}</span> */}
                    <span>Reported: {new Date(behavior.created_at).toLocaleDateString()}</span>{/*For API:*/}
                    <span>By: {behavior.reported_by || "Anonymous"}</span>{/*To revisit once final decision between reported_by and user_id is made*/}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/behaviors/${behavior.id}`)}
                    >
                      View Details
                    </Button>
                    {/* Uncomment when guide association is implemented */}
                    {/* <Button
                      variant="ghost"
                      onClick={() => navigate(`/guides/${behavior.guide_id}`)}
                    >
                      View Related Guide
                    </Button> */}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
