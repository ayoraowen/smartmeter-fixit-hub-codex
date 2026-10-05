import * as z from "zod";
import { HEADING_MAX_LENGTH, MAX_COLUMNS } from "@/lib/simulation";

// Validation for the simulation results table, shared by the create form and
// the edit mode of the detail page. The columns are chosen by the person, so
// cells are free text: the only rule is that a row is not completely empty.

export const simulationRowSchema = z
  .array(z.string().trim())
  .refine((row) => row.some((cell) => cell.length > 0), "Fill in at least one cell, or remove the row");

export const simulationHeadingsSchema = z
  .array(z.string().trim().max(HEADING_MAX_LENGTH, `Headings can be at most ${HEADING_MAX_LENGTH} characters`))
  .min(1, "The table needs at least one column")
  .max(MAX_COLUMNS, `The table can have at most ${MAX_COLUMNS} columns`);

// Free-text symptoms or observations that are not table rows.
export const symptomNotesSchema = z.array(z.string().trim().min(1, "Note cannot be empty"));

// The table is optional, but a behaviour needs at least one row or one note.
// Fields are optional in the type because zod infers them so without strict mode.
export const hasRowsOrNotes = (data: { simulationRows?: unknown[]; notes?: string[] }) =>
  (data.simulationRows?.length ?? 0) + (data.notes?.length ?? 0) > 0;
export const ROWS_OR_NOTES_ERROR = {
  message: "Add a simulation table row or a note",
  path: ["notes"],
};
