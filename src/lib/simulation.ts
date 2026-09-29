// Simulation results are stored in a behavior's `symptoms` array as one line of
// text per table row. formatSimulationRow writes that line and parseSimulationLine
// reads it back, so the create form and the detail page must both use this file.

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

export const parseSimulationSymptomRows = (symptoms: string[]): SimulationRow[] => {
  const normalizedLines = symptoms
    .flatMap((symptom) => symptom.split("\n"))
    .map((line) => line.replace(/^[•\-\s]+/, "").trim())
    .filter((line) => line.length > 0);

  return normalizedLines.reduce<SimulationRow[]>((rows, line) => {
    const parsedRow = parseSimulationLine(line);
    if (parsedRow) rows.push(parsedRow);
    return rows;
  }, []);
};

export const getUnparsedSymptomEntries = (symptoms: string[]): string[] => {
  return symptoms.filter((symptom) => {
    const normalizedLines = symptom
      .split("\n")
      .map((line) => line.replace(/^[•\-\s]+/, "").trim())
      .filter((line) => line.length > 0);

    return !normalizedLines.some((line) => parseSimulationLine(line));
  });
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

const COLUMN_BY_HEADER = new Map(
  SIMULATION_COLUMNS.map((column) => [normalizeHeader(column.label), column.key]),
);

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
export const mapPastedTable = (cells: string[][], startColumn: number): PastedTable => {
  const nonBlank = cells.filter((row) => row.some((cell) => cell.trim() !== ""));
  if (nonBlank.length === 0) {
    return { rows: [], usedHeader: false, matchedColumns: [], ignoredColumns: [] };
  }

  const [first, ...rest] = nonBlank;
  const headerKeys = first.map((cell) => COLUMN_BY_HEADER.get(normalizeHeader(cell)));
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
    SIMULATION_COLUMNS.find((column) => column.key === key)?.label ?? key;

  return {
    rows,
    usedHeader,
    matchedColumns: keys.filter((key): key is keyof SimulationRow => !!key).map(labelFor),
    ignoredColumns: usedHeader
      ? first.filter((cell, index) => !headerKeys[index] && cell.trim() !== "").map((cell) => cell.trim())
      : [],
  };
};
