import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SimulationRow, emptySimulationRow } from "@/lib/simulation";
import { SimulationTableEditor } from "./SimulationTableEditor";

type SymptomsForm = {
  simulationRows: SimulationRow[];
  simulationHeadings: string[];
  notes: string[];
};

const rowHasData = (row: SimulationRow) => Object.values(row).some((value) => value.trim() !== "");

// The symptoms section of a behaviour: an optional simulation table and any
// number of free-text notes. Shared by the create form and the edit mode of the
// detail page, which must sit inside a <Form> with the fields above.
export function SymptomsFields() {
  const form = useFormContext<SymptomsForm>();
  const [confirmRemoveTable, setConfirmRemoveTable] = useState(false);

  // The table is shown whenever it has rows; switching it off removes them.
  const rows = form.watch("simulationRows");
  const notes = form.watch("notes");
  const includeTable = rows.length > 0;
  const filledRows = rows.filter(rowHasData).length;

  const setRows = (next: SimulationRow[]) =>
    form.setValue("simulationRows", next, { shouldDirty: true, shouldValidate: form.formState.isSubmitted });

  const handleTableSwitch = (checked: boolean) => {
    if (checked) setRows([emptySimulationRow()]);
    else if (filledRows > 0) setConfirmRemoveTable(true);
    else setRows([]);
  };

  const setNotes = (next: string[]) =>
    form.setValue("notes", next, { shouldDirty: true, shouldValidate: form.formState.isSubmitted });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Switch id="include-simulation-table" checked={includeTable} onCheckedChange={handleTableSwitch} />
        <Label htmlFor="include-simulation-table">Include a simulation table</Label>
      </div>

      {includeTable && <SimulationTableEditor />}

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">Notes</h3>
          <p className="text-sm text-muted-foreground">
            Symptoms or observations that are not table rows.
          </p>
        </div>
        {notes.map((_, index) => (
          <FormField
            key={index}
            control={form.control}
            name={`notes.${index}`}
            render={({ field }) => (
              <FormItem>
                <div className="flex gap-3">
                  <FormControl>
                    <Textarea {...field} placeholder="Describe a symptom or observation..." className="min-h-[80px]" />
                  </FormControl>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    aria-label={`Remove note ${index + 1}`}
                    onClick={() => setNotes(notes.filter((__, i) => i !== index))}
                  >
                    <Minus />
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        {form.formState.errors.notes?.message && (
          <p className="text-sm font-medium text-destructive">{form.formState.errors.notes.message}</p>
        )}
        <Button type="button" size="sm" variant="secondary" onClick={() => setNotes([...notes, ""])}>
          <Plus className="mr-2 h-4 w-4" /> Add Note
        </Button>
      </div>

      <AlertDialog open={confirmRemoveTable} onOpenChange={setConfirmRemoveTable}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove the simulation table?</AlertDialogTitle>
            <AlertDialogDescription>
              The {filledRows === 1 ? "row" : `${filledRows} rows`} you entered will be deleted from this form.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep the table</AlertDialogCancel>
            <AlertDialogAction onClick={() => setRows([])}>Remove the table</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
