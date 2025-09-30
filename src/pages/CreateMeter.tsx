import { Layout } from "@/components/layout/Layout";
import { CreateMeterForm } from "@/components/forms/CreateMeterForm";
import { Card } from "@/components/ui/card";

export default function CreateMeter() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Add New Meter</h1>
            <p className="text-muted-foreground">
              Add a new meter to the directory with its specifications and details.
            </p>
          </div>

          <Card className="p-6">
            <CreateMeterForm />
          </Card>
        </div>
      </div>
    </Layout>
  );
}
