import * as z from "zod";
import { HEADING_MAX_LENGTH, REGISTER_PATTERN, SimulationRow } from "@/lib/simulation";

// Validation for the simulation results table, shared by the create form and
// the edit mode of the detail page. Messages do not name the column, because
// the editor already shows each error next to the column's current heading.

// Commas separate the fields when a row is stored as text, so values between
// the register and the remarks cannot contain them.
const withoutCommas = z.string().trim().refine((value) => !value.includes(","), "Cannot contain commas");
const requiredWithoutCommas = withoutCommas.refine((value) => value.length > 0, "Required");

// Cast because, without strict mode, zod infers every field as optional; the
// fields below are all strings, so the output is always a full SimulationRow.
export const simulationRowSchema = z.object({
  scenario: z.string().trim().min(1, "Required"),
  register: z.string().trim().regex(REGISTER_PATTERN, "Use a register code such as 1.8.0"),
  injectedKwh: withoutCommas,
  startReadings: requiredWithoutCommas,
  stopReadings: requiredWithoutCommas,
  consumption: requiredWithoutCommas,
  remarks: z.string().trim(),
}) as unknown as z.ZodType<SimulationRow>;

export const simulationHeadingsSchema = z.array(
  z.string().trim().max(HEADING_MAX_LENGTH, `Headings can be at most ${HEADING_MAX_LENGTH} characters`),
);

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
