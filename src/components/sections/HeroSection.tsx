import { Search, Zap, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export function HeroSection() {
  const features = [
    {
      icon: Search,
      title: "Smart Search",
      description: "Find solutions by meter model, error code, or symptoms"
    },
    {
      icon: BookOpen,
      title: "Step-by-Step Guides",
      description: "Detailed troubleshooting procedures"
    },
    {
      icon: Zap,
      title: "Error Code Library",
      description: "Comprehensive database of meter error codes and fixes"
    },
    {
      icon: Users,
      title: "Expert Community",
      description: "Technical staff-verified solutions and best practices"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Energy Meter
            <span className="block text-primary">Troubleshooting Hub</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            The MCL comprehensive resource for utility staff to resolve customer energy meter issues quickly and efficiently.
          </p>
          
          {/* Hero Search */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for meter model, error code, or describe your issue..."
                className="pl-12 py-4 text-lg bg-card shadow-card"
              />
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Button variant="secondary" size="sm">E101</Button>
              <Button variant="secondary" size="sm">Communication Error</Button>
              <Button variant="secondary" size="sm">Billing Mismatch</Button>
              <Button variant="secondary" size="sm">Power Outage</Button>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm hover:shadow-card transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}