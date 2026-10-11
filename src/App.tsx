import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  ComponentId,
  SimulationParams,
  SimulationDataset,
} from './types/simulation';
import {
  runSimulation,
  calculateInstantaneousState,
  COMPONENT_METADATA,
} from './simulator/engine';
import { CircuitSchematic } from './components/CircuitSchematic';
import { Oscilloscope } from './components/Oscilloscope';
import { ControlPanel } from './components/ControlPanel';
import { TheoryModal } from './components/TheoryModal';
import { Activity, Play, RotateCcw, Cpu } from 'lucide-react';

export default function App() {
  // Main simulation parameters
  const [params, setParams] = useState<SimulationParams>({
    phase: 'single',
    rectifierType: 'diode',
    loadType: 'R',
    hasFreewheelingDiode: false,
    vinRms: 230,
    frequency: 50,
    alpha: 45,
    resistance: 20,
    inductance: 0.05,
    capacitance: 0.00047,
    emfVoltage: 48,
    constantCurrent: 10,
    diodeForwardDrop: 0.7,
    selectedComponent: 'load',
  });

  // Real-time animation playback state
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [simSpeed, setSimSpeed] = useState<number>(0.2); // Default to smooth 0.2x slow-mo for clear visual comprehension
  const [currentSimTime, setCurrentSimTime] = useState<number>(0);
  const [isTheoryOpen, setIsTheoryOpen] = useState<boolean>(false);

  const lastAnimTimeRef = useRef<number>(performance.now());
  const animFrameIdRef = useRef<number | null>(null);

  // Run full-period dataset calculation whenever electrical parameters change
  const dataset: SimulationDataset = useMemo(() => {
    return runSimulation(params, 2, 360);
  }, [params]);

  // Current instantaneous state computed from simulation time
  const currentOmegaT = 2 * Math.PI * params.frequency * currentSimTime;
  const currentState = useMemo(() => {
    return calculateInstantaneousState(currentOmegaT, currentSimTime, params);
  }, [currentOmegaT, currentSimTime, params]);

  // Animation frame loop
  useEffect(() => {
    const updateLoop = (now: number) => {
      const deltaSec = (now - lastAnimTimeRef.current) / 1000;
      lastAnimTimeRef.current = now;

      if (isRunning) {
        setCurrentSimTime((prevTime) => {
          const newTime = prevTime + deltaSec * simSpeed;
          // Wrap time to avoid numeric overflow after long runs
          const twoPeriods = 2 / params.frequency;
          return newTime > twoPeriods * 10 ? newTime % twoPeriods : newTime;
        });
      }

      animFrameIdRef.current = requestAnimationFrame(updateLoop);
    };

    lastAnimTimeRef.current = performance.now();
    animFrameIdRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isRunning, simSpeed, params.frequency]);

  // Handler for scrubbing phase angle manually
  const handleScrubAngle = useCallback(
    (deg: number) => {
      setIsRunning(false);
      const normalizedDeg = ((deg % 360) + 360) % 360;
      const targetTime = (normalizedDeg / 360) * (1 / params.frequency);
      setCurrentSimTime(targetTime);
    },
    [params.frequency]
  );

  // Component selection callback
  const handleSelectComponent = useCallback((id: ComponentId) => {
    setParams((prev) => ({
      ...prev,
      selectedComponent: id,
    }));
  }, []);

  // Quick navigation preset selector
  const handleSelectTopologyNav = (
    phase: 'single' | 'three',
    rect: 'diode' | 'thyristor'
  ) => {
    setParams((prev) => ({
      ...prev,
      phase,
      rectifierType: rect,
      selectedComponent: 'load',
    }));
  };

  const handleResetLab = () => {
    setParams({
      phase: 'single',
      rectifierType: 'diode',
      loadType: 'R',
      hasFreewheelingDiode: false,
      vinRms: 230,
      frequency: 50,
      alpha: 45,
      resistance: 20,
      inductance: 0.05,
      capacitance: 0.00047,
      emfVoltage: 48,
      constantCurrent: 10,
      diodeForwardDrop: 0.7,
      selectedComponent: 'load',
    });
    setCurrentSimTime(0);
    setIsRunning(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30">
      {/* 3-ZONE TOP BAR CONTRACT */}
      <header className="flex items-center justify-between px-6 py-3.5 bg-slate-900 border-b border-slate-800 shrink-0">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <a
            href="/"
            className="text-base font-bold font-mono tracking-tight text-white hover:text-cyan-400 transition-colors"
          >
            RectiSim Laboratory
          </a>
        </div>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-mono font-medium text-slate-300">
          <button
            onClick={() => handleSelectTopologyNav('single', 'diode')}
            className={`transition-colors cursor-pointer ${
              params.phase === 'single' && params.rectifierType === 'diode'
                ? 'text-cyan-400 font-bold border-b border-cyan-400 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            1Φ Diode Bridge
          </button>
          <button
            onClick={() => handleSelectTopologyNav('single', 'thyristor')}
            className={`transition-colors cursor-pointer ${
              params.phase === 'single' && params.rectifierType === 'thyristor'
                ? 'text-cyan-400 font-bold border-b border-cyan-400 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            1Φ SCR Thyristor
          </button>
          <button
            onClick={() => handleSelectTopologyNav('three', 'diode')}
            className={`transition-colors cursor-pointer ${
              params.phase === 'three' && params.rectifierType === 'diode'
                ? 'text-cyan-400 font-bold border-b border-cyan-400 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            3Φ 6-Pulse Diode
          </button>
          <button
            onClick={() => handleSelectTopologyNav('three', 'thyristor')}
            className={`transition-colors cursor-pointer ${
              params.phase === 'three' && params.rectifierType === 'thyristor'
                ? 'text-cyan-400 font-bold border-b border-cyan-400 pb-0.5'
                : 'hover:text-white'
            }`}
          >
            3Φ SCR Controlled
          </button>
          <button
            onClick={() => setIsTheoryOpen(true)}
            className="hover:text-cyan-400 transition-colors cursor-pointer"
          >
            Theory & Equations
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-3 py-1.5 text-xs font-mono font-semibold rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
            }`}
          >
            {isRunning ? 'Pause Beam' : 'Sweep Live'}
          </button>
          <button
            onClick={handleResetLab}
            className="px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors flex items-center gap-1.5 border border-slate-700 whitespace-nowrap"
            title="Reset circuit parameters to default"
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        </div>
      </header>

      {/* SUB-HEADER CONTEXT BAR */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-2 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-slate-300 font-semibold">Active Mode:</span>
          <span className="text-emerald-400">
            {params.phase === 'single' ? 'Single-Phase (1Φ)' : 'Three-Phase (3Φ)'}
          </span>
          <span>/</span>
          <span className="text-amber-400">
            {params.rectifierType === 'diode'
              ? 'Uncontrolled Diode Bridge'
              : `SCR Controlled Bridge (Firing Angle α = ${params.alpha}°)`}
          </span>
          <span>/</span>
          <span className="text-sky-400">Load: {params.loadType}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-400">
            Probing Component:{' '}
            <strong className="text-amber-300">
              {COMPONENT_METADATA[params.selectedComponent]?.name ||
                params.selectedComponent.toUpperCase()}
            </strong>
          </span>
        </div>
      </div>

      {/* MAIN DUAL-PANE WORKSPACE: LEFT (CIRCUIT DIAGRAM) & RIGHT (WAVEFORMS) */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 min-h-0">
        {/* LEFT COLUMN: CIRCUIT SCHEMATIC DIAGRAM */}
        <div className="flex flex-col min-h-[460px] h-full">
          <CircuitSchematic
            params={params}
            currentState={currentState}
            onSelectComponent={handleSelectComponent}
          />
        </div>

        {/* RIGHT COLUMN: REAL-TIME OSCILLOSCOPE WAVEFORMS */}
        <div className="flex flex-col min-h-[460px] h-full">
          <Oscilloscope
            params={params}
            dataset={dataset}
            currentState={currentState}
            probedMetadata={dataset.probedMetadata}
          />
        </div>
      </main>

      {/* BOTTOM CONTROL & CALIBRATION DOCK */}
      <section className="px-4 md:px-6 pb-6 shrink-0">
        <ControlPanel
          params={params}
          onChangeParams={setParams}
          isRunning={isRunning}
          onToggleRunning={() => setIsRunning(!isRunning)}
          simSpeed={simSpeed}
          onChangeSpeed={setSimSpeed}
          currentAngleDeg={currentState.omegaTDeg}
          onScrubAngle={handleScrubAngle}
          onOpenTheory={() => setIsTheoryOpen(true)}
        />
      </section>

      {/* THEORY & FORMULAS MODAL */}
      <TheoryModal
        isOpen={isTheoryOpen}
        onClose={() => setIsTheoryOpen(false)}
        params={params}
      />
    </div>
  );
}
