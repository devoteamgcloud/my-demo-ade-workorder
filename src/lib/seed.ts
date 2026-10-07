import type { TaskCard, WorkOrder } from "./types";

type Card = [id: string, title: string, ata: string, status: TaskCard["status"]];

function cards(...rows: Card[]): TaskCard[] {
  return rows.map(([id, title, ata, status]) => ({ id, title, ata, status }));
}

const active: WorkOrder[] = [
  {
    id: "WO-1042",
    tail: "9M-AQA",
    aircraftType: "A320-216",
    station: "KUL",
    title: "Nose landing gear shimmy report",
    openedOn: "2026-10-05",
    status: "IN_PROGRESS",
    closedAt: null,
    taskCards: cards(
      ["TC-1", "Inspect NLG torque links", "32", "DONE"],
      ["TC-2", "Check NLG tyre pressure", "32", "DONE"],
      ["TC-3", "Replace shimmy damper", "32", "OPEN"],
      ["TC-4", "Functional test steering", "32", "OPEN"],
    ),
  },
  {
    id: "WO-1041",
    tail: "9M-AQB",
    aircraftType: "A320-216",
    station: "KUL",
    title: "Cabin PA intermittent",
    openedOn: "2026-10-04",
    status: "IN_PROGRESS",
    closedAt: null,
    taskCards: cards(
      ["TC-1", "Troubleshoot PA amplifier", "23", "IN_PROGRESS"],
      ["TC-2", "Replace handset at door 1L", "23", "OPEN"],
    ),
  },
  {
    id: "WO-1040",
    tail: "9M-RAF",
    aircraftType: "A321-251NX",
    station: "PEN",
    title: "A-check package",
    openedOn: "2026-10-03",
    status: "OPEN",
    closedAt: null,
    taskCards: cards(
      ["TC-1", "Engine oil level check", "79", "OPEN"],
      ["TC-2", "Brake wear pin inspection", "32", "OPEN"],
      ["TC-3", "Emergency lighting test", "33", "OPEN"],
    ),
  },
  {
    id: "WO-1039",
    tail: "9M-AQA",
    aircraftType: "A320-216",
    station: "KUL",
    title: "Lavatory smoke detector fault",
    openedOn: "2026-10-01",
    status: "IN_PROGRESS",
    closedAt: null,
    taskCards: cards(
      ["TC-1", "Replace smoke detector aft lav", "26", "DONE"],
      ["TC-2", "Ops test smoke detection", "26", "DEFERRED"],
    ),
  },
  {
    id: "WO-1038",
    tail: "9M-RAG",
    aircraftType: "A321-251NX",
    station: "BKI",
    title: "Bird strike inspection",
    openedOn: "2026-09-29",
    status: "IN_PROGRESS",
    closedAt: null,
    taskCards: cards(
      ["TC-1", "Inspect radome", "53", "DONE"],
      ["TC-2", "Borescope engine 1", "72", "DONE"],
    ),
  },
  {
    id: "WO-1037",
    tail: "9M-AGU",
    aircraftType: "A320-214",
    station: "KCH",
    title: "Fuel quantity indication",
    openedOn: "2026-09-27",
    status: "IN_PROGRESS",
    closedAt: null,
    taskCards: cards(
      ["TC-1", "Check FQI probe wiring", "28", "DONE"],
      ["TC-2", "Recalibrate FQI computer", "28", "IN_PROGRESS"],
    ),
  },
];

const history: [string, string, string, string, string, string, string][] = [
  ["WO-1036", "9M-AQB", "A320-216", "KUL", "Wheel change MLG #2", "2026-09-25", "32"],
  ["WO-1035", "9M-RAF", "A321-251NX", "PEN", "Galley oven inop", "2026-09-24", "25"],
  ["WO-1034", "9M-AGU", "A320-214", "KCH", "Pack 2 overheat message", "2026-09-22", "21"],
  ["WO-1033", "9M-AQA", "A320-216", "KUL", "Cockpit window heat fault", "2026-09-20", "30"],
  ["WO-1032", "9M-RAG", "A321-251NX", "BKI", "Seat 14C recline broken", "2026-09-19", "25"],
  ["WO-1031", "9M-AQC", "A320-216", "KUL", "Hydraulic leak green system", "2026-09-17", "29"],
  ["WO-1030", "9M-AQB", "A320-216", "KUL", "APU start fault", "2026-09-15", "49"],
  ["WO-1029", "9M-AGV", "A320-214", "JHB", "Cargo door seal damage", "2026-09-12", "52"],
  ["WO-1028", "9M-AQC", "A320-216", "KUL", "Landing light replacement", "2026-09-10", "33"],
  ["WO-1027", "9M-RAF", "A321-251NX", "PEN", "Engine 2 oil filter delta P", "2026-09-08", "79"],
  ["WO-1026", "9M-AGV", "A320-214", "JHB", "Lav water heater inop", "2026-09-05", "38"],
];

const closed: WorkOrder[] = history.map(
  ([id, tail, aircraftType, station, title, openedOn, ata]) => ({
    id,
    tail,
    aircraftType,
    station,
    title,
    openedOn,
    status: "CLOSED",
    closedAt: `${openedOn}T16:30:00+08:00`,
    taskCards: cards(["TC-1", title, ata, "DONE"]),
  }),
);

export const SEED_WORK_ORDERS: WorkOrder[] = [...active, ...closed];
