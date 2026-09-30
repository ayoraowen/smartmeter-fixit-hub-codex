import type { ClipboardEvent, KeyboardEvent } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  DEFAULT_HEADINGS,
  HEADING_MAX_LENGTH,
  SIMULATION_COLUMNS,
  SimulationRow,
  emptySimulationRow,
  mapPastedTable,
  normalizeHeadings,
  parseClipboardTable,
} from "@/lib/simulation";

type SimulationForm = { simulationRows: SimulationRow[]; simulationHeadings: string[] };

const cellSelector = (row: number, column: number) => `[data-simulation-cell="${row}-${column}"]`;

// A row added by a key press is not in the DOM until React re-renders, so focus
// after the current event has finished.
const focusCell = (row: number, column: number) =>
  setTimeout(() => document.querySelector<HTMLInputElement>(cellSelector(row, column))?.focus());

// A spreadsheet-style editor for the simulation results table. It must sit
// inside a <Form> whose values include `simulationRows` and `simulationHeadings`.
// With allowEmpty, the last row can be removed (used when editing a record that
// may have no table).
export function SimulationTableEditor({ allowEmpty = false }: { allowEmpty?: boolean }) {
  const form = useFormContext<SimulationForm>();
  const rows = useFieldArray({ control: form.control, name: "simulationRows" });
  const { toast } = useToast();
  const headings = normalizeHeadings(form.watch("simulationHeadings"));

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>, rowIndex: number, columnIndex: number) => {
    const text = event.clipboardData.getData("text/plain");
    // A single value pastes normally; a block of cells fills the table.
    if (!/[\t\n]/.test(text.replace(/\r?\n$/, ""))) return;
    event.preventDefault();

    const pasted = mapPastedTable(parseClipboardTable(text), columnIndex, headings);
    if (pasted.rows.length === 0) return;

    const next = [...form.getValues("simulationRows")];
    pasted.rows.forEach((row, offset) => {
      next[rowIndex + offset] = { ...(next[rowIndex + offset] ?? emptySimulationRow()), ...row };
    });
    rows.replace(next);
    void form.trigger("simulationRows");

    const count = pasted.rows.length;
    toast({
      title: `Pasted ${count} row${count === 1 ? "" : "s"}`,
      description: [
        pasted.usedHeader
          ? "Columns were matched by their headings."
          : "No heading row found, so cells were filled from the selected column.",
        pasted.ignoredColumns.length > 0 ? `Ignored: ${pasted.ignoredColumns.join(", ")}.` : "",
      ].join(" "),
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, rowIndex: number, columnIndex: number) => {
    if (event.key === "Enter") {
      // Enter would otherwise submit the whole form.
      event.preventDefault();
      const nextRow = rowIndex + (event.shiftKey ? -1 : 1);
      if (nextRow < 0) return;
      if (nextRow >= rows.fields.length) rows.append(emptySimulationRow(), { shouldFocus: false });
      focusCell(nextRow, columnIndex);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const nextRow = rowIndex + (event.key === "ArrowDown" ? 1 : -1);
      if (nextRow < 0 || nextRow >= rows.fields.length) return;
      event.preventDefault();
      focusCell(nextRow, columnIndex);
    }
  };

  const rowErrors = form.formState.errors.simulationRows;
  const cellMessages = Array.isArray(rowErrors)
    ? rowErrors.flatMap((rowError, rowIndex) =>
        SIMULATION_COLUMNS.flatMap((column, columnIndex) => {
          const message = rowError?.[column.key]?.message;
          return message ? [`Row ${rowIndex + 1}, ${headings[columnIndex]}: ${message}`] : [];
        }),
      )
    : [];
  const tableMessage = rowErrors?.root?.message ?? rowErrors?.message;

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Paste straight from Excel: copy the cells including the heading row, click the first
        cell here and press Ctrl+V. Columns can be in any order. Enter moves down, Tab moves
        across. Click a heading to rename it. The third and last columns are optional.
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-10 border-r text-center">#</TableHead>
              {SIMULATION_COLUMNS.map((column, columnIndex) => (
                <TableHead key={column.key} className="h-9 border-r p-0">
                  <FormField
                    control={form.control}
                    name={`simulationHeadings.${columnIndex}`}
                    render={({ field }) => (
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        maxLength={HEADING_MAX_LENGTH}
                        aria-label={`Heading for column ${columnIndex + 1} (${column.label})`}
                        title="Click to rename this column"
                        // Widen the column to fit its heading; the cells below stretch with it.
                        style={{ minWidth: `calc(${(field.value ?? "").length}ch + 2rem)` }}
                        onBlur={() => {
                          // A blank heading goes back to the default name.
                          if (!field.value?.trim()) field.onChange(DEFAULT_HEADINGS[columnIndex]);
                          field.onBlur();
                        }}
                        className={cn(
                          "h-9 rounded-none border-0 bg-transparent px-3 font-medium text-muted-foreground shadow-none",
                          "hover:bg-muted focus-visible:bg-background focus-visible:text-foreground",
                          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0",
                          column.key === "scenario" || column.key === "remarks" ? "min-w-[14rem]" : "min-w-[7rem]",
                        )}
                      />
                    )}
                  />
                </TableHead>
              ))}
              <TableHead className="w-10">
                <span className="sr-only">Remove row</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.fields.map((row, rowIndex) => (
              <TableRow key={row.id} className="hover:bg-transparent">
                <TableCell className="border-r bg-muted/30 p-0 text-center text-xs text-muted-foreground">
                  {rowIndex + 1}
                </TableCell>
                {SIMULATION_COLUMNS.map((column, columnIndex) => (
                  <TableCell key={column.key} className="border-r p-0">
                    <FormField
                      control={form.control}
                      name={`simulationRows.${rowIndex}.${column.key}`}
                      render={({ field, fieldState }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input
                              {...field}
                              onChange={(event) => {
                                field.onChange(event);
                                // A paste validates at once, so clear a cell's error as soon as it is fixed.
                                if (fieldState.error) void form.trigger(field.name);
                              }}
                              data-simulation-cell={`${rowIndex}-${columnIndex}`}
                              aria-label={`${headings[columnIndex]}, row ${rowIndex + 1}`}
                              title={fieldState.error?.message}
                              placeholder={column.key === "register" ? "1.8.0" : undefined}
                              onPaste={(event) => handlePaste(event, rowIndex, columnIndex)}
                              onKeyDown={(event) => handleKeyDown(event, rowIndex, columnIndex)}
                              className={cn(
                                "h-9 rounded-none border-0 bg-transparent shadow-none",
                                "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-offset-0",
                                fieldState.error && "bg-destructive/10 ring-1 ring-inset ring-destructive",
                                column.key === "scenario" || column.key === "remarks"
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
                    onClick={() => rows.remove(rowIndex)}
                    disabled={!allowEmpty && rows.fields.length <= 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {(cellMessages.length > 0 || tableMessage) && (
        <ul className="space-y-1 text-sm font-medium text-destructive">
          {tableMessage && <li>{tableMessage}</li>}
          {cellMessages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => rows.append(emptySimulationRow())}
      >
        <Plus className="mr-2 h-4 w-4" /> Add row
      </Button>
    </div>
  );
}
