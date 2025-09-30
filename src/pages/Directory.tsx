import { useState } from "react";
import { Search, Filter, Grid3X3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layout } from "@/components/layout/Layout";
import { meterData } from "@/data/meterData";
import { useNavigate } from "react-router-dom";

export default function Directory() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");

  const brands = ["all", ...Array.from(new Set(meterData.map(meter => meter.brand)))];

  const filteredMeters = meterData.filter(meter => {
    const matchesSearch = meter.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meter.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         meter.type.toLowerCase().includes(searchTerm.toLowerCase());
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
            <h1 className="text-3xl font-bold text-foreground">Meter Directory</h1>
          </div>
          <Button onClick={() => navigate("/directory/create")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Meter
          </Button>
        </div>
        <p className="text-lg text-muted-foreground">Browse smart meters by brand and model</p>
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
            {brands.map(brand => (
              <option key={brand} value={brand}>
                {brand === "all" ? "All Brands" : brand}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Meter Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMeters.map((meter) => (
          <Card key={meter.id} className="hover:shadow-card transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{meter.model}</CardTitle>
                  <p className="text-sm text-primary font-medium">{meter.brand}</p>
                </div>
                <Badge variant="secondary">{meter.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {meter.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {meter.commonIssues} common issues
                  </span>
                  <span className="text-muted-foreground">
                    {meter.guides} guides available
                  </span>
                </div>
                
                <Button className="w-full">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMeters.length === 0 && (
        <div className="text-center py-12">
          <Grid3X3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No meters found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}
      </div>
    </Layout>
  );
}