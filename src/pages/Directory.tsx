import { useState, useEffect } from "react";
import { Search, Filter, Grid3X3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { meterData } from "@/data/meterData";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import API_BASE_URL from "@/config/api";

export default function Directory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  
  // API Implementation (commented out - replace static meterData when backend is ready)
  const [meters, setMeters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchMeters = async () => {
      try {
        const token = localStorage.getItem('authToken')
        const response = await fetch(`${API_BASE_URL}/meters`, {
          method: 'GET',
          // credentials: "include", // 👈 sends the session cookie
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Authorization': `Bearer ${token}`
          },
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch meters');
        }
  
        const data = await response.json();
        // Expected response format: Array of meter objects
        // [{
        //   id: number,
        //   brand: string,
        //   model: string,
        //   type: string,
        //   features: string[],
        //   commonIssues: number,
        //   guides: number,
        //   createdAt: string
        // }]
        console.log(data);
        setMeters(data);
      } catch (error) {
        console.error('Error fetching meters:', error);
        // Optionally show toast notification - To revisit, need to import toast here
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchMeters();
  }, []); // Empty dependency array = fetch once on mount
  
  // Current static implementation - replace with: const brands = ["all", ...Array.from(new Set(meters.map(meter => meter.brand)))];
  // const brands = ["all", ...Array.from(new Set(meterData.map(meter => meter.brand)))];
  const brands = ["all", ...Array.from(new Set(meters.map(meter => meter.brand)))];
  //const featuresDbColStringToArray = meters.map((meter) =>(Array.isArray(meter.features) ? meter.features : JSON.parse(meter.features || "[]")));

  // Current static implementation - replace 'meterData' with 'meters' when using API
  const filteredMeters = meters.filter(meter => {
    const featuresDbColStringToArray = Array.isArray(meter.features) ? meter.features : JSON.parse(meter.features || "[]");
    const matchesSearch = meter.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meter.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meter.connection_type.toLowerCase().includes(searchTerm.toLowerCase());
                         console.log(meter.model, meter.brand, meter.connection_type, featuresDbColStringToArray, meter.meter_type_code);
    const matchesBrand = selectedBrand === "all" || meter.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Grid3X3 className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">
                Meter Directory
              </h1>
            </div>
            <Button onClick={() => navigate("/directory/create")}>
              <Plus className="h-4 w-4 mr-2" />
              Add Meter
            </Button>
          </div>
          <p className="text-lg text-muted-foreground">
            Browse smart meters by brand and model
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search meters by brand, model, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand === "all" ? "All Brands" : brand}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State with Progress Indicator */}
        {isLoading && (
          <div className="space-y-8">
            <div className="max-w-md mx-auto space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Loading meters...
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Fetching the latest meter data
                </p>
              </div>
              <Progress value={66} className="h-2" />
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Skeleton className="h-4 w-20 mb-2" />
                        <div className="flex flex-wrap gap-1">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-5 w-20" />
                          <Skeleton className="h-5 w-14" />
                        </div>
                      </div>
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Meter Grid */}
        {!isLoading && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMeters.map((meter) => (
            <Card
              key={meter.id}
              className="hover:shadow-card transition-all duration-300"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    {/* {value !== null ? <p>{value}</p> : null} */}
                    {/* {meter.meter_type_code !== null ? <CardTitle className="text-lg">{meter.model} - {meter.meter_type_code}</CardTitle> : <CardTitle className="text-lg">{meter.model}</CardTitle>} */}
                    {meter.meter_type_code?.trim() ? <CardTitle className="text-lg"> {meter.model} - {meter.meter_type_code} </CardTitle> : <CardTitle className="text-lg"> {meter.model} </CardTitle>}{/*Refactoring to handle empty strings being stored in remote turso (turso forces null to be an empty string instead of storing null) and null from frontend*/}
                    {/* <CardTitle className="text-lg">{meter.model}</CardTitle> */}
                    <p className="text-sm text-primary font-medium">
                      {meter.brand}
                    </p>
                    <p className="text-xs text-muted-foreground">Year: {meter.year_of_manufacture}</p>
                  </div>
                  <Badge variant="secondary">{meter.connection_type}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      Features
                    </h4>
                    <div className="flex flex-wrap gap-1">
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

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {/* {meter.commonIssues} common issues */}
                    </span>
                    <span className="text-muted-foreground">
                      {/* {meter.guides} guides available */}
                    </span>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => navigate(`/directory/${meter.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )} 

        {!isLoading && filteredMeters.length === 0 && (
        
          <div className="text-center py-12">
            <Grid3X3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No meters found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria
            </p>
          </div>
        )}
        
      </div>
    </Layout>
  );
}