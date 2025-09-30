export interface Meter {
  id: number;
  brand: string;
  model: string;
  type: string;
  features: string[];
  commonIssues: number;
  guides: number;
}

const defaultMeterData: Meter[] = [
  {
    id: 1,
    brand: "Schneider Electric",
    model: "ION 7550",
    type: "Smart Grid Meter",
    features: ["3-Phase", "CT/PT", "Ethernet"],
    commonIssues: 12,
    guides: 8
  },
  {
    id: 2,
    brand: "Siemens",
    model: "Sentron PAC3200",
    type: "Power Quality Meter",
    features: ["Modbus", "Display", "Alarming"],
    commonIssues: 8,
    guides: 15
  },
  {
    id: 3,
    brand: "GE",
    model: "kV2c",
    type: "Revenue Meter",
    features: ["AMI", "TOU", "Load Profile"],
    commonIssues: 15,
    guides: 22
  },
  {
    id: 4,
    brand: "Landis+Gyr",
    model: "E350",
    type: "Smart Residential",
    features: ["Zigbee", "Remote Disconnect", "Prepay"],
    commonIssues: 6,
    guides: 12
  },
  {
    id: 5,
    brand: "Itron",
    model: "OpenWay CENTRON",
    type: "AMI Meter",
    features: ["RF Mesh", "Time-of-Use", "Outage Detection"],
    commonIssues: 9,
    guides: 18
  },
  {
    id: 6,
    brand: "Schneider Electric",
    model: "PowerLogic PM8000",
    type: "Multi-function Meter",
    features: ["Ethernet", "SOE", "Harmonics"],
    commonIssues: 11,
    guides: 14
  }
];

// Get all meters including custom ones from localStorage
export const getAllMeters = (): Meter[] => {
  const customMeters = JSON.parse(localStorage.getItem("customMeters") || "[]");
  return [...defaultMeterData, ...customMeters];
};

export const meterData = getAllMeters();

export const getMeterBrands = () => {
  const allMeters = getAllMeters();
  return Array.from(new Set(allMeters.map(meter => meter.brand)));
};

export const getMeterTypes = () => {
  const allMeters = getAllMeters();
  return Array.from(new Set(allMeters.map(meter => meter.type)));
};
