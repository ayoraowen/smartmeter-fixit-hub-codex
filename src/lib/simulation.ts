// Simulation results are stored in a behavior's `symptoms` array as one line of
// text per table row. formatSimulationRow writes that line and parseSimulationLine
// reads it back, so the create form and the detail page must both use this file.
//
// The row lines always use the fixed keywords below ("Start Readings - …"), so
// renaming a column never changes how rows are stored. Headings a person has
// renamed are stored separately, as one "Table headings:" line.

export type SimulationRow = {
  scenario: string;
  register: string;
  injectedKwh: string;
  startReadings: string;
  stopReadings: string;
  consumption: string;
  remarks: string;
};

export const SIMULATION_COLUMNS: { key: keyof SimulationRow; label: string }[] = [
  { key: "scenario", label: "Scenario" },
  { key: "register", label: "Register" },
  { key: "injectedKwh", label: "Injected kWh" },
  { key: "startReadings", label: "Start Readings" },
  { key: "stopReadings", label: "Stop Readings" },
  { key: "consumption", label: "Consumption" },
  { key: "remarks", label: "Remarks" },
];

export const emptySimulationRow = (): SimulationRow => ({
  scenario: "",
  register: "",
  injectedKwh: "",
  startReadings: "",
  stopReadings: "",
  consumption: "",
  remarks: "",
});

// ---- Column headings ---------------------------------------------------------

export const DEFAULT_HEADINGS = SIMULATION_COLUMNS.map((column) => column.label);

const HEADINGS_PREFIX = "Table headings:";
const HEADINGS_LINE = /^\s*Table headings:\s*(.*)$/i;
export const HEADING_MAX_LENGTH = 40;

export const isHeadingsLine = (line: string) => HEADINGS_LINE.test(line);

// Blank or missing headings fall back to the default for that column.
export const normalizeHeadings = (headings: readonly string[] | undefined): string[] =>
  DEFAULT_HEADINGS.map((fallback, index) => headings?.[index]?.trim() || fallback);

const parseHeadingsLine = (line: string): string[] | null => {
  const match = line.match(HEADINGS_LINE);
  return match ? normalizeHeadings(match[1].split("|")) : null;
};

// Returns null when the headings are the defaults, so nothing extra is stored.
export const formatHeadingsLine = (headings: readonly string[]): string | null => {
  const normalized = normalizeHeadings(headings).map((heading) =>
    heading.replace(/[|\r\n]+/g, " ").trim(),
  );
  const isDefault = normalized.every((heading, index) => heading === DEFAULT_HEADINGS[index]);
  return isDefault ? null : `${HEADINGS_PREFIX} ${normalized.join(" | ")}`;
};

// Register codes are three dot-separated numbers, e.g. 1.8.0
export const REGISTER_PATTERN = /^[0-9]+\.[0-9]+\.[0-9]+$/;

export const parseSimulationLine = (line: string): SimulationRow | null => {
  const rowMatch = line.match(
    /^(.*?):\s*([0-9]+\.[0-9]+\.[0-9]+)\s*(?:Injected kWh\s*-\s*([^,]+),\s*)?Start Readings\s*-\s*([^,]+),\s*Stop Readings\s*-\s*([^,]+),\s*Consumption\s*-\s*([^,]+),\s*Remarks\s*(.*)$/i,
  );

  if (!rowMatch) return null;

  const [, scenario, register, injectedKwh, startReadings, stopReadings, consumption, remarks] = rowMatch;
  return {
    scenario: scenario.trim(),
    register: register.trim(),
    injectedKwh: injectedKwh?.trim() || "",
    startReadings: startReadings.trim(),
    stopReadings: stopReadings.trim(),
    consumption: consumption.trim(),
    remarks: remarks.trim(),
  };
};

const oneLine = (value: string) => value.replace(/\s*\r?\n\s*/g, " ").trim();

export const formatSimulationRow = (row: SimulationRow): string => {
  const injected = oneLine(row.injectedKwh);
  return [
    `${oneLine(row.scenario)}: ${oneLine(row.register)} `,
    injected ? `Injected kWh - ${injected}, ` : "",
    `Start Readings - ${oneLine(row.startReadings)}, `,
    `Stop Readings - ${oneLine(row.stopReadings)}, `,
    `Consumption - ${oneLine(row.consumption)}, `,
    `Remarks ${oneLine(row.remarks)}`,
  ].join("").trimEnd();
};

const normalizeLine = (line: string) => line.replace(/^[•\-\s]+/, "").trim();

export type SimulationSymptoms = {
  headings: string[];
  rows: SimulationRow[];
  // Anything that is not a table row or the headings line, kept as written.
  notes: string[];
};

