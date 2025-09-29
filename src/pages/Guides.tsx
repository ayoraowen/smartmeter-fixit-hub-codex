import { useState } from "react";
import { Search, Book, Clock, Star, ChevronRight, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout/Layout";
import { Link } from "react-router-dom";

export default function Guides() {
  const [searchTerm, setSearchTerm] = useState("");

  const guides = [
    {
      id: 1,
      title: "Resolving Communication Failures in Schneider ION Meters",
      category: "Communication",
      difficulty: "Intermediate",
      duration: "15 min",
      rating: 4.8,
      votes: 24,
      author: "Tech Lead Mike",
      lastUpdated: "2 days ago",
      steps: 8,
      description: "Step-by-step guide to diagnose and fix common communication issues with Schneider Electric ION series meters."
    },
    {
      id: 2,
      title: "Factory Reset Procedure for Siemens PAC3200",
      category: "Configuration",
      difficulty: "Beginner",
      duration: "5 min",
      rating: 4.9,
      votes: 31,
      author: "Senior Tech Sarah",
      lastUpdated: "1 week ago",
      steps: 4,
      description: "Complete factory reset process including backup procedures and post-reset configuration."
    },
    {
      id: 3,
      title: "Troubleshooting Power Quality Issues",
      category: "Power",
      difficulty: "Advanced",
      duration: "30 min",
      rating: 4.7,
      votes: 18,
      author: "Expert John",
      lastUpdated: "3 days ago",
      steps: 12,
      description: "Advanced diagnostics for power quality problems including harmonics, voltage sag, and frequency variations."
    },
    {
      id: 4,
      title: "Firmware Update Best Practices",
      category: "Maintenance",
      difficulty: "Intermediate",
      duration: "20 min",
      rating: 4.6,
      votes: 22,
      author: "Field Engineer Lisa",
      lastUpdated: "5 days ago",
      steps: 10,
      description: "Safe firmware update procedures with rollback strategies and compatibility checks."
    },
    {
      id: 5,
      title: "Network Configuration for AMI Deployment",
      category: "Network",
      difficulty: "Advanced",
      duration: "45 min",
      rating: 4.8,
      votes: 15,
      author: "Network Specialist Tom",
      lastUpdated: "1 week ago",
      steps: 15,
      description: "Complete network setup guide for Advanced Metering Infrastructure including security configuration."
    }
  ];

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

  const filteredGuides = guides.filter(guide =>
    guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guide.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Book className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Troubleshooting Guides</h1>
          </div>
          <Link to="/guides/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Guide
            </Button>
          </Link>
        </div>
        <p className="text-lg text-muted-foreground">Expert-verified step-by-step solutions</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search guides by title, category, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Guides List */}
      <div className="space-y-4">
        {filteredGuides.map((guide) => (
          <Card key={guide.id} className="hover:shadow-card transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{guide.title}</CardTitle>
                  <p className="text-muted-foreground text-sm mb-3">{guide.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{guide.category}</Badge>
                    <Badge variant={getDifficultyColor(guide.difficulty) as any}>
                      {guide.difficulty}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {guide.duration}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Star className="h-3 w-3 mr-1 fill-warning text-warning" />
                      {guide.rating} ({guide.votes} votes)
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  View Guide
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <span>By {guide.author}</span>
                  <span>{guide.steps} steps</span>
                </div>
                <span>Updated {guide.lastUpdated}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGuides.length === 0 && (
        <div className="text-center py-12">
          <Book className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No guides found</h3>
          <p className="text-muted-foreground">Try adjusting your search criteria</p>
        </div>
      )}
      </div>
    </Layout>
  );
}