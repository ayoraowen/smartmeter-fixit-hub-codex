import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { CreateGuideForm, CreateGuideFormData } from "@/components/forms/CreateGuideForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CreateGuide = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Simulate user authentication check
  // TODO: Replace with actual authentication logic when backend is ready
  const [isAuthenticated] = useState(true); // Mock logged-in state

  const handleSubmit = async (data: CreateGuideFormData) => {
    setIsLoading(true);
    
    try {
      // TODO: Implement actual guide creation when backend is ready
      console.log("Creating guide:", data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to guides page after successful creation
      navigate("/guides");
    } catch (error) {
      console.error("Failed to create guide:", error);
      throw new Error("Failed to create guide. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                You need to be logged in to create guides.
              </AlertDescription>
            </Alert>
            <div className="mt-6 space-y-3">
              <Link to="/auth">
                <Button className="w-full">Sign In</Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/guides" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Guides
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-2">Create New Guide</h1>
          <p className="text-lg text-muted-foreground">
            Share your expertise and help others resolve energy meter issues
          </p>
        </div>

        {/* Form */}
        <CreateGuideForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </Layout>
  );
};

export default CreateGuide;