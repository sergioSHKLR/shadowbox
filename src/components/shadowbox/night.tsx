import { useEffect, useRef, useState } from "react";

function horn() {
  const ctx = new AudioContext();
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.12, now + 0.4);
  master.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);
  master.connect(ctx.destination);
  [82, 123].forEach((freq) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(master);
    osc.start(now);
    osc.stop(now + 2.8);
  });
  window.setTimeout(() => void ctx.close(), 3200);
}

const FACES = [0, 90, 180, 270];

export function Night() {
  const [sound, setSound] = useState(false);
  const [fog, setFog] = useState(false);
  const soundRef = useRef(false);
  soundRef.current = sound;
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer = 0;
    const cycle = () => {
      setFog(true);
      if (soundRef.current) horn();
      window.setTimeout(() => setFog(false), 14000);
      timer = window.setTimeout(cycle, 70000 + Math.random() * 40000);
    };
    timer = window.setTimeout(cycle, 24000);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <>
      <div className={`night${fog ? " fog-in" : ""}`} aria-hidden="true">
        <div className="nebula" />
        <div className="stars" />
        <div className="fog" />
        <div className="lighthouse">
          <div className="head">
            {FACES.map((y) => (
              <div key={y} className="head-face" style={{ ["--y" as string]: `${y}deg` }} />
            ))}
          </div>
          <div className="tower" />
        </div>
        <p className="hark">Hark.</p>
      </div>
      <button type="button" className={sound ? "footer-link on" : "footer-link"} aria-pressed={sound} onClick={() => setSound((on) => !on)}>
        {sound ? "Horn on" : "Horn off"}
      </button>
    </>
  );
}
