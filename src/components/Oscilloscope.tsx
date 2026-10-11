import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  ComponentMetadata,
  InstantaneousState,
  MetricSummary,
  SimulationDataset,
  SimulationParams,
} from '../types/simulation';

interface OscilloscopeProps {
  params: SimulationParams;
  dataset: SimulationDataset;
  currentState: InstantaneousState;
  probedMetadata: ComponentMetadata;
}

export type ScopeViewMode = 'overlay' | 'stacked' | 'fft';

export const Oscilloscope: React.FC<OscilloscopeProps> = ({
  params,
  dataset,
  currentState,
  probedMetadata,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewMode, setViewMode] = useState<ScopeViewMode>('overlay');
  const [ch1Visible, setCh1Visible] = useState(true);
  const [ch2Visible, setCh2Visible] = useState(true);
  const [ch3Visible, setCh3Visible] = useState(true);
  const [vScaleIndex, setVScaleIndex] = useState<number>(0); // 0 = Auto, 1 = 50V, 2 = 100V, 3 = 200V
  const [hoverData, setHoverData] = useState<{
    x: number;
    y: number;
    timeMs: number;
    angleDeg: number;
    ch1Val: number;
    ch2Val: number;
    ch3Val: number;
  } | null>(null);

  const { samples, metrics } = dataset;

  // Calculate voltage limits for scaling
  const maxVoltageMagnitude = useMemo(() => {
    let maxV = 100;
    for (let i = 0; i < samples.length; i++) {
      const s = samples[i];
      maxV = Math.max(
        maxV,
        Math.abs(s.probedVoltage),
        Math.abs(s.vSource),
        Math.abs(s.vPhaseA),
        Math.abs(s.vLoad)
      );
    }
    return Math.ceil(maxV / 50) * 50;
  }, [samples]);

  // Handle Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Dark oscilloscope screen background with phosphor vignette
    ctx.fillStyle = '#060B12';
    ctx.fillRect(0, 0, width, height);

    // Reticle & Graticule Dimensions (10 divisions wide, 8 divisions high)
    const paddingX = 40;
    const paddingY = 24;
    const plotW = width - paddingX * 2;
    const plotH = height - paddingY * 2;

    const numDivX = 10;
    const numDivY = 8;
    const divW = plotW / numDivX;
    const divH = plotH / numDivY;

    // Draw Graticule Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(30, 58, 88, 0.45)';

    for (let i = 0; i <= numDivX; i++) {
      const gx = paddingX + i * divW;
      ctx.beginPath();
      ctx.moveTo(gx, paddingY);
      ctx.lineTo(gx, paddingY + plotH);
      ctx.stroke();

      // Sub-ticks along central horizontal axis
      if (i < numDivX) {
        for (let s = 1; s < 5; s++) {
          const subX = gx + s * (divW / 5);
          const centerY = paddingY + plotH / 2;
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(45, 85, 125, 0.6)';
          ctx.moveTo(subX, centerY - 3);
          ctx.lineTo(subX, centerY + 3);
          ctx.stroke();
          ctx.strokeStyle = 'rgba(30, 58, 88, 0.45)';
        }
      }
    }

    for (let j = 0; j <= numDivY; j++) {
      const gy = paddingY + j * divH;
      ctx.beginPath();
      ctx.moveTo(paddingX, gy);
      ctx.lineTo(paddingX + plotW, gy);
      ctx.stroke();

      // Sub-ticks along central vertical axis
      if (j < numDivY) {
        for (let s = 1; s < 5; s++) {
          const subY = gy + s * (divH / 5);
          const centerX = paddingX + plotW / 2;
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(45, 85, 125, 0.6)';
          ctx.moveTo(centerX - 3, subY);
          ctx.lineTo(centerX + 3, subY);
          ctx.stroke();
          ctx.strokeStyle = 'rgba(30, 58, 88, 0.45)';
        }
      }
    }

    // Major Center Crosshairs
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.beginPath();
    ctx.moveTo(paddingX, paddingY + plotH / 2);
    ctx.lineTo(paddingX + plotW, paddingY + plotH / 2);
    ctx.moveTo(paddingX + plotW / 2, paddingY);
    ctx.lineTo(paddingX + plotW / 2, paddingY + plotH);
    ctx.stroke();

    if (samples.length === 0) {
      ctx.restore();
      return;
    }

    // Vertical Scaling
    let effectiveMaxV = maxVoltageMagnitude;
    if (vScaleIndex === 1) effectiveMaxV = 100;
    else if (vScaleIndex === 2) effectiveMaxV = 200;
    else if (vScaleIndex === 3) effectiveMaxV = 400;

    const yCenter = paddingY + plotH / 2;
    const yScale = (plotH * 0.44) / effectiveMaxV;

    const totalTimeSec = samples[samples.length - 1].time;
    const xScale = plotW / totalTimeSec;

    // Helper to map sample to screen coords
    const getPointX = (s: InstantaneousState) => paddingX + s.time * xScale;
    const getPointY = (v: number) => yCenter - v * yScale;

    // --- CHANNEL 2: Input AC Reference Trace (Cyan) ---
    if (ch2Visible) {
      ctx.lineWidth = 1.8;
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.shadowColor = '#0284C7';
      ctx.shadowBlur = 4;
      ctx.beginPath();

      if (params.phase === 'single') {
        for (let i = 0; i < samples.length; i++) {
          const s = samples[i];
          const px = getPointX(s);
          const py = getPointY(s.vSource);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      } else {
        // 3-Phase: Draw Phase A, B, C lightly
        ctx.setLineDash([3, 2]);
        ctx.lineWidth = 1.2;

        // Phase A (Red/Rose)
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.7)';
        ctx.beginPath();
        for (let i = 0; i < samples.length; i++) {
          const s = samples[i];
          const px = getPointX(s);
          const py = getPointY(s.vPhaseA);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Phase B (Amber)
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
        ctx.beginPath();
        for (let i = 0; i < samples.length; i++) {
          const s = samples[i];
          const px = getPointX(s);
          const py = getPointY(s.vPhaseB);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Phase C (Sky)
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.beginPath();
        for (let i = 0; i < samples.length; i++) {
          const s = samples[i];
          const px = getPointX(s);
          const py = getPointY(s.vPhaseC);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.shadowBlur = 0;
    }

    // --- CHANNEL 3: Gate Pulses / Probed Current (Magenta/Emerald) ---
    if (ch3Visible) {
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 3;

      if (params.rectifierType === 'thyristor') {
        // Draw Gate Pulse Trace (Magenta)
        ctx.strokeStyle = '#EC4899';
        ctx.shadowColor = '#BE185D';
        ctx.beginPath();
        const gateBaseY = paddingY + plotH - 18;
        const gateHeight = 24;

        for (let i = 0; i < samples.length; i++) {
          const s = samples[i];
          const px = getPointX(s);
          const hasGate = (s.probedGate || 0) > 0.5;
          const py = hasGate ? gateBaseY - gateHeight : gateBaseY;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      } else {
        // Draw Component Current Trace (Emerald)
        ctx.strokeStyle = '#10B981';
        ctx.shadowColor = '#059669';
        ctx.beginPath();
        const maxI = metrics.peakForwardCurrent || 5;
        const iScale = (plotH * 0.28) / Math.max(1, maxI);

        for (let i = 0; i < samples.length; i++) {
          const s = samples[i];
          const px = getPointX(s);
          const py = yCenter - s.probedCurrent * iScale;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    // --- CHANNEL 1: PRIMARY PROBED VOLTAGE TRACE (Amber / Gold) ---
    if (ch1Visible) {
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#FBBF24';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 6;
      ctx.beginPath();

      for (let i = 0; i < samples.length; i++) {
        const s = samples[i];
        const px = getPointX(s);
        const py = getPointY(s.probedVoltage);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Subtle phosphor area fill under curve for DC Load
      if (params.selectedComponent === 'load') {
        ctx.lineTo(getPointX(samples[samples.length - 1]), yCenter);
        ctx.lineTo(getPointX(samples[0]), yCenter);
        ctx.closePath();
        ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    // --- REAL-TIME SWEEP LINE (Synchronized with schematic angle) ---
    const currentPeriodTime = currentState.time % (2 / params.frequency);
    const sweepProgress =
      (currentState.omegaTDeg / 360 + Math.floor(currentState.time * params.frequency)) % 2;
    const sweepX = paddingX + (sweepProgress / 2) * plotW;

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(sweepX, paddingY);
    ctx.lineTo(sweepX, paddingY + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Live Beam Position Dot on CH1
    const beamY = getPointY(currentState.probedVoltage);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(sweepX, beamY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ground 0V Reference Tick on Left Edge
    ctx.fillStyle = '#F59E0B';
    ctx.beginPath();
    ctx.moveTo(paddingX - 14, yCenter - 5);
    ctx.lineTo(paddingX - 4, yCenter);
    ctx.lineTo(paddingX - 14, yCenter + 5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#94A3B8';
    ctx.font = '9px monospace';
    ctx.fillText('0V', paddingX - 34, yCenter + 3);

    // Axis Calibration Text
    ctx.fillStyle = '#64748B';
    ctx.font = '10px monospace';
    ctx.fillText(`+${effectiveMaxV.toFixed(0)}V`, 6, paddingY + 12);
    ctx.fillText(`-${effectiveMaxV.toFixed(0)}V`, 6, paddingY + plotH - 4);
    ctx.fillText('0.0 ms', paddingX - 4, paddingY + plotH + 16);
    ctx.fillText(
      `${(totalTimeSec * 1000).toFixed(1)} ms (2 Periods)`,
      paddingX + plotW - 90,
      paddingY + plotH + 16
    );

    // Interactive Hover Crosshairs
    if (hoverData) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(hoverData.x, paddingY);
      ctx.lineTo(hoverData.x, paddingY + plotH);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(paddingX, hoverData.y);
      ctx.lineTo(paddingX + plotW, hoverData.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }, [
    samples,
    currentState,
    params,
    maxVoltageMagnitude,
    vScaleIndex,
    ch1Visible,
    ch2Visible,
    ch3Visible,
    hoverData,
    metrics,
  ]);

  // Handle Mouse Hover on Canvas for exact coordinates HUD
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || samples.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const paddingX = 40;
    const paddingY = 24;
    const plotW = rect.width - paddingX * 2;
    const plotH = rect.height - paddingY * 2;

    if (x < paddingX || x > paddingX + plotW || y < paddingY || y > paddingY + plotH) {
      setHoverData(null);
      return;
    }

    const relX = (x - paddingX) / plotW;
    const sampleIdx = Math.min(
      samples.length - 1,
      Math.max(0, Math.floor(relX * samples.length))
    );
    const s = samples[sampleIdx];

    setHoverData({
      x,
      y,
      timeMs: s.time * 1000,
      angleDeg: s.omegaTDeg,
      ch1Val: s.probedVoltage,
      ch2Val: params.phase === 'single' ? s.vSource : s.vPhaseA,
      ch3Val: s.probedCurrent,
    });
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden select-none">
      {/* Oscilloscope Header Console */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
            <span className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase">
              Digital Storage Oscilloscope
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500">|</span>
          <span className="text-xs font-mono text-slate-400">
            {params.frequency} Hz · {((1 / params.frequency) * 1000).toFixed(1)} ms/T
          </span>
        </div>

        {/* Channel Indicators / Toggles */}
        <div className="flex items-center gap-2">
          {/* CH1 Button */}
          <button
            onClick={() => setCh1Visible(!ch1Visible)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              ch1Visible
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'bg-slate-800 text-slate-500 border border-slate-700 line-through'
            }`}
            title="Toggle CH1 Probed Voltage"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            CH1: {params.selectedComponent.toUpperCase()} (v)
          </button>

          {/* CH2 Button */}
          <button
            onClick={() => setCh2Visible(!ch2Visible)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              ch2Visible
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                : 'bg-slate-800 text-slate-500 border border-slate-700 line-through'
            }`}
            title="Toggle CH2 AC Supply Reference"
          >
            <span className="w-2 h-2 rounded-full bg-sky-400"></span>
            CH2: {params.phase === 'single' ? 'AC In' : '3Φ In'}
          </button>

          {/* CH3 Button */}
          <button
            onClick={() => setCh3Visible(!ch3Visible)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              ch3Visible
                ? params.rectifierType === 'thyristor'
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/50'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                : 'bg-slate-800 text-slate-500 border border-slate-700 line-through'
            }`}
            title={
              params.rectifierType === 'thyristor'
                ? 'Toggle CH3 Gate Pulse Signal'
                : 'Toggle CH3 Probed Current'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                params.rectifierType === 'thyristor' ? 'bg-pink-400' : 'bg-emerald-400'
              }`}
            ></span>
            CH3: {params.rectifierType === 'thyristor' ? 'Gate (α)' : 'Current (i)'}
          </button>

          {/* Scale selector */}
          <select
            value={vScaleIndex}
            onChange={(e) => setVScaleIndex(Number(e.target.value))}
            className="bg-slate-800 text-slate-300 text-[11px] font-mono px-2 py-0.5 rounded border border-slate-700 outline-none"
          >
            <option value={0}>Scale: Auto</option>
            <option value={1}>100 V/Full</option>
            <option value={2}>200 V/Full</option>
            <option value={3}>400 V/Full</option>
          </select>
        </div>
      </div>

      {/* Main Screen Area */}
      <div className="relative flex-1 bg-[#060B12] min-h-[300px]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Live Dynamic Inspection Tooltip / Cursor HUD */}
        {hoverData && (
          <div
            className="absolute pointer-events-none bg-slate-900/95 border border-slate-700 px-3 py-1.5 rounded shadow-xl text-xs font-mono z-20 backdrop-blur-sm"
            style={{
              left: Math.min(hoverData.x + 12, 380),
              top: Math.max(hoverData.y - 65, 10),
            }}
          >
            <div className="text-[10px] text-slate-400 border-b border-slate-800 pb-1 mb-1 flex justify-between gap-4">
              <span>t = {hoverData.timeMs.toFixed(2)} ms</span>
              <span className="text-cyan-400">ωt = {hoverData.angleDeg.toFixed(1)}°</span>
            </div>
            <div className="text-amber-300 font-semibold flex justify-between gap-4">
              <span>CH1 (Probed):</span>
              <span className="font-mono">{hoverData.ch1Val.toFixed(1)} V</span>
            </div>
            <div className="text-sky-300 flex justify-between gap-4">
              <span>CH2 (AC In):</span>
              <span className="font-mono">{hoverData.ch2Val.toFixed(1)} V</span>
            </div>
            <div className="text-emerald-400 flex justify-between gap-4">
              <span>CH3 (Current):</span>
              <span className="font-mono">{hoverData.ch3Val.toFixed(2)} A</span>
            </div>
          </div>
        )}
      </div>

      {/* Real-time Probed Component Live Telemetry HUD Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 px-3 py-2 bg-slate-900/95 border-t border-slate-800 text-xs font-mono shrink-0">
        <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
            Probed Instant V
          </div>
          <div className="text-base font-bold text-amber-400">
            {currentState.probedVoltage.toFixed(1)}{' '}
            <span className="text-[10px] font-normal text-slate-400">V</span>
          </div>
          <div className="text-[9px] text-slate-500 truncate">
            {currentState.probedStateLabel}
          </div>
        </div>

        <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
            Peak Inverse (PIV)
          </div>
          <div className="text-base font-bold text-rose-400">
            {metrics.piv.toFixed(1)}{' '}
            <span className="text-[10px] font-normal text-slate-400">V</span>
          </div>
          <div className="text-[9px] text-slate-500">
            Theoretical: {(Math.SQRT2 * params.vinRms * (params.phase === 'three' ? Math.sqrt(3) : 1)).toFixed(0)} V
          </div>
        </div>

        <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
            Load DC Average (V_dc)
          </div>
          <div className="text-base font-bold text-emerald-400">
            {metrics.vDcAvg.toFixed(1)}{' '}
            <span className="text-[10px] font-normal text-slate-400">V</span>
          </div>
          <div className="text-[9px] text-slate-500">
            V_rms: {metrics.vRms.toFixed(1)} V
          </div>
        </div>

        <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider truncate">
            Ripple Factor (γ)
          </div>
          <div className="text-base font-bold text-cyan-400">
            {(metrics.rippleFactor * 100).toFixed(1)}{' '}
            <span className="text-[10px] font-normal text-slate-400">%</span>
          </div>
          <div className="text-[9px] text-slate-500">
            Ripple Freq: {metrics.fundamentalRippleFreqHz} Hz
          </div>
        </div>
      </div>
    </div>
  );
};