// Splits a behavior's symptoms into the table and any free-text notes. An entry
// that mixes table rows and other text keeps its other lines as a note, so
// saving it back loses nothing.
export const splitSimulationSymptoms = (symptoms: string[]): SimulationSymptoms => {
  let headings = [...DEFAULT_HEADINGS];
  const rows: SimulationRow[] = [];
  const notes: string[] = [];

  for (const symptom of symptoms) {
    const leftover: string[] = [];
    for (const line of symptom.split(/\r?\n/)) {
      const normalized = normalizeLine(line);
      const parsedHeadings = parseHeadingsLine(normalized);
      const parsedRow = parsedHeadings ? null : parseSimulationLine(normalized);
      if (parsedHeadings) headings = parsedHeadings;
      else if (parsedRow) rows.push(parsedRow);
      else leftover.push(line);
    }
    const note = leftover.join("\n").trim();
    if (note) notes.push(note);
  }

  return { headings, rows, notes };
};

export const joinSimulationSymptoms = ({ headings, rows, notes }: SimulationSymptoms): string[] => {
  const headingsLine = rows.length > 0 ? formatHeadingsLine(headings) : null;
  return [
    ...(headingsLine ? [headingsLine] : []),
    ...rows.map(formatSimulationRow),
    ...notes.map((note) => note.trim()).filter(Boolean),
  ];
};

export const parseSimulationSymptomRows = (symptoms: string[]): SimulationRow[] =>
  splitSimulationSymptoms(symptoms).rows;

export const getUnparsedSymptomEntries = (symptoms: string[]): string[] =>
  splitSimulationSymptoms(symptoms).notes;

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

// Pasted headings match either the default name or the name the column has been
// given in this table.
const columnsByHeader = (headings: readonly string[]) => {
  const map = new Map<string, keyof SimulationRow>();
  SIMULATION_COLUMNS.forEach((column, index) => {
    map.set(normalizeHeader(column.label), column.key);
    const custom = headings[index];
    if (custom) map.set(normalizeHeader(custom), column.key);
  });
  return map;
};

const NUMERIC_COLUMNS: (keyof SimulationRow)[] = [
  "injectedKwh",
  "startReadings",
  "stopReadings",
  "consumption",
];

// Spreadsheets copy numbers as displayed, e.g. 1,200.5. Remove the thousands
// separators; anything else with a comma is left for validation to flag.
const THOUSANDS_SEPARATED = /^-?\d{1,3}(,\d{3})+(\.\d+)?$/;
const cleanCell = (key: keyof SimulationRow, value: string) => {
  const trimmed = value.replace(/\s*\r?\n\s*/g, " ").trim();
  return NUMERIC_COLUMNS.includes(key) && THOUSANDS_SEPARATED.test(trimmed)
    ? trimmed.replace(/,/g, "")
    : trimmed;
};

export type PastedTable = {
  rows: Partial<SimulationRow>[];
  usedHeader: boolean;
  matchedColumns: string[];
  ignoredColumns: string[];
};

// With a header row, columns are matched by name in any order and unknown ones
// are ignored. Without one, cells fill the table from startColumn, like Excel.
export const mapPastedTable = (
  cells: string[][],
  startColumn: number,
  headings: readonly string[] = DEFAULT_HEADINGS,
): PastedTable => {
  const byHeader = columnsByHeader(headings);
  const nonBlank = cells.filter((row) => row.some((cell) => cell.trim() !== ""));
  if (nonBlank.length === 0) {
    return { rows: [], usedHeader: false, matchedColumns: [], ignoredColumns: [] };
  }

  const [first, ...rest] = nonBlank;
  const headerKeys = first.map((cell) => byHeader.get(normalizeHeader(cell)));
  const filledHeaderCells = first.filter((cell) => cell.trim() !== "").length;
  const matchCount = headerKeys.filter(Boolean).length;
  const usedHeader = matchCount >= 2 || (matchCount >= 1 && matchCount === filledHeaderCells);

  const keys: (keyof SimulationRow | undefined)[] = usedHeader
    ? headerKeys
    : first.map((_, index) => SIMULATION_COLUMNS[startColumn + index]?.key);
  const dataRows = usedHeader ? rest : nonBlank;

  const rows = dataRows.map((row) => {
    const mapped: Partial<SimulationRow> = {};
    keys.forEach((key, index) => {
      if (key) mapped[key] = cleanCell(key, row[index] ?? "");
    });
    return mapped;
  });

  const labelFor = (key: keyof SimulationRow) =>
    headings[SIMULATION_COLUMNS.findIndex((column) => column.key === key)] ?? key;

  return {
    rows,
    usedHeader,
    matchedColumns: keys.filter((key): key is keyof SimulationRow => !!key).map(labelFor),
    ignoredColumns: usedHeader
      ? first.filter((cell, index) => !headerKeys[index] && cell.trim() !== "").map((cell) => cell.trim())
      : [],
  };
};
