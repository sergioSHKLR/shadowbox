import { useEffect, useState } from "react";
import { instances, operations, units, type AwardInstanceView } from "@/lib/shadowbox/model";
import { parseInstanceFields, saveInstance, subscribeInstanceEdits } from "@/lib/shadowbox/instance-edits";

const UNIT_IDS = units.map((unit) => unit.id);
const OPERATION_IDS = operations.map((operation) => operation.id);

export function useInstanceEdits() {
  const [tick, setTick] = useState(0);
  useEffect(() => subscribeInstanceEdits(() => setTick((n) => n + 1)), []);
  return tick;
}

export function InstanceEntry({ row }: { row: AwardInstanceView }) {
  const [year, setYear] = useState(row.year == null ? "" : String(row.year));
  const [unitId, setUnitId] = useState(row.unitId ?? "");
  const [operationId, setOperationId] = useState(row.operationId ?? "");
  const [note, setNote] = useState(row.note ?? "");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setYear(row.year == null ? "" : String(row.year));
    setUnitId(row.unitId ?? "");
    setOperationId(row.operationId ?? "");
    setNote(row.note ?? "");
  }, [row.id, row.year, row.unitId, row.operationId, row.note]);

  const save = async () => {
    const patch = parseInstanceFields({ year, unitId, operationId, note }, UNIT_IDS, OPERATION_IDS);
    if (!patch) {
      setStatus("Enter a four-digit year from 1990 to 2030, or leave the year blank.");
      return;
    }
    setBusy(true);
    setStatus("");
    try {
      const where = await saveInstance(row.id, patch, instances);
      setStatus(where === "file" ? "Saved to src/data/award-instances.json" : "Saved award-instances.json to Downloads");
    } catch {
      setStatus("This award did not save.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <fieldset className="instance-fields">
      <legend>{row.title}</legend>
      {row.detail ? <p className="instance-summary">{row.detail}</p> : null}
      <form
        className="instance-entry"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <label>
          Year
          <input value={year} onChange={(event) => setYear(event.target.value)} inputMode="numeric" maxLength={4} autoComplete="off" />
        </label>
        <label>
          Command
          <select value={unitId} onChange={(event) => setUnitId(event.target.value)}>
            <option value="">Not entered</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>{unit.abbreviation} — {unit.name}</option>
            ))}
          </select>
        </label>
        <label>
          Operation
          <select value={operationId} onChange={(event) => setOperationId(event.target.value)}>
            <option value="">Not entered</option>
            {operations.map((operation) => (
              <option key={operation.id} value={operation.id}>{operation.phase}</option>
            ))}
          </select>
        </label>
        <label>
          Note
          <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={2} maxLength={2000} placeholder="What this award was for" />
        </label>
        <button type="submit" className="nav-btn on" disabled={busy}>Save</button>
        {status ? <p className="quiet">{status}</p> : null}
      </form>
    </fieldset>
  );
}
