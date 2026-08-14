"use client";

import { useEffect, useRef, useState } from "react";

type AudioNodes = {
  context: AudioContext;
  master: GainNode;
  rain: AudioBufferSourceNode;
  hum: OscillatorNode;
  pulse: OscillatorNode;
  interval: number;
};

function createNoiseBuffer(context: AudioContext) {
  const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * 0.55;
  }

  return buffer;
}

export default function NoirSoundscape() {
  const [enabled, setEnabled] = useState(false);
  const [level, setLevel] = useState(0.34);
  const nodes = useRef<AudioNodes | null>(null);

  const stop = () => {
    const active = nodes.current;
    if (!active) return;

    window.clearInterval(active.interval);
    active.master.gain.cancelScheduledValues(active.context.currentTime);
    active.master.gain.setTargetAtTime(0, active.context.currentTime, 0.12);

    window.setTimeout(() => {
      try { active.rain.stop(); } catch {}
      try { active.hum.stop(); } catch {}
      try { active.pulse.stop(); } catch {}
      void active.context.close();
    }, 260);

    nodes.current = null;
    setEnabled(false);
  };

  const start = async () => {
    if (nodes.current) {
      stop();
      return;
    }

    const context = new AudioContext();
    await context.resume();

    const master = context.createGain();
    master.gain.value = 0;
    master.connect(context.destination);

    const rain = context.createBufferSource();
    rain.buffer = createNoiseBuffer(context);
    rain.loop = true;

    const rainFilter = context.createBiquadFilter();
    rainFilter.type = "bandpass";
    rainFilter.frequency.value = 1200;
    rainFilter.Q.value = 0.55;

    const rainGain = context.createGain();
    rainGain.gain.value = 0.12;
    rain.connect(rainFilter).connect(rainGain).connect(master);

    const hum = context.createOscillator();
    hum.type = "sine";
    hum.frequency.value = 46;
    const humGain = context.createGain();
    humGain.gain.value = 0.08;
    hum.connect(humGain).connect(master);

    const pulse = context.createOscillator();
    pulse.type = "triangle";
    pulse.frequency.value = 92;
    const pulseGain = context.createGain();
    pulseGain.gain.value = 0.012;
    pulse.connect(pulseGain).connect(master);

    rain.start();
    hum.start();
    pulse.start();
    master.gain.setTargetAtTime(level, context.currentTime, 0.6);

    const interval = window.setInterval(() => {
      const now = context.currentTime;
      const next = 82 + Math.random() * 34;
      pulse.frequency.setTargetAtTime(next, now, 2.4);
      rainFilter.frequency.setTargetAtTime(850 + Math.random() * 900, now, 4.5);
      rainGain.gain.setTargetAtTime(0.08 + Math.random() * 0.08, now, 5.5);
    }, 5200);

    nodes.current = { context, master, rain, hum, pulse, interval };
    setEnabled(true);
  };

  useEffect(() => {
    const active = nodes.current;
    if (active) active.master.gain.setTargetAtTime(level, active.context.currentTime, 0.2);
  }, [level]);

  useEffect(() => () => {
    const active = nodes.current;
    if (!active) return;
    window.clearInterval(active.interval);
    try { active.rain.stop(); } catch {}
    try { active.hum.stop(); } catch {}
    try { active.pulse.stop(); } catch {}
    void active.context.close();
  }, []);

  return (
    <div className={`noir-sound${enabled ? " is-on" : ""}`}>
      <button type="button" className="noir-sound-toggle" onClick={start} aria-pressed={enabled}>
        <span className="noir-sound-led" aria-hidden="true" />
        <span><small>NIGHT SIGNAL</small>{enabled ? "ATMOSPHERE ON" : "ATMOSPHERE OFF"}</span>
        <b>{enabled ? "Ⅱ" : "▶"}</b>
      </button>
      <label className="noir-sound-level">
        <span>VOL</span>
        <input type="range" min="0.08" max="0.65" step="0.01" value={level} onChange={(event) => setLevel(Number(event.target.value))} aria-label="Громкость атмосферы" />
      </label>
    </div>
  );
}
