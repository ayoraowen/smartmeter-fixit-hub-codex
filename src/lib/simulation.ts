// Simulation results are stored in a behavior's `symptoms` array as text lines,
// so no backend change is needed. The table has any number of columns and rows:
//
//   Table columns: Scenario | Register | Voltage
//   Table row: Normal load | 1.8.0 | 230
//
// Cells are separated by " | "; a literal "|" or "\" inside a cell is written
// "\|" or "\\". Anything else in `symptoms` is kept as a free-text note.
//
// Behaviours saved before columns became editable used one fixed line per row
// ("Scenario: 1.8.0 Start Readings - …, Remarks …") plus an optional
// "Table headings:" line. Those are still read, as a table with the seven
// original columns, and are rewritten in the format above when saved.

export type SimulationRow = string[];

export const DEFAULT_HEADINGS: string[] = [
  "Scenario",
  "Register",
  "Injected kWh",
  "Start Readings",
  "Stop Readings",
  "Consumption",
  "Remarks",
];

export const HEADING_MAX_LENGTH = 40;
export const MAX_COLUMNS = 20;

export const emptySimulationRow = (columnCount: number = DEFAULT_HEADINGS.length): SimulationRow =>
  Array<string>(Math.max(columnCount, 1)).fill("");

const isBlank = (value: string | undefined) => !value || value.trim() === "";
export const rowHasData = (row: readonly string[]) => row.some((cell) => !isBlank(cell));

const fallbackHeading = (index: number) => `Column ${index + 1}`;

// Blank headings are given a name, so every column can be told apart.
export const normalizeHeadings = (headings: readonly string[] | undefined): string[] =>
  (headings ?? []).map((heading, index) => heading?.trim() || fallbackHeading(index));

// ---- Stored format ----------------------------------------------------------

const COLUMNS_LINE = /^\s*Table columns:\s*(.*)$/i;
const ROW_LINE = /^\s*Table row:\s*(.*)$/i;
const LEGACY_HEADINGS_LINE = /^\s*Table headings:\s*(.*)$/i;

const oneLine = (value: string) => value.replace(/\s*\r?\n\s*/g, " ").trim();
const escapeCell = (value: string) => oneLine(value).replace(/\\/g, "\\\\").replace(/\|/g, "\\|");

const splitCells = (text: string): string[] => {
  const cells: string[] = [];
  let cell = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "\\" && (text[i + 1] === "\\" || text[i + 1] === "|")) {
      cell += text[i + 1];
      i++;
    } else if (char === "|") {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += char;
    }
  }
  cells.push(cell.trim());
  return cells;
};

const parseLegacyLine = (line: string): string[] | null => {
  const match = line.match(
    /^(.*?):\s*([0-9]+\.[0-9]+\.[0-9]+)\s*(?:Injected kWh\s*-\s*([^,]+),\s*)?Start Readings\s*-\s*([^,]+),\s*Stop Readings\s*-\s*([^,]+),\s*Consumption\s*-\s*([^,]+),\s*Remarks\s*(.*)$/i,
  );
  if (!match) return null;
  return match.slice(1, 8).map((value) => (value ?? "").trim());
};

const parseLegacyHeadings = (text: string): string[] => {
  const parts = text.split("|");
  return DEFAULT_HEADINGS.map((fallback, index) => parts[index]?.trim() || fallback);
};

const normalizeLine = (line: string) => line.replace(/^[•\-\s]+/, "").trim();

export type SimulationSymptoms = {
  headings: string[];
  rows: SimulationRow[];
  // Anything that is not a table line, kept as written.
  notes: string[];
};

// Makes the table rectangular: every row gets a cell for every column, and a
// row longer than the headings adds columns, so no cell is ever dropped.
const toRectangle = (headings: string[], rows: string[][]) => {
  const width = Math.max(headings.length, 1, ...rows.map((row) => row.length));
  return {
    headings: Array.from({ length: width }, (_, i) => headings[i]?.trim() || fallbackHeading(i)),
    rows: rows.map((row) => Array.from({ length: width }, (_, i) => row[i] ?? "")),
  };
};

// Splits a behavior's symptoms into the table and any free-text notes. An entry
// that mixes table lines and other text keeps its other lines as a note, so
// saving it back loses nothing.
export const splitSimulationSymptoms = (symptoms: string[]): SimulationSymptoms => {
  let headings: string[] | null = null;
  let legacyHeadings: string[] | null = null;
  const rows: string[][] = [];
  const legacyRows: string[][] = [];
  const notes: string[] = [];

  for (const symptom of symptoms) {
    const leftover: string[] = [];
    for (const line of symptom.split(/\r?\n/)) {
      const normalized = normalizeLine(line);
      const columnsMatch = normalized.match(COLUMNS_LINE);
      const rowMatch = normalized.match(ROW_LINE);
      const legacyHeadingsMatch = normalized.match(LEGACY_HEADINGS_LINE);
      const legacyRow = columnsMatch || rowMatch || legacyHeadingsMatch ? null : parseLegacyLine(normalized);

      if (columnsMatch) headings = splitCells(columnsMatch[1]);
      else if (rowMatch) rows.push(splitCells(rowMatch[1]));
      else if (legacyHeadingsMatch) legacyHeadings = parseLegacyHeadings(legacyHeadingsMatch[1]);
      else if (legacyRow) legacyRows.push(legacyRow);
      else leftover.push(line);
    }
    const note = leftover.join("\n").trim();
    if (note) notes.push(note);
  }

  const table = toRectangle(headings ?? legacyHeadings ?? DEFAULT_HEADINGS, [...rows, ...legacyRows]);
  return { ...table, notes };
};

