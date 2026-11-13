export const sections = [
  {
    id: "overview",
    label: "MISSION OVERVIEW",
    subtitle: "Explore the spacecraft",
  },
  {
    id: "deployment",
    label: "DEPLOYMENT",
    subtitle: "Landing and deployment",
  },
  {
    id: "science",
    label: "SCIENCE",
    subtitle: "Scientific instruments",
  },
];

export const hotspots = [
  {
    id: "solar-panels",
    label: "Solar Panels",
    title: "Power Generation System",
    description:
      "The solar panels collect sunlight and convert it into electrical energy to power the spacecraft.",
    facts: [
      "Two circular solar arrays",
      "Designed for the Martian environment",
      "Provides power to the lander",
    ],
    position: [-1.6, 0.5, 0],
  },
  {
    id: "robotic-arm",
    label: "Robotic Arm",
    title: "Instrument Deployment Arm",
    description:
      "The robotic arm was used to place scientific instruments directly onto the Martian surface.",
    facts: [
      "Approximately 2.4 meters long",
      "Equipped with a camera",
      "Used for instrument placement",
    ],
    position: [0.8, 0.3, 0.8],
  },
  {
    id: "seismometer",
    label: "Seismometer",
    title: "SEIS Instrument",
    description:
      "The Seismic Experiment for Interior Structure measured marsquakes to help scientists understand the interior of Mars.",
    facts: [
      "Measures seismic activity",
      "Studies the Martian interior",
      "Deployed onto the surface",
    ],
    position: [0.2, -0.2, 0.6],
  },
  {
    id: "weather-sensor",
    label: "Weather Sensors",
    title: "Weather Monitoring System",
    description:
      "Environmental sensors monitored temperature, wind and atmospheric pressure on Mars.",
    facts: [
      "Measures air temperature",
      "Measures wind conditions",
      "Monitors atmospheric pressure",
    ],
    position: [-0.4, 0.7, -0.7],
  },
];
