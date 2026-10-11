import React from 'react';
import {
  LoadType,
  PhaseType,
  RectifierType,
  SimulationParams,
} from '../types/simulation';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  StepBack,
  Sliders,
  Zap,
  BookOpen,
} from 'lucide-react';

interface ControlPanelProps {
  params: SimulationParams;
  onChangeParams: (updater: (prev: SimulationParams) => SimulationParams) => void;
  isRunning: boolean;
  onToggleRunning: () => void;
  simSpeed: number;
  onChangeSpeed: (speed: number) => void;
  currentAngleDeg: number;
  onScrubAngle: (deg: number) => void;
  onOpenTheory: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  params,
  onChangeParams,
  isRunning,
  onToggleRunning,
  simSpeed,
  onChangeSpeed,
  currentAngleDeg,
  onScrubAngle,
  onOpenTheory,
}) => {
  const isThyristor = params.rectifierType === 'thyristor';
  const is3Phase = params.phase === 'three';

  // Apply Presets
  const applyPreset = (presetName: string) => {
    onChangeParams((prev) => {
      switch (presetName) {
        case '1ph-diode-r':
          return {
            ...prev,
            phase: 'single',
            rectifierType: 'diode',
            loadType: 'R',
            hasFreewheelingDiode: false,
            vinRms: 230,
            frequency: 50,
            resistance: 20,
            selectedComponent: 'load',
          };
        case '1ph-diode-rc':
          return {
            ...prev,
            phase: 'single',
            rectifierType: 'diode',
            loadType: 'RC',
            hasFreewheelingDiode: false,
            vinRms: 230,
            frequency: 50,
            resistance: 50,
            capacitance: 0.00047, // 470 uF
            selectedComponent: 'cap',
          };
        case '1ph-thyristor-r':
          return {
            ...prev,
            phase: 'single',
            rectifierType: 'thyristor',
            loadType: 'R',
            hasFreewheelingDiode: false,
            vinRms: 230,
            alpha: 45,
            frequency: 50,
            resistance: 25,
            selectedComponent: 't1',
          };
        case '1ph-thyristor-rl':
          return {
            ...prev,
            phase: 'single',
            rectifierType: 'thyristor',
            loadType: 'RL',
            hasFreewheelingDiode: false,
            vinRms: 230,
            alpha: 60,
            frequency: 50,
            resistance: 20,
            inductance: 0.08,
            selectedComponent: 'load',
          };
        case '1ph-thyristor-rl-fwd':
          return {
            ...prev,
            phase: 'single',
            rectifierType: 'thyristor',
            loadType: 'RL_FWD',
            hasFreewheelingDiode: true,
            vinRms: 230,
            alpha: 60,
            frequency: 50,
            resistance: 20,
            inductance: 0.08,
            selectedComponent: 'fwd',
          };
        case '1ph-thyristor-rle':
          return {
            ...prev,
            phase: 'single',
            rectifierType: 'thyristor',
            loadType: 'RLE',
            hasFreewheelingDiode: true,
            vinRms: 230,
            alpha: 45,
            frequency: 50,
            resistance: 15,
            inductance: 0.08,
            emfVoltage: 60,
            selectedComponent: 'emf',
          };
        case '1ph-diode-current':
          return {
            ...prev,
            phase: 'single',
            rectifierType: 'diode',
            loadType: 'CURRENT',
            hasFreewheelingDiode: false,
            vinRms: 230,
            frequency: 50,
            constantCurrent: 12,
            selectedComponent: 'current_source',
          };
        case '3ph-diode-industrial':
          return {
            ...prev,
            phase: 'three',
            rectifierType: 'diode',
            loadType: 'R',
            hasFreewheelingDiode: false,
            vinRms: 230, // 400V line-to-line
            frequency: 50,
            resistance: 15,
            selectedComponent: 'load',
          };
        case '3ph-thyristor-controlled':
          return {
            ...prev,
            phase: 'three',
            rectifierType: 'thyristor',
            loadType: 'R',
            hasFreewheelingDiode: false,
            vinRms: 230,
            alpha: 30,
            frequency: 50,
            resistance: 20,
            selectedComponent: 't1',
          };
        case '3ph-thyristor-rle':
          return {
            ...prev,
            phase: 'three',
            rectifierType: 'thyristor',
            loadType: 'RLE',
            hasFreewheelingDiode: true,
            vinRms: 230,
            alpha: 30,
            frequency: 50,
            resistance: 10,
            inductance: 0.06,
            emfVoltage: 100,
            selectedComponent: 'emf',
          };
        case '3ph-thyristor-discontinuous':
          return {
            ...prev,
            phase: 'three',
            rectifierType: 'thyristor',
            loadType: 'R',
            hasFreewheelingDiode: false,
            vinRms: 230,
            alpha: 75,
            frequency: 50,
            resistance: 25,
            selectedComponent: 'load',
          };
        default:
          return prev;
      }
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4 text-xs font-mono select-none">
      {/* 1. TOPOLOGY & CONVERTER TYPE SELECTION */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-slate-200 uppercase tracking-wide">
            Circuit Topology Setup
          </span>
        </div>

        {/* Phase Mode Toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-md border border-slate-800">
          <button
            onClick={() =>
              onChangeParams((prev) => ({
                ...prev,
                phase: 'single',
                selectedComponent:
                  prev.selectedComponent.startsWith('d5') ||
                  prev.selectedComponent.startsWith('d6') ||
                  prev.selectedComponent.startsWith('t5') ||
                  prev.selectedComponent.startsWith('t6')
                    ? 'load'
                    : prev.selectedComponent,
              }))
            }
            className={`px-3 py-1 rounded text-xs transition-colors ${
              !is3Phase
                ? 'bg-sky-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            1Φ Single-Phase
          </button>
          <button
            onClick={() =>
              onChangeParams((prev) => ({
                ...prev,
                phase: 'three',
              }))
            }
            className={`px-3 py-1 rounded text-xs transition-colors ${
              is3Phase
                ? 'bg-sky-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3Φ Three-Phase (6-Pulse)
          </button>
        </div>

        {/* Rectifier Type Toggle */}
        <div className="flex items-center bg-slate-950 p-1 rounded-md border border-slate-800">
          <button
            onClick={() =>
              onChangeParams((prev) => ({
                ...prev,
                rectifierType: 'diode',
                selectedComponent: prev.selectedComponent.startsWith('t')
                  ? (prev.selectedComponent.replace('t', 'd') as any)
                  : prev.selectedComponent,
              }))
            }
            className={`px-3 py-1 rounded text-xs transition-colors ${
              !isThyristor
                ? 'bg-emerald-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Diode Bridge (Uncontrolled)
          </button>
          <button
            onClick={() =>
              onChangeParams((prev) => ({
                ...prev,
                rectifierType: 'thyristor',
                selectedComponent: prev.selectedComponent.startsWith('d')
                  ? (prev.selectedComponent.replace('d', 't') as any)
                  : prev.selectedComponent,
              }))
            }
            className={`px-3 py-1 rounded text-xs transition-colors ${
              isThyristor
                ? 'bg-amber-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Thyristor Bridge (SCR Controlled)
          </button>
        </div>

        <button
          onClick={onOpenTheory}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-cyan-500/30 transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          <span>Formulas & Theory</span>
        </button>
      </div>

      {/* 2. PLAYBACK & REAL-TIME PHASE CONTROLS */}
      <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        {/* Play / Pause / Step */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleRunning}
            className={`flex items-center gap-2 px-4 py-1.5 rounded font-bold text-xs transition-colors ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Run Live
              </>
            )}
          </button>

          <button
            onClick={() => onScrubAngle(currentAngleDeg - 5)}
            disabled={isRunning}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded border border-slate-700"
            title="Step back 5°"
          >
            <StepBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onScrubAngle(currentAngleDeg + 5)}
            disabled={isRunning}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded border border-slate-700"
            title="Step forward 5°"
          >
            <StepForward className="w-3.5 h-3.5" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 ml-2 text-slate-400">
            <span>Speed:</span>
            {[0.05, 0.2, 0.5, 1.0].map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-1.5 py-0.5 rounded text-[10px] ${
                  simSpeed === s
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {s === 1.0 ? '1x (Real)' : `${s}x`}
              </button>
            ))}
          </div>
        </div>

        {/* Phase Scrubber */}
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <span className="text-slate-400 text-[11px] whitespace-nowrap">
            Phase Angle ωt:
          </span>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={Math.round(currentAngleDeg)}
            onChange={(e) => onScrubAngle(Number(e.target.value))}
            className="flex-1 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-cyan-400 font-bold text-xs w-12 text-right">
            {currentAngleDeg.toFixed(0)}°
          </span>
        </div>
      </div>

      {/* 3. SIMULATION ELECTRICAL PARAMETERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* AC Input RMS */}
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1.5">
          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>AC Input (RMS):</span>
            <span className="text-slate-200 font-bold">{params.vinRms} V</span>
          </div>
          <input
            type="range"
            min={12}
            max={415}
            step={1}
            value={params.vinRms}
            onChange={(e) =>
              onChangeParams((prev) => ({
                ...prev,
                vinRms: Number(e.target.value),
              }))
            }
            className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>Peak: {(Math.SQRT2 * params.vinRms).toFixed(0)}V</span>
            <span>Freq: {params.frequency} Hz</span>
          </div>
        </div>

        {/* Firing Angle alpha (Thyristor Only) */}
        {isThyristor ? (
          <div className="bg-slate-950 p-2.5 rounded border border-amber-500/40 space-y-1.5">
            <div className="flex justify-between text-amber-300 text-[11px]">
              <span className="font-semibold">Firing Angle (α):</span>
              <span className="font-bold text-amber-400 text-sm">
                {params.alpha}°
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={170}
              step={1}
              value={params.alpha}
              onChange={(e) =>
                onChangeParams((prev) => ({
                  ...prev,
                  alpha: Number(e.target.value),
                }))
              }
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-amber-500/80">
              <span>0° (Full Wave)</span>
              <span>Delay: {((params.alpha / 360) * (1000 / params.frequency)).toFixed(2)} ms</span>
            </div>
          </div>
        ) : (
          /* Diode Forward Drop */
          <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-slate-400 text-[11px]">
              <span>Diode Forward Drop (V_F):</span>
              <span className="text-emerald-400 font-bold">
                {params.diodeForwardDrop} V
              </span>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() =>
                  onChangeParams((prev) => ({ ...prev, diodeForwardDrop: 0.7 }))
                }
                className={`flex-1 py-1 rounded text-[10px] ${
                  params.diodeForwardDrop === 0.7
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                Silicon (0.7V)
              </button>
              <button
                onClick={() =>
                  onChangeParams((prev) => ({ ...prev, diodeForwardDrop: 0.0 }))
                }
                className={`flex-1 py-1 rounded text-[10px] ${
                  params.diodeForwardDrop === 0.0
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                Ideal (0.0V)
              </button>
            </div>
          </div>
        )}

        {/* Load Type Selector */}
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1.5">
          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>Load Configuration:</span>
            <span className="text-amber-400 font-bold">{params.loadType}</span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            {(['R', 'RL', 'RLE', 'CURRENT', 'RC'] as LoadType[]).map((lt) => (
              <button
                key={lt}
                onClick={() =>
                  onChangeParams((prev) => ({
                    ...prev,
                    loadType: lt,
                  }))
                }
                className={`py-1 px-1.5 rounded text-[10px] truncate ${
                  params.loadType === lt
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {lt === 'R'
                  ? 'Pure R'
                  : lt === 'RL'
                  ? 'R-L Inductive'
                  : lt === 'RLE'
                  ? 'R-L-E (DC Motor)'
                  : lt === 'CURRENT'
                  ? 'I₀ Current Sink'
                  : 'R-C Filter'}
              </button>
            ))}
          </div>
        </div>

        {/* Load Resistance R */}
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1.5">
          <div className="flex justify-between text-slate-400 text-[11px]">
            <span>Load Resistance (R):</span>
            <span className="text-slate-200 font-bold">{params.resistance} Ω</span>
          </div>
          <input
            type="range"
            min={2}
            max={200}
            step={1}
            value={params.resistance}
            onChange={(e) =>
              onChangeParams((prev) => ({
                ...prev,
                resistance: Number(e.target.value),
              }))
            }
            className="w-full accent-slate-400 h-1.5 bg-slate-800 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-slate-500">
            <span>Peak Current: {( (Math.SQRT2 * params.vinRms) / params.resistance ).toFixed(1)} A</span>
          </div>
        </div>

        {/* Freewheeling Diode (D_FW) Independent Toggle */}
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1.5 md:col-span-2 lg:col-span-4">
          <div className="flex justify-between items-center text-slate-400 text-[11px]">
            <span className="flex items-center gap-1.5 font-semibold text-slate-300">
              <span className={`w-2 h-2 rounded-full ${params.hasFreewheelingDiode || params.loadType === 'RL_FWD' || params.loadType === 'RLE_FWD' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
              Freewheeling Diode (D_FW) Control:
            </span>
            <span className={params.hasFreewheelingDiode || params.loadType === 'RL_FWD' || params.loadType === 'RLE_FWD' ? 'text-emerald-400 font-bold text-xs' : 'text-slate-500 text-xs'}>
              {params.hasFreewheelingDiode || params.loadType === 'RL_FWD' || params.loadType === 'RLE_FWD' ? 'D_FW ACTIVE (Clamps vₒ ≥ 0V)' : 'D_FW DISABLED'}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
            <button
              onClick={() =>
                onChangeParams((prev) => ({
                  ...prev,
                  hasFreewheelingDiode: !(prev.hasFreewheelingDiode || prev.loadType === 'RL_FWD' || prev.loadType === 'RLE_FWD'),
                  loadType: prev.loadType === 'RL_FWD' ? 'RL' : prev.loadType === 'RLE_FWD' ? 'RLE' : prev.loadType,
                }))
              }
              className={`py-1.5 px-3 rounded text-xs font-mono transition-colors flex items-center gap-2 ${
                params.hasFreewheelingDiode || params.loadType === 'RL_FWD' || params.loadType === 'RLE_FWD'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <span>{params.hasFreewheelingDiode || params.loadType === 'RL_FWD' || params.loadType === 'RLE_FWD' ? '✓ D_FW Enabled (Clamping On)' : '+ Enable Freewheeling Diode (D_FW)'}</span>
            </button>
            <div className="text-[10px] text-slate-400">
              {params.hasFreewheelingDiode || params.loadType === 'RL_FWD' || params.loadType === 'RLE_FWD'
                ? 'Clamps negative inductor voltage spikes to 0V and recirculates decay current through D_FW.'
                : 'Allows load voltage to swing negative during inductive flyback / thyristor conduction extension.'}
            </div>
          </div>
        </div>

        {/* Inductance L Slider (Displayed when RL or RLE load is selected) */}
        {(params.loadType === 'RL' || params.loadType === 'RL_FWD' || params.loadType === 'RLE' || params.loadType === 'RLE_FWD') && (
          <div className="bg-slate-950 p-2.5 rounded border border-cyan-500/40 space-y-1.5 md:col-span-2 lg:col-span-4">
            <div className="flex justify-between items-center text-cyan-300 text-[11px]">
              <span className="font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Series Inductance Choke (L):
              </span>
              <span className="font-bold text-cyan-400 text-sm">
                {(params.inductance * 1000).toFixed(0)} mH
                <span className="text-slate-400 text-xs font-normal ml-2">
                  (τ = L/R = {((params.inductance / Math.max(0.1, params.resistance)) * 1000).toFixed(1)} ms)
                </span>
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={300}
              step={5}
              value={Math.round(params.inductance * 1000)}
              onChange={(e) =>
                onChangeParams((prev) => ({
                  ...prev,
                  inductance: Number(e.target.value) / 1000,
                }))
              }
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
              <span>5 mH (Ripple)</span>
              <div className="flex gap-2">
                <button
                  onClick={() => onChangeParams((p) => ({ ...p, inductance: 0.01 }))}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  10 mH (Low)
                </button>
                <button
                  onClick={() => onChangeParams((p) => ({ ...p, inductance: 0.05 }))}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  50 mH (Medium)
                </button>
                <button
                  onClick={() => onChangeParams((p) => ({ ...p, inductance: 0.15 }))}
                  className="px-2 py-0.5 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-700/50 rounded"
                >
                  150 mH (Continuous CCM)
                </button>
              </div>
              <span>300 mH (Ultra-Smooth DC)</span>
            </div>
          </div>
        )}

        {/* Back EMF E Slider (Displayed when RLE load is selected) */}
        {(params.loadType === 'RLE' || params.loadType === 'RLE_FWD') && (
          <div className="bg-slate-950 p-2.5 rounded border border-amber-500/40 space-y-1.5 md:col-span-2 lg:col-span-4">
            <div className="flex justify-between items-center text-amber-300 text-[11px]">
              <span className="font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                RLE Load Back EMF / Battery Voltage (E):
              </span>
              <span className="font-bold text-amber-400 text-sm">
                {params.emfVoltage || 48} V DC
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={180}
              step={2}
              value={params.emfVoltage || 48}
              onChange={(e) =>
                onChangeParams((prev) => ({
                  ...prev,
                  emfVoltage: Number(e.target.value),
                }))
              }
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
              <span>0V (Pure RL)</span>
              <div className="flex gap-2">
                <button
                  onClick={() => onChangeParams((p) => ({ ...p, emfVoltage: 24 }))}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  24V (Battery)
                </button>
                <button
                  onClick={() => onChangeParams((p) => ({ ...p, emfVoltage: 48 }))}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  48V (Telecom/EV)
                </button>
                <button
                  onClick={() => onChangeParams((p) => ({ ...p, emfVoltage: 96 }))}
                  className="px-2 py-0.5 bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700/50 rounded"
                >
                  96V (DC Motor Armature)
                </button>
              </div>
              <span>180V (High EMF)</span>
            </div>
          </div>
        )}

        {/* Constant Current I₀ Slider (Displayed when CURRENT load is selected) */}
        {params.loadType === 'CURRENT' && (
          <div className="bg-slate-950 p-2.5 rounded border border-cyan-500/40 space-y-1.5 md:col-span-2 lg:col-span-4">
            <div className="flex justify-between items-center text-cyan-300 text-[11px]">
              <span className="font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                Constant Load Current Sink (I₀):
              </span>
              <span className="font-bold text-cyan-400 text-sm">
                {params.constantCurrent || 10} A DC
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              step={1}
              value={params.constantCurrent || 10}
              onChange={(e) =>
                onChangeParams((prev) => ({
                  ...prev,
                  constantCurrent: Number(e.target.value),
                }))
              }
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
              <span>1 A</span>
              <div className="flex gap-2">
                <button
                  onClick={() => onChangeParams((p) => ({ ...p, constantCurrent: 5 }))}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  5 A
                </button>
                <button
                  onClick={() => onChangeParams((p) => ({ ...p, constantCurrent: 10 }))}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300"
                >
                  10 A (Standard)
                </button>
                <button
                  onClick={() => onChangeParams((p) => ({ ...p, constantCurrent: 25 }))}
                  className="px-2 py-0.5 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-700/50 rounded"
                >
                  25 A (High Current)
                </button>
              </div>
              <span>50 A</span>
            </div>
          </div>
        )}

        {/* Capacitance C Slider (Displayed when RC load is selected) */}
        {params.loadType === 'RC' && (
          <div className="bg-slate-950 p-2.5 rounded border border-cyan-500/40 space-y-1.5 md:col-span-2 lg:col-span-4">
            <div className="flex justify-between items-center text-cyan-300 text-[11px]">
              <span className="font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                RC Filter Capacitance (C):
              </span>
              <span className="font-bold text-cyan-400 text-sm">
                {(params.capacitance * 1000000).toFixed(0)} µF
                <span className="text-slate-400 text-xs font-normal ml-2">
                  (τ = RC = {(params.resistance * params.capacitance * 1000).toFixed(1)} ms)
                </span>
              </span>
            </div>
            <input
              type="range"
              min={50}
              max={2200}
              step={50}
              value={Math.round(params.capacitance * 1000000)}
              onChange={(e) =>
                onChangeParams((prev) => ({
                  ...prev,
                  capacitance: Number(e.target.value) / 1000000,
                }))
              }
              className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* 4. PRESET LABORATORY EXPERIMENTS */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-slate-500 font-semibold uppercase">
          Standard Lab Presets:
        </span>
        <button
          onClick={() => applyPreset('1ph-diode-r')}
          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
        >
          1Φ Full-Wave Diode (R)
        </button>
        <button
          onClick={() =>
            onChangeParams((prev) => ({
              ...prev,
              phase: 'single',
              rectifierType: 'diode',
              loadType: 'RL',
              hasFreewheelingDiode: false,
              vinRms: 230,
              frequency: 50,
              resistance: 20,
              inductance: 0.08,
              selectedComponent: 'load',
            }))
          }
          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[10px] font-semibold"
        >
          1Φ Diode + RL Load
        </button>
        <button
          onClick={() => applyPreset('1ph-thyristor-rl-fwd')}
          className="px-2 py-0.5 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/50 rounded text-[10px] font-semibold"
        >
          1Φ SCR + RL + FWD (Clamped)
        </button>
        <button
          onClick={() => applyPreset('1ph-thyristor-rle')}
          className="px-2 py-0.5 bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700/50 rounded text-[10px] font-semibold"
        >
          1Φ SCR + RLE (DC Motor)
        </button>
        <button
          onClick={() => applyPreset('1ph-diode-current')}
          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded text-[10px]"
        >
          1Φ Diode + I₀ Current Sink
        </button>
        <button
          onClick={() => applyPreset('1ph-diode-rc')}
          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
        >
          1Φ DC Charger (RC Filter)
        </button>
        <button
          onClick={() => applyPreset('3ph-diode-industrial')}
          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded text-[10px]"
        >
          3Φ 6-Pulse Diode Substation
        </button>
        <button
          onClick={() => applyPreset('3ph-thyristor-rle')}
          className="px-2 py-0.5 bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700/50 rounded text-[10px] font-semibold"
        >
          3Φ SCR + RLE (Industrial Drive)
        </button>
        <button
          onClick={() => applyPreset('3ph-thyristor-controlled')}
          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-[10px]"
        >
          3Φ SCR Converter α = 30°
        </button>
        <button
          onClick={() =>
            onChangeParams((prev) => ({
              ...prev,
              phase: 'three',
              rectifierType: 'thyristor',
              loadType: 'RL',
              vinRms: 230,
              alpha: 45,
              frequency: 50,
              resistance: 20,
              inductance: 0.1,
              selectedComponent: 'load',
            }))
          }
          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-[10px] font-semibold"
        >
          3Φ SCR + RL Load (α = 45°)
        </button>
      </div>
    </div>
  );
};