export const joinSimulationSymptoms = ({ headings, rows, notes }: SimulationSymptoms): string[] => {
  const kept = rows.filter(rowHasData);
  const table = toRectangle(normalizeHeadings(headings), kept);
  return [
    ...(kept.length > 0
      ? [
          `Table columns: ${table.headings.map(escapeCell).join(" | ")}`,
          ...table.rows.map((row) => `Table row: ${row.map(escapeCell).join(" | ")}`),
        ]
      : []),
    ...notes.map((note) => note.trim()).filter(Boolean),
  ];
};

// ---- Pasting from a spreadsheet ----------------------------------------------

// Excel and Google Sheets copy cells as tab-separated text, one line per row.
// A cell containing a tab, newline or quote is wrapped in quotes, with inner
// quotes doubled.
export const parseClipboardTable = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
    } else if (char === '"' && cell === "") {
      inQuotes = true;
    } else if (char === "\t") {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
};

const normalizeHeader = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/s$/, "");

const NUMBERLIKE = /^-?[0-9][0-9.,]*$/;
const cleanCell = (value: string) => value.replace(/\s*\r?\n\s*/g, " ").trim();

export type PasteResult = {
  headings: string[];
  rows: SimulationRow[];
  rowCount: number;
  // How the pasted cells were placed.
  mode: "new-headings" | "by-heading" | "by-position";
  addedColumns: number;
};

// Places pasted cells in the table. Three cases:
//  - the table is empty and the pasted block starts with a row of text above
//    rows containing numbers: that first row becomes the column headings;
//  - the first pasted row matches existing headings: columns are matched by
//    name in any order, and headings that are new are added as columns;
//  - otherwise cells fill the table from the selected cell, like Excel, and
//    columns are added if the block is wider than the table.
// Returns null when there is nothing to paste.
export const applyPastedTable = (
  table: { headings: readonly string[]; rows: readonly (readonly string[])[] },
  cells: string[][],
  startRow: number,
  startColumn: number,
): PasteResult | null => {
  const nonBlank = cells.filter((row) => row.some((cell) => !isBlank(cell)));
  if (nonBlank.length === 0) return null;

  const original = toRectangle(normalizeHeadings(table.headings), table.rows.map((row) => [...row]));
  let headings = original.headings;
  let rows = original.rows;
  const startWidth = headings.length;

  const addColumn = (name: string): number => {
    headings = [...headings, name];
    rows = rows.map((row) => [...row, ""]);
    return headings.length - 1;
  };
  const ensureRow = (index: number) => {
    while (rows.length <= index) rows = [...rows, emptySimulationRow(headings.length)];
  };

  const [first, ...rest] = nonBlank;
  const byName = new Map<string, number>();
  headings.forEach((heading, index) => {
    const key = normalizeHeader(heading);
    if (key && !byName.has(key)) byName.set(key, index);
  });
  const matches = first.map((cell) => byName.get(normalizeHeader(cell)));
  const filledCount = first.filter((cell) => !isBlank(cell)).length;
  const matchCount = matches.filter((match) => match !== undefined).length;
  const matchesHeadings = matchCount >= 2 || (matchCount >= 1 && matchCount === filledCount);

  const tableIsEmpty = rows.every((row) => !rowHasData(row));
  const startsWithNewHeadings =
    !matchesHeadings &&
    tableIsEmpty &&
    startRow === 0 &&
    startColumn === 0 &&
    first.every((cell) => isBlank(cell) || !NUMBERLIKE.test(cell.trim())) &&
    rest.some((row) => row.some((cell) => NUMBERLIKE.test(cell.trim())));

  let mode: PasteResult["mode"];
  let rowCount: number;

  if (startsWithNewHeadings) {
    mode = "new-headings";
    headings = first.slice(0, MAX_COLUMNS).map((cell, index) => cleanCell(cell) || fallbackHeading(index));
    rows = rest.map((row) => headings.map((_, index) => cleanCell(row[index] ?? "")));
    rowCount = rest.length;
  } else if (matchesHeadings) {
    mode = "by-heading";
    const destinations = first.map((cell, index) => {
      if (matches[index] !== undefined) return matches[index];
      if (isBlank(cell) || headings.length >= MAX_COLUMNS) return undefined;
      return addColumn(cleanCell(cell));
    });
    rest.forEach((row, offset) => {
      ensureRow(startRow + offset);
      const next = [...rows[startRow + offset]];
      destinations.forEach((destination, index) => {
        if (destination !== undefined) next[destination] = cleanCell(row[index] ?? "");
      });
      rows = rows.map((existing, i) => (i === startRow + offset ? next : existing));
    });
    rowCount = rest.length;
  } else {
    mode = "by-position";
    const widest = Math.max(...nonBlank.map((row) => row.length));
    while (headings.length < Math.min(startColumn + widest, MAX_COLUMNS)) addColumn(fallbackHeading(headings.length));
    nonBlank.forEach((row, offset) => {
      ensureRow(startRow + offset);
      const next = [...rows[startRow + offset]];
      row.forEach((cell, index) => {
        if (startColumn + index < headings.length) next[startColumn + index] = cleanCell(cell);
      });
      rows = rows.map((existing, i) => (i === startRow + offset ? next : existing));
    });
    rowCount = nonBlank.length;
  }

  return { headings, rows, rowCount, mode, addedColumns: Math.max(headings.length - startWidth, 0) };
};
