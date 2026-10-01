const COMMANDS = ["ncts", "frank-cable", "eodmu5", "sercc", "jcse", "navhosp"];
const PARTNERS: { id: string; affiliation: string; patch?: string; name?: string; openId?: string }[] = [
  { id: "tortuga", affiliation: "TAD" },
  { id: "rtn", affiliation: "Host \u00b7 Cobra Gold \u00d72", patch: "RTN", name: "Royal Thai Navy", openId: "eodmu5" },
  { id: "auscdt", affiliation: "Host \u00b7 Talisman Saber \u00d72", patch: "AUSCDT", name: "Australian Clearance Diving Team", openId: "eodmu5" },
  { id: "troy", affiliation: "Deployment partner" },
  { id: "ia-army", affiliation: "Deployment" },
  { id: "cjsotf", affiliation: "Two deployments" },
];