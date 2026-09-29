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
