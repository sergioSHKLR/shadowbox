const DEVICES: Record<string, string[]> = {
  "frank-cable": ["esws"],
  jcse: ["exw", "jcse-device"],
};
const TOUR_AWARDS: Record<string, string[]> = {
  navhosp: ["NC"],
};
const TOUR_NOTE: Record<string, { nec?: string; workcenter?: string }> = {
  navhosp: { nec: "95PT \u00b7 Command Fitness Leader", workcenter: "CFL Office" },
};