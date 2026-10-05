import { useState } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { useFormContext } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  HEADING_MAX_LENGTH,
  MAX_COLUMNS,
  SimulationRow,
  applyPastedTable,
  emptySimulationRow,
  normalizeHeadings,
  parseClipboardTable,
} from "@/lib/simulation";

type SimulationForm = { simulationRows: SimulationRow[]; simulationHeadings: string[] };

const cellSelector = (row: number, column: number) => `[data-simulation-cell="${row}-${column}"]`;

// A row added by a key press is not in the DOM until React re-renders, so focus
// after the current event has finished.
const focusCell = (row: number, column: number) =>
  setTimeout(() => document.querySelector<HTMLInputElement>(cellSelector(row, column))?.focus());

// A spreadsheet-style editor for the simulation results table. Rows and columns
// can be added and removed freely. It must sit inside a <Form> whose values
// include `simulationRows` (a list of rows, each a list of cells) and
// `simulationHeadings` (one heading per column). It always keeps one row and
// one column; SymptomsFields removes the table as a whole.
export function SimulationTableEditor() {
  const form = useFormContext<SimulationForm>();
  const { toast } = useToast();
  const [columnToRemove, setColumnToRemove] = useState<number | null>(null);

  const rows = form.watch("simulationRows");
  const headings = normalizeHeadings(form.watch("simulationHeadings"));

  const update = { shouldDirty: true, shouldValidate: form.formState.isSubmitted };
  const setRows = (next: SimulationRow[]) => form.setValue("simulationRows", next, update);
  const setHeadings = (next: string[]) => form.setValue("simulationHeadings", next, update);

  const addRow = () => setRows([...rows, emptySimulationRow(headings.length)]);
  const removeRow = (rowIndex: number) => setRows(rows.filter((_, index) => index !== rowIndex));

  const addColumn = () => {
    if (headings.length >= MAX_COLUMNS) return;
    setHeadings([...headings, `Column ${headings.length + 1}`]);
    setRows(rows.map((row) => [...row, ""]));
  };
  const removeColumn = (columnIndex: number) => {
    setHeadings(headings.filter((_, index) => index !== columnIndex));
    setRows(rows.map((row) => row.filter((_, index) => index !== columnIndex)));
  };
  // Removing a column that holds data asks first, because its cells are deleted too.
  const requestRemoveColumn = (columnIndex: number) => {
    if (rows.some((row) => (row[columnIndex] ?? "").trim() !== "")) setColumnToRemove(columnIndex);
    else removeColumn(columnIndex);
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>, rowIndex: number, columnIndex: number) => {
    const text = event.clipboardData.getData("text/plain");
    // A single value pastes normally; a block of cells fills the table.
    if (!/[\t\n]/.test(text.replace(/\r?\n$/, ""))) return;
    event.preventDefault();

    const pasted = applyPastedTable({ headings, rows }, parseClipboardTable(text), rowIndex, columnIndex);
    if (!pasted) return;

    form.setValue("simulationHeadings", pasted.headings, update);
    form.setValue("simulationRows", pasted.rows, update);
    void form.trigger("simulationRows");

    const description = {
      "new-headings": "The first row became the column headings.",
      "by-heading": "Columns were matched by their headings.",
      "by-position": "No heading row found, so cells were filled from the selected cell.",
    }[pasted.mode];
    toast({
      title: `Pasted ${pasted.rowCount} row${pasted.rowCount === 1 ? "" : "s"}`,
      description: [
        description,
        pasted.addedColumns > 0
          ? `Added ${pasted.addedColumns} column${pasted.addedColumns === 1 ? "" : "s"}.`
          : "",
      ]
        .filter(Boolean)
        .join(" "),
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, rowIndex: number, columnIndex: number) => {
    if (event.key === "Enter") {
      // Enter would otherwise submit the whole form.
      event.preventDefault();
      const nextRow = rowIndex + (event.shiftKey ? -1 : 1);
      if (nextRow < 0) return;
      if (nextRow >= rows.length) addRow();
      focusCell(nextRow, columnIndex);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const nextRow = rowIndex + (event.key === "ArrowDown" ? 1 : -1);
      if (nextRow < 0 || nextRow >= rows.length) return;
      event.preventDefault();
      focusCell(nextRow, columnIndex);
    }
  };

  const errors = form.formState.errors;
  const rowErrors = Array.isArray(errors.simulationRows) ? errors.simulationRows : [];
  const headingErrors = Array.isArray(errors.simulationHeadings) ? errors.simulationHeadings : [];
  const messages = [
    errors.simulationRows?.root?.message ?? errors.simulationRows?.message,
    errors.simulationHeadings?.message,
    ...rowErrors.map((error, index) => (error?.message ? `Row ${index + 1}: ${error.message}` : undefined)),
    ...headingErrors.map((error, index) => (error?.message ? `Heading ${index + 1}: ${error.message}` : undefined)),
  ].filter((message): message is string => !!message);

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Add or remove rows and columns as needed. Paste straight from Excel: copy the cells, click the
        first cell here and press Ctrl+V. If the table is empty, the first pasted row becomes the column
        headings; otherwise pasted headings are matched to the columns by name and new ones are added.
        Enter moves down, Tab moves across. Click a heading to rename it.
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-10 border-r text-center">#</TableHead>
              {headings.map((heading, columnIndex) => (
                <TableHead key={columnIndex} className="h-9 border-r p-0">
                  <div className="flex items-center">
                    <FormField
                      control={form.control}
                      name={`simulationHeadings.${columnIndex}`}
                      render={({ field }) => (
                        <Input
                          {...field}
                          value={field.value ?? ""}
                          maxLength={HEADING_MAX_LENGTH}
                          aria-label={`Heading for column ${columnIndex + 1}`}
                          title="Click to rename this column"
                          // Widen the column to fit its heading; the cells below stretch with it.
                          style={{ minWidth: `calc(${(field.value ?? "").length}ch + 2rem)` }}
                          onBlur={() => {
                            // A blank heading is given a name so the column can be told apart.
                            if (!field.value?.trim()) field.onChange(`Column ${columnIndex + 1}`);
                            field.onBlur();
                          }}
                          className={cn(
                            "h-9 rounded-none border-0 bg-transparent px-3 font-medium text-muted-foreground shadow-none",
                            "hover:bg-muted focus-visible:bg-background focus-visible:text-foreground",
                            "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0",
                            columnIndex === 0 || columnIndex === headings.length - 1 ? "min-w-[14rem]" : "min-w-[7rem]",
                          )}
                        />
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-8 shrink-0 rounded-none text-muted-foreground"
                      aria-label={`Remove column ${columnIndex + 1} (${heading})`}
                      title="Remove this column"
                      onClick={() => requestRemoveColumn(columnIndex)}
                      disabled={headings.length <= 1}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-10">
                <span className="sr-only">Remove row</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-transparent">
                <TableCell className="border-r bg-muted/30 p-0 text-center text-xs text-muted-foreground">
                  {rowIndex + 1}
                </TableCell>
                {headings.map((heading, columnIndex) => (
                  <TableCell key={columnIndex} className="border-r p-0">
                    <FormField
                      control={form.control}
                      name={`simulationRows.${rowIndex}.${columnIndex}`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value ?? ""}
                              data-simulation-cell={`${rowIndex}-${columnIndex}`}
                              aria-label={`${heading}, row ${rowIndex + 1}`}
                              onPaste={(event) => handlePaste(event, rowIndex, columnIndex)}
                              onKeyDown={(event) => handleKeyDown(event, rowIndex, columnIndex)}
                              className={cn(
                                "h-9 rounded-none border-0 bg-transparent shadow-none",
                                "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0",
                                rowErrors[rowIndex]?.message && "bg-destructive/10 ring-1 ring-inset ring-destructive",
                                columnIndex === 0 || columnIndex === headings.length - 1
                                  ? "min-w-[14rem]"
                                  : "min-w-[7rem]",
                              )}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TableCell>
                ))}
                <TableCell className="p-0 text-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    aria-label={`Remove row ${rowIndex + 1}`}
                    onClick={() => removeRow(rowIndex)}
                    disabled={rows.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {messages.length > 0 && (
        <ul className="space-y-1 text-sm font-medium text-destructive">
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={addRow}>
          <Plus className="mr-2 h-4 w-4" /> Add row
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={addColumn} disabled={headings.length >= MAX_COLUMNS}>
          <Plus className="mr-2 h-4 w-4" /> Add column
        </Button>
      </div>

      <AlertDialog open={columnToRemove !== null} onOpenChange={(open) => !open && setColumnToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this column?</AlertDialogTitle>
            <AlertDialogDescription>
              Everything entered under &ldquo;{columnToRemove === null ? "" : headings[columnToRemove]}&rdquo; will be
              deleted from this form.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep the column</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (columnToRemove !== null) removeColumn(columnToRemove);
                setColumnToRemove(null);
              }}
            >
              Remove the column
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
