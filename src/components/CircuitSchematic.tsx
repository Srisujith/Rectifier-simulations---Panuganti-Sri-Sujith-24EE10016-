import React from 'react';
import {
  ComponentId,
  InstantaneousState,
  LoadType,
  PhaseType,
  RectifierType,
  SimulationParams,
} from '../types/simulation';

interface CircuitSchematicProps {
  params: SimulationParams;
  currentState: InstantaneousState;
  onSelectComponent: (componentId: ComponentId) => void;
}

export const CircuitSchematic: React.FC<CircuitSchematicProps> = ({
  params,
  currentState,
  onSelectComponent,
}) => {
  const { phase, rectifierType, loadType, selectedComponent, hasFreewheelingDiode } = params;
  const isThyristor = rectifierType === 'thyristor';
  const is3Phase = phase === 'three';
  const isRL = loadType === 'RL' || loadType === 'RL_FWD';
  const isRLE = loadType === 'RLE' || loadType === 'RLE_FWD';
  const isCurrentLoad = loadType === 'CURRENT';
  const isFWD = Boolean(hasFreewheelingDiode || loadType === 'RL_FWD' || loadType === 'RLE_FWD');

  // Helper to determine switch conduction and colors
  const getSwitchVisual = (id: string) => {
    const sw = currentState.switches[id];
    const isSelected = selectedComponent === id;
    if (!sw) {
      return {
        isConducting: false,
        isForwardBlocking: false,
        isReverseBlocking: false,
        gateActive: false,
        voltage: 0,
        current: 0,
        isSelected,
        color: '#64748B',
      };
    }
    const color = sw.isConducting
      ? '#10B981' // Green
      : sw.isForwardBlocking
      ? '#F59E0B' // Amber
      : '#EF4444'; // Red (Reverse blocking)
    return {
      ...sw,
      isSelected,
      color,
    };
  };

  // SVG symbols for Diode and Thyristor
  const renderDiodeOrThyristor = (
    id: string,
    label: string,
    x: number,
    y: number,
    orientation: 'down' | 'up' | 'right' = 'down'
  ) => {
    const sw = getSwitchVisual(id);
    const isSelected = sw.isSelected;
    const isCond = sw.isConducting;
    const isGate = sw.gateActive;

    const angle = orientation === 'down' ? 90 : orientation === 'up' ? -90 : 0;
    const transform = `translate(${x}, ${y}) rotate(${angle})`;

    return (
      <g
        className="cursor-pointer transition-transform duration-150 group"
        onClick={() => onSelectComponent(id as ComponentId)}
      >
        {/* Click hotspot */}
        <circle
          cx={x}
          cy={y}
          r="32"
          fill="transparent"
          className="hover:stroke-amber-400/40 hover:stroke-2"
        />

        {/* Selected Halo */}
        {isSelected && (
          <circle
            cx={x}
            cy={y}
            r="28"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeDasharray="4,4"
            className="animate-pulse"
          />
        )}

        {/* Component Symbol Group */}
        <g transform={transform}>
          {/* Main Anode to Cathode Triangle */}
          <polygon
            points="-14,-14 -14,14 14,0"
            fill={isCond ? 'rgba(16, 185, 129, 0.25)' : 'rgba(30, 41, 59, 0.8)'}
            stroke={isCond ? '#10B981' : isSelected ? '#F59E0B' : '#94A3B8'}
            strokeWidth={isCond ? '2.5' : '2'}
            strokeLinejoin="round"
          />
          {/* Cathode Bar */}
          <line
            x1="14"
            y1="-14"
            x2="14"
            y2="14"
            stroke={isCond ? '#10B981' : isSelected ? '#F59E0B' : '#94A3B8'}
            strokeWidth={isCond ? '3' : '2'}
          />

          {/* Thyristor Gate Terminal */}
          {isThyristor && (
            <g>
              <line
                x1="4"
                y1="5"
                x2="-6"
                y2="20"
                stroke={isGate ? '#F59E0B' : '#94A3B8'}
                strokeWidth={isGate ? '2.5' : '1.5'}
              />
              <circle
                cx="-6"
                cy="20"
                r="2.5"
                fill={isGate ? '#F59E0B' : '#64748B'}
              />
              {isGate && (
                <circle
                  cx="-6"
                  cy="20"
                  r="5"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  className="animate-ping"
                />
              )}
            </g>
          )}
        </g>

        {/* Label and Live Status Badge */}
        <text
          x={x + (orientation === 'right' ? 0 : 28)}
          y={y - 8}
          textAnchor="start"
          className="text-[11px] font-mono font-semibold fill-slate-200 select-none group-hover:fill-amber-400"
        >
          {label}
        </text>

        <text
          x={x + (orientation === 'right' ? 0 : 28)}
          y={y + 8}
          textAnchor="start"
          className={`text-[9px] font-mono select-none ${
            isCond
              ? 'fill-emerald-400 font-bold'
              : sw.isForwardBlocking
              ? 'fill-amber-400'
              : 'fill-rose-400'
          }`}
        >
          {isCond
            ? 'ON (0.7V)'
            : `${sw.voltage.toFixed(0)}V ${sw.isReverseBlocking ? 'PIV' : 'BLK'}`}
        </text>

        {/* Active Probe Pin Overlay */}
        {isSelected && (
          <g transform={`translate(${x - 30}, ${y - 24})`}>
            <rect
              x="0"
              y="0"
              width="24"
              height="14"
              rx="3"
              fill="#EF4444"
              stroke="#B91C1C"
              strokeWidth="1"
            />
            <text
              x="12"
              y="10"
              textAnchor="middle"
              className="text-[8px] font-mono font-bold fill-white select-none"
            >
              PROBE
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden select-none">
      {/* Schematic Top Ribbon */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs font-mono font-semibold tracking-wider text-slate-200 uppercase">
            Schematic Circuit Diagram
          </span>
          <span className="text-xs font-mono text-slate-500">·</span>
          <span className="text-xs font-mono text-cyan-400">
            {phase === 'single' ? '1Φ Single-Phase' : '3Φ Three-Phase'}{' '}
            {rectifierType === 'diode' ? 'Diode Bridge' : 'SCR Thyristor Bridge'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400">Probed:</span>
          <span className="px-2 py-0.5 text-xs font-mono font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded">
            {selectedComponent.toUpperCase()}
          </span>
        </div>
      </div>

      {/* SVG Circuit Canvas Area */}
      <div className="relative flex-1 bg-slate-950/70 p-2 overflow-auto flex items-center justify-center min-h-[360px]">
        {/* Subtle Engineering Grid background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle, #334155 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {phase === 'single' ? (
          /* ================= SINGLE PHASE BRIDGE SCHEMATIC ================= */
          <svg
            viewBox="0 0 680 400"
            className="w-full max-w-[680px] h-auto drop-shadow-md"
            style={{ minHeight: '340px' }}
          >
            <defs>
              {/* Animated Current Dash patterns */}
              <style>{`
                .current-flow {
                  stroke-dasharray: 8 6;
                  animation: dash 1s linear infinite;
                }
                @keyframes dash {
                  to {
                    stroke-dashoffset: -28;
                  }
                }
              `}</style>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="5"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10B981" />
              </marker>
            </defs>

            {/* --- AC SOURCE BLOCK (LEFT) --- */}
            <g
              className="cursor-pointer group"
              onClick={() => onSelectComponent('source')}
            >
              <circle
                cx="80"
                cy="200"
                r="28"
                fill="rgba(15, 23, 42, 0.9)"
                stroke={selectedComponent === 'source' ? '#F59E0B' : '#38BDF8'}
                strokeWidth={selectedComponent === 'source' ? '3' : '2'}
              />
              {/* AC Sine wave symbol */}
              <path
                d="M 66 200 Q 73 186 80 200 T 94 200"
                fill="none"
                stroke={selectedComponent === 'source' ? '#F59E0B' : '#38BDF8'}
                strokeWidth="2.5"
              />
              <text
                x="80"
                y="160"
                textAnchor="middle"
                className="text-[12px] font-mono font-bold fill-sky-400 select-none group-hover:fill-amber-400"
              >
                AC Supply (vₛ)
              </text>
              <text
                x="80"
                y="242"
                textAnchor="middle"
                className="text-[10px] font-mono fill-slate-400 select-none"
              >
                {currentState.vSource.toFixed(1)} V
              </text>

              {/* Source Probe Indicator */}
              {selectedComponent === 'source' && (
                <rect
                  x="68"
                  y="126"
                  width="24"
                  height="12"
                  rx="2"
                  fill="#EF4444"
                />
              )}
            </g>

            {/* --- CONNECTING BUSES & WIRES --- */}
            {/* Source top wire (Phase A / Line) to Node 1 */}
            <line
              x1="80"
              y1="172"
              x2="80"
              y2="130"
              stroke="#475569"
              strokeWidth="2"
            />
            <line
              x1="80"
              y1="130"
              x2="220"
              y2="130"
              stroke="#475569"
              strokeWidth="2"
            />
            <line
              x1="220"
              y1="130"
              x2="220"
              y2="200"
              stroke="#475569"
              strokeWidth="2"
            />

            {/* Source bottom wire (Neutral / Return) to Node 2 */}
            <line
              x1="80"
              y1="228"
              x2="80"
              y2="270"
              stroke="#475569"
              strokeWidth="2"
            />
            <line
              x1="80"
              y1="270"
              x2="340"
              y2="270"
              stroke="#475569"
              strokeWidth="2"
            />
            <line
              x1="340"
              y1="270"
              x2="340"
              y2="200"
              stroke="#475569"
              strokeWidth="2"
            />

            {/* Animated Current Path for AC Positive Half (Source -> D1 -> Load -> D2 -> Source) */}
            {currentState.vSource > 2 && (
              <path
                d="M 80 172 L 80 130 L 220 130 L 220 110 L 280 60 L 510 60 L 510 200 L 510 340 L 280 340 L 340 290 L 340 270 L 80 270 L 80 228"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                className="current-flow opacity-85"
              />
            )}

            {/* Animated Current Path for AC Negative Half (Source -> D3 -> Load -> D4 -> Source) */}
            {currentState.vSource < -2 && (
              <path
                d="M 80 228 L 80 270 L 340 270 L 340 290 L 280 340 L 510 340 L 510 200 L 510 60 L 280 60 L 220 110 L 220 130 L 80 130 L 80 172"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                className="current-flow opacity-85"
              />
            )}

            {/* --- RECTIFIER BRIDGE DIAMOND LEGS --- */}
            {/* Top Bus (Cathode Common -> V+) */}
            <line
              x1="220"
              y1="60"
              x2="340"
              y2="60"
              stroke="#475569"
              strokeWidth="2"
            />
            <line
              x1="280"
              y1="60"
              x2="510"
              y2="60"
              stroke="#475569"
              strokeWidth="2.5"
            />
            <circle cx="280" cy="60" r="3.5" fill="#38BDF8" />

            {/* Bottom Bus (Anode Common -> V-) */}
            <line
              x1="220"
              y1="340"
              x2="340"
              y2="340"
              stroke="#475569"
              strokeWidth="2"
            />
            <line
              x1="280"
              y1="340"
              x2="510"
              y2="340"
              stroke="#475569"
              strokeWidth="2.5"
            />
            <circle cx="280" cy="340" r="3.5" fill="#38BDF8" />

            {/* Node 1 connection between Leg 1 switches (D1 & D4 / T1 & T4) */}
            <line
              x1="220"
              y1="60"
              x2="220"
              y2="340"
              stroke="#475569"
              strokeWidth="2"
            />
            <circle cx="220" cy="200" r="3.5" fill="#38BDF8" />

            {/* Node 2 connection between Leg 2 switches (D3 & D2 / T3 & T2) */}
            <line
              x1="340"
              y1="60"
              x2="340"
              y2="340"
              stroke="#475569"
              strokeWidth="2"
            />
            <circle cx="340" cy="200" r="3.5" fill="#38BDF8" />

            {/* DC Bus Labels */}
            <text
              x="390"
              y="52"
              className="text-[10px] font-mono font-bold fill-red-400 select-none"
            >
              DC+ (Cathode Rail)
            </text>
            <text
              x="390"
              y="355"
              className="text-[10px] font-mono font-bold fill-sky-400 select-none"
            >
              DC- (Anode Rail)
            </text>

            {/* Render 4 Switches */}
            {/* Top-Left: D1 / T1 */}
            {renderDiodeOrThyristor(
              isThyristor ? 't1' : 'd1',
              isThyristor ? 'T1' : 'D1',
              220,
              120,
              'up'
            )}

            {/* Bottom-Left: D4 / T4 */}
            {renderDiodeOrThyristor(
              isThyristor ? 't4' : 'd4',
              isThyristor ? 'T4' : 'D4',
              220,
              280,
              'up'
            )}

            {/* Top-Right: D3 / T3 */}
            {renderDiodeOrThyristor(
              isThyristor ? 't3' : 'd3',
              isThyristor ? 'T3' : 'D3',
              340,
              120,
              'up'
            )}

            {/* Bottom-Right: D2 / T2 */}
            {renderDiodeOrThyristor(
              isThyristor ? 't2' : 'd2',
              isThyristor ? 'T2' : 'D2',
              340,
              280,
              'up'
            )}

            {/* --- LOAD STAGE (RIGHT) --- */}
            {isCurrentLoad ? (
              /* CONSTANT CURRENT LOAD SINK (I_0) */
              <g
                className="cursor-pointer group"
                onClick={() => onSelectComponent('current_source')}
              >
                <rect
                  x="475"
                  y="100"
                  width="135"
                  height="200"
                  rx="6"
                  fill="rgba(15, 23, 42, 0.75)"
                  stroke={selectedComponent === 'current_source' || selectedComponent === 'load' ? '#F59E0B' : '#334155'}
                  strokeWidth={selectedComponent === 'current_source' || selectedComponent === 'load' ? '2.5' : '1.5'}
                  className="hover:stroke-cyan-400"
                />
                <line x1="510" y1="60" x2="510" y2="135" stroke="#475569" strokeWidth="2.5" />
                
                {/* Dual Circle / Current Source Symbol */}
                <circle cx="510" cy="170" r="24" fill="rgba(30, 41, 59, 0.8)" stroke="#38BDF8" strokeWidth="2.5" />
                {/* Current Arrow inside circle */}
                <path d="M 510 156 L 510 184 M 504 176 L 510 184 L 516 176" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                
                <text x="548" y="166" className="text-[11px] font-mono font-bold fill-cyan-300 select-none">
                  I₀ Sink
                </text>
                <text x="548" y="182" className="text-[11px] font-mono font-bold fill-white select-none">
                  {params.constantCurrent || 10} A
                </text>
                <text x="510" y="240" textAnchor="middle" className="text-[10px] font-mono font-bold fill-amber-300 select-none">
                  V_load: {currentState.vLoad.toFixed(1)} V
                </text>
                <text x="510" y="258" textAnchor="middle" className="text-[9px] font-mono fill-emerald-400 select-none">
                  I_load: {currentState.iLoad.toFixed(1)} A
                </text>

                <line x1="510" y1="205" x2="510" y2="340" stroke="#475569" strokeWidth="2.5" />

                {(selectedComponent === 'current_source' || selectedComponent === 'load') && (
                  <rect x="578" y="106" width="26" height="12" rx="2" fill="#EF4444" />
                )}
              </g>
            ) : isRLE ? (
              /* R-L-E LOAD: Series Inductor + Resistor + Back EMF Battery */
              <g>
                <rect
                  x="475"
                  y="75"
                  width="140"
                  height="255"
                  rx="6"
                  fill="rgba(15, 23, 42, 0.7)"
                  stroke={selectedComponent === 'load' ? '#F59E0B' : '#334155'}
                  strokeWidth={selectedComponent === 'load' ? '2.5' : '1.5'}
                  strokeDasharray={selectedComponent === 'load' ? 'none' : '4 4'}
                  className="cursor-pointer hover:stroke-amber-400/80"
                  onClick={() => onSelectComponent('load')}
                />
                <text
                  x="545"
                  y="68"
                  textAnchor="middle"
                  className="text-[11px] font-mono font-bold fill-amber-300 cursor-pointer select-none"
                  onClick={() => onSelectComponent('load')}
                >
                  RLE Load ({currentState.vLoad.toFixed(1)}V)
                </text>

                <line x1="510" y1="60" x2="510" y2="85" stroke="#475569" strokeWidth="2.5" />

                {/* 1. Inductor L */}
                <g className="cursor-pointer group" onClick={() => onSelectComponent('ind')}>
                  <rect
                    x="482"
                    y="85"
                    width="126"
                    height="68"
                    rx="4"
                    fill={selectedComponent === 'ind' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(30, 41, 59, 0.4)'}
                    stroke={selectedComponent === 'ind' ? '#F59E0B' : 'transparent'}
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 506 90 C 490 96, 490 106, 506 108 C 490 114, 490 124, 506 126 C 490 132, 490 142, 506 144 L 506 150"
                    fill="none"
                    stroke={selectedComponent === 'ind' ? '#F59E0B' : '#38BDF8'}
                    strokeWidth="2.5"
                  />
                  <text x="518" y="112" className="text-[10px] font-mono font-bold fill-cyan-300 select-none">
                    L: {(params.inductance * 1000).toFixed(0)}mH
                  </text>
                  <text x="518" y="128" className="text-[9px] font-mono fill-slate-300 select-none">
                    v_L: {currentState.vInd.toFixed(1)}V
                  </text>
                  {selectedComponent === 'ind' && (
                    <rect x="578" y="88" width="24" height="11" rx="2" fill="#EF4444" />
                  )}
                </g>

                <line x1="506" y1="150" x2="506" y2="160" stroke="#475569" strokeWidth="2" />

                {/* 2. Resistor R */}
                <g className="cursor-pointer group" onClick={() => onSelectComponent('load_r')}>
                  <rect
                    x="482"
                    y="158"
                    width="126"
                    height="68"
                    rx="4"
                    fill={selectedComponent === 'load_r' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(30, 41, 59, 0.4)'}
                    stroke={selectedComponent === 'load_r' ? '#F59E0B' : 'transparent'}
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 506 162 L 506 170 L 512 174 L 500 182 L 512 190 L 500 198 L 512 206 L 506 210 L 506 220"
                    fill="none"
                    stroke={selectedComponent === 'load_r' ? '#F59E0B' : '#F8FAFC'}
                    strokeWidth="2"
                  />
                  <text x="518" y="184" className="text-[10px] font-mono font-bold fill-slate-200 select-none">
                    R: {params.resistance}Ω
                  </text>
                  <text x="518" y="200" className="text-[9px] font-mono fill-emerald-400 select-none">
                    v_R: {currentState.vRes.toFixed(1)}V
                  </text>
                  {selectedComponent === 'load_r' && (
                    <rect x="578" y="161" width="24" height="11" rx="2" fill="#EF4444" />
                  )}
                </g>

                <line x1="506" y1="220" x2="506" y2="232" stroke="#475569" strokeWidth="2" />

                {/* 3. Back EMF / Battery Source E */}
                <g className="cursor-pointer group" onClick={() => onSelectComponent('emf')}>
                  <rect
                    x="482"
                    y="232"
                    width="126"
                    height="75"
                    rx="4"
                    fill={selectedComponent === 'emf' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(30, 41, 59, 0.4)'}
                    stroke={selectedComponent === 'emf' ? '#F59E0B' : 'transparent'}
                    strokeWidth="1.5"
                  />
                  {/* Battery Plates symbol */}
                  <line x1="494" y1="250" x2="518" y2="250" stroke="#F59E0B" strokeWidth="3" />
                  <line x1="499" y1="258" x2="513" y2="258" stroke="#38BDF8" strokeWidth="2.5" />
                  <text x="487" y="249" className="text-[9px] font-mono font-bold fill-amber-400 select-none">+</text>
                  <text x="492" y="267" className="text-[9px] font-mono font-bold fill-sky-400 select-none">-</text>

                  <text x="522" y="254" className="text-[10px] font-mono font-bold fill-amber-400 select-none">
                    E: {params.emfVoltage || 48}V
                  </text>
                  <text x="522" y="270" className="text-[9px] font-mono fill-slate-300 select-none">
                    v_E = {(currentState.vEmf || 48).toFixed(1)}V
                  </text>
                  <text x="522" y="284" className="text-[9px] font-mono fill-emerald-400 select-none">
                    I_o: {currentState.iLoad.toFixed(2)}A
                  </text>
                  {selectedComponent === 'emf' && (
                    <rect x="578" y="235" width="24" height="11" rx="2" fill="#EF4444" />
                  )}
                </g>

                <line x1="506" y1="307" x2="506" y2="340" stroke="#475569" strokeWidth="2.5" />
              </g>
            ) : isRL ? (
              /* RL Series Load: Inductor L in series with Resistor R */
              <g>
                <rect
                  x="475"
                  y="85"
                  width="135"
                  height="235"
                  rx="6"
                  fill="rgba(15, 23, 42, 0.7)"
                  stroke={selectedComponent === 'load' ? '#F59E0B' : '#334155'}
                  strokeWidth={selectedComponent === 'load' ? '2.5' : '1.5'}
                  strokeDasharray={selectedComponent === 'load' ? 'none' : '4 4'}
                  className="cursor-pointer hover:stroke-amber-400/80"
                  onClick={() => onSelectComponent('load')}
                />
                <text
                  x="542"
                  y="76"
                  textAnchor="middle"
                  className="text-[11px] font-mono font-bold fill-amber-300 cursor-pointer select-none"
                  onClick={() => onSelectComponent('load')}
                >
                  RL Load (Vₒ = {currentState.vLoad.toFixed(1)}V)
                </text>

                <line x1="510" y1="60" x2="510" y2="95" stroke="#475569" strokeWidth="2.5" />

                {/* 1. INDUCTOR CHOKE (L) */}
                <g className="cursor-pointer group" onClick={() => onSelectComponent('ind')}>
                  <rect
                    x="485"
                    y="95"
                    width="115"
                    height="85"
                    rx="4"
                    fill={selectedComponent === 'ind' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(30, 41, 59, 0.5)'}
                    stroke={selectedComponent === 'ind' ? '#F59E0B' : 'transparent'}
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 510 98 C 490 106, 490 118, 510 120 C 490 128, 490 140, 510 142 C 490 150, 490 162, 510 164 L 510 178"
                    fill="none"
                    stroke={selectedComponent === 'ind' ? '#F59E0B' : '#38BDF8'}
                    strokeWidth="2.5"
                  />
                  <text x="525" y="126" className="text-[10px] font-mono font-bold fill-cyan-300 select-none group-hover:fill-amber-400">
                    L: {(params.inductance * 1000).toFixed(0)}mH
                  </text>
                  <text x="525" y="144" className="text-[9px] font-mono fill-slate-300 select-none">
                    v_L: {currentState.vInd.toFixed(1)}V
                  </text>
                  {selectedComponent === 'ind' && (
                    <rect x="568" y="98" width="26" height="12" rx="2" fill="#EF4444" />
                  )}
                </g>

                <line x1="510" y1="178" x2="510" y2="195" stroke="#475569" strokeWidth="2.5" />
                <circle cx="510" cy="186" r="2.5" fill="#38BDF8" />

                {/* 2. LOAD RESISTOR (R) */}
                <g className="cursor-pointer group" onClick={() => onSelectComponent('load_r')}>
                  <rect
                    x="485"
                    y="190"
                    width="115"
                    height="95"
                    rx="4"
                    fill={selectedComponent === 'load_r' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(30, 41, 59, 0.5)'}
                    stroke={selectedComponent === 'load_r' ? '#F59E0B' : 'transparent'}
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 510 195 L 510 205 L 518 210 L 502 220 L 518 230 L 502 240 L 518 250 L 502 260 L 510 265 L 510 280"
                    fill="none"
                    stroke={selectedComponent === 'load_r' ? '#F59E0B' : '#F8FAFC'}
                    strokeWidth="2"
                  />
                  <text x="525" y="228" className="text-[10px] font-mono font-bold fill-slate-200 select-none group-hover:fill-amber-400">
                    R: {params.resistance}Ω
                  </text>
                  <text x="525" y="246" className="text-[9px] font-mono fill-emerald-400 select-none">
                    v_R: {currentState.vRes.toFixed(1)}V
                  </text>
                  <text x="525" y="262" className="text-[9px] font-mono fill-slate-400 select-none">
                    I_o: {currentState.iLoad.toFixed(2)}A
                  </text>
                  {selectedComponent === 'load_r' && (
                    <rect x="568" y="195" width="26" height="12" rx="2" fill="#EF4444" />
                  )}
                </g>

                <line x1="510" y1="280" x2="510" y2="340" stroke="#475569" strokeWidth="2.5" />
              </g>
            ) : (
              /* Pure Resistive (R) or RC Load */
              <g
                className="cursor-pointer group"
                onClick={() => onSelectComponent('load')}
              >
                <rect
                  x="480"
                  y="110"
                  width="60"
                  height="180"
                  rx="6"
                  fill="rgba(15, 23, 42, 0.8)"
                  stroke={selectedComponent === 'load' ? '#F59E0B' : '#475569'}
                  strokeWidth={selectedComponent === 'load' ? '2.5' : '1.5'}
                  className="hover:stroke-amber-400/80"
                />

                <path
                  d="M 510 130 L 510 150 L 522 155 L 498 165 L 522 175 L 498 185 L 522 195 L 498 205 L 510 210 L 510 230"
                  fill="none"
                  stroke="#F8FAFC"
                  strokeWidth="2"
                />

                <text x="510" y="250" textAnchor="middle" className="text-[11px] font-mono font-bold fill-slate-200 select-none group-hover:fill-amber-400">
                  R ({params.resistance}Ω)
                </text>
                <text x="510" y="95" textAnchor="middle" className="text-[12px] font-mono font-bold fill-amber-300 select-none">
                  V_load ({currentState.vLoad.toFixed(1)}V)
                </text>
                <text x="510" y="275" textAnchor="middle" className="text-[10px] font-mono fill-emerald-400 select-none">
                  I_load ({currentState.iLoad.toFixed(2)}A)
                </text>

                {selectedComponent === 'load' && (
                  <rect x="498" y="66" width="24" height="12" rx="2" fill="#EF4444" />
                )}
              </g>
            )}

            {/* Optional Filter Capacitor (RC) */}
            {loadType === 'RC' && (
              <g className="cursor-pointer group" onClick={() => onSelectComponent('cap')}>
                <line x1="430" y1="60" x2="430" y2="185" stroke="#475569" strokeWidth="2" />
                <line x1="416" y1="185" x2="444" y2="185" stroke="#38BDF8" strokeWidth="3" />
                <line x1="416" y1="195" x2="444" y2="195" stroke="#38BDF8" strokeWidth="3" />
                <line x1="430" y1="195" x2="430" y2="340" stroke="#475569" strokeWidth="2" />
                <text x="430" y="225" textAnchor="middle" className="text-[10px] font-mono font-bold fill-cyan-400 select-none">
                  C (Filter)
                </text>
              </g>
            )}

            {/* FREEWHEELING DIODE (D_FW) BRANCH */}
            {isFWD && (
              <g className="cursor-pointer group" onClick={() => onSelectComponent('fwd')}>
                <line x1="430" y1="60" x2="430" y2="175" stroke="#475569" strokeWidth="2" />
                {renderDiodeOrThyristor('fwd', 'D_FW', 430, 200, 'up')}
                <line x1="430" y1="225" x2="430" y2="340" stroke="#475569" strokeWidth="2" />
                {currentState.iFwd && currentState.iFwd > 0.05 ? (
                  <circle cx="430" cy="200" r="26" fill="none" stroke="#10B981" strokeWidth="2" className="animate-ping opacity-60" />
                ) : null}
              </g>
            )}

            {/* Ground reference indicator */}
            <g transform="translate(510, 340)">
              <line x1="0" y1="0" x2="0" y2="16" stroke="#475569" strokeWidth="2" />
              <line x1="-12" y1="16" x2="12" y2="16" stroke="#475569" strokeWidth="2" />
              <line x1="-8" y1="20" x2="8" y2="20" stroke="#475569" strokeWidth="1.5" />
              <line x1="-4" y1="24" x2="4" y2="24" stroke="#475569" strokeWidth="1" />
            </g>
          </svg>
        ) : (
          /* ================= THREE-PHASE 6-PULSE BRIDGE SCHEMATIC ================= */
          <svg
            viewBox="0 0 740 420"
            className="w-full max-w-[740px] h-auto drop-shadow-md"
            style={{ minHeight: '360px' }}
          >
            <defs>
              <style>{`
                .current-flow-3p {
                  stroke-dasharray: 8 6;
                  animation: dash 1s linear infinite;
                }
              `}</style>
            </defs>

            {/* --- 3-PHASE AC SOURCE TERMINALS (LEFT) --- */}
            {/* Phase A */}
            <g
              className="cursor-pointer group"
              onClick={() => onSelectComponent('source_a')}
            >
              <circle
                cx="50"
                cy="120"
                r="18"
                fill="rgba(15, 23, 42, 0.9)"
                stroke={selectedComponent === 'source_a' ? '#F59E0B' : '#EF4444'}
                strokeWidth="2"
              />
              <text
                x="50"
                y="124"
                textAnchor="middle"
                className="text-[10px] font-mono font-bold fill-red-400 select-none"
              >
                A
              </text>
              <text
                x="50"
                y="95"
                textAnchor="middle"
                className="text-[9px] font-mono fill-slate-300 select-none"
              >
                {currentState.vPhaseA.toFixed(0)}V
              </text>
            </g>

            {/* Phase B */}
            <g
              className="cursor-pointer group"
              onClick={() => onSelectComponent('source_b')}
            >
              <circle
                cx="50"
                cy="200"
                r="18"
                fill="rgba(15, 23, 42, 0.9)"
                stroke={selectedComponent === 'source_b' ? '#F59E0B' : '#F59E0B'}
                strokeWidth="2"
              />
              <text
                x="50"
                y="204"
                textAnchor="middle"
                className="text-[10px] font-mono font-bold fill-amber-400 select-none"
              >
                B
              </text>
              <text
                x="50"
                y="175"
                textAnchor="middle"
                className="text-[9px] font-mono fill-slate-300 select-none"
              >
                {currentState.vPhaseB.toFixed(0)}V
              </text>
            </g>

            {/* Phase C */}
            <g
              className="cursor-pointer group"
              onClick={() => onSelectComponent('source_c')}
            >
              <circle
                cx="50"
                cy="280"
                r="18"
                fill="rgba(15, 23, 42, 0.9)"
                stroke={selectedComponent === 'source_c' ? '#F59E0B' : '#38BDF8'}
                strokeWidth="2"
              />
              <text
                x="50"
                y="284"
                textAnchor="middle"
                className="text-[10px] font-mono font-bold fill-sky-400 select-none"
              >
                C
              </text>
              <text
                x="50"
                y="255"
                textAnchor="middle"
                className="text-[9px] font-mono fill-slate-300 select-none"
              >
                {currentState.vPhaseC.toFixed(0)}V
              </text>
            </g>

            {/* Connecting lines from AC terminals to vertical legs */}
            {/* Phase A line -> Leg 1 (x=170) */}
            <line
              x1="68"
              y1="120"
              x2="170"
              y2="120"
              stroke="#EF4444"
              strokeWidth="2"
              opacity="0.8"
            />
            {/* Phase B line -> Leg 2 (x=280) */}
            <line
              x1="68"
              y1="200"
              x2="280"
              y2="200"
              stroke="#F59E0B"
              strokeWidth="2"
              opacity="0.8"
            />
            {/* Phase C line -> Leg 3 (x=390) */}
            <line
              x1="68"
              y1="280"
              x2="390"
              y2="280"
              stroke="#38BDF8"
              strokeWidth="2"
              opacity="0.8"
            />

            {/* Positive DC Bus (Top Rail, y=50) */}
            <line
              x1="170"
              y1="50"
              x2="590"
              y2="50"
              stroke="#EF4444"
              strokeWidth="3"
            />
            <text
              x="450"
              y="42"
              className="text-[10px] font-mono font-bold fill-red-400 select-none"
            >
              DC+ (Positive Bus)
            </text>

            {/* Negative DC Bus (Bottom Rail, y=350) */}
            <line
              x1="170"
              y1="350"
              x2="590"
              y2="350"
              stroke="#38BDF8"
              strokeWidth="3"
            />
            <text
              x="450"
              y="366"
              className="text-[10px] font-mono font-bold fill-sky-400 select-none"
            >
              DC- (Negative Bus)
            </text>

            {/* Vertical Leg 1 (Phase A: D1 top, D4 bottom) */}
            <line x1="170" y1="50" x2="170" y2="350" stroke="#475569" strokeWidth="2" />
            <circle cx="170" cy="120" r="3.5" fill="#EF4444" />

            {/* Vertical Leg 2 (Phase B: D3 top, D6 bottom) */}
            <line x1="280" y1="50" x2="280" y2="350" stroke="#475569" strokeWidth="2" />
            <circle cx="280" cy="200" r="3.5" fill="#F59E0B" />

            {/* Vertical Leg 3 (Phase C: D5 top, D2 bottom) */}
            <line x1="390" y1="50" x2="390" y2="350" stroke="#475569" strokeWidth="2" />
            <circle cx="390" cy="280" r="3.5" fill="#38BDF8" />

            {/* --- SWITCHES (6 VALVE 3-PHASE RECTIFIER) --- */}
            {/* Top Row: D1, D3, D5 (or T1, T3, T5) */}
            {renderDiodeOrThyristor(
              isThyristor ? 't1' : 'd1',
              isThyristor ? 'T1' : 'D1',
              170,
              85,
              'up'
            )}
            {renderDiodeOrThyristor(
              isThyristor ? 't3' : 'd3',
              isThyristor ? 'T3' : 'D3',
              280,
              85,
              'up'
            )}
            {renderDiodeOrThyristor(
              isThyristor ? 't5' : 'd5',
              isThyristor ? 'T5' : 'D5',
              390,
              85,
              'up'
            )}

            {/* Bottom Row: D4, D6, D2 (or T4, T6, T2) */}
            {renderDiodeOrThyristor(
              isThyristor ? 't4' : 'd4',
              isThyristor ? 'T4' : 'D4',
              170,
              315,
              'up'
            )}
            {renderDiodeOrThyristor(
              isThyristor ? 't6' : 'd6',
              isThyristor ? 'T6' : 'D6',
              280,
              315,
              'up'
            )}
            {renderDiodeOrThyristor(
              isThyristor ? 't2' : 'd2',
              isThyristor ? 'T2' : 'D2',
              390,
              315,
              'up'
            )}

            {/* Animated Conduction Trail on Active Leg */}
            {currentState.vLoad > 1 && (
              <path
                d="M 590 50 L 590 200 L 590 350"
                fill="none"
                stroke="#10B981"
                strokeWidth="2.5"
                className="current-flow-3p opacity-75"
              />
            )}

            {/* --- 3-PHASE LOAD STAGE --- */}
            {isCurrentLoad ? (
              /* CONSTANT CURRENT LOAD SINK (I_0) - 3-PHASE */
              <g
                className="cursor-pointer group"
                onClick={() => onSelectComponent('current_source')}
              >
                <rect
                  x="545"
                  y="95"
                  width="145"
                  height="215"
                  rx="6"
                  fill="rgba(15, 23, 42, 0.75)"
                  stroke={selectedComponent === 'current_source' || selectedComponent === 'load' ? '#F59E0B' : '#334155'}
                  strokeWidth={selectedComponent === 'current_source' || selectedComponent === 'load' ? '2.5' : '1.5'}
                  className="hover:stroke-cyan-400"
                />
                <line x1="590" y1="50" x2="590" y2="135" stroke="#475569" strokeWidth="2.5" />

                {/* Dual Circle / Current Source Symbol */}
                <circle cx="590" cy="170" r="26" fill="rgba(30, 41, 59, 0.85)" stroke="#38BDF8" strokeWidth="2.5" />
                <path d="M 590 154 L 590 186 M 583 177 L 590 186 L 597 177" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                <text x="632" y="165" className="text-[11px] font-mono font-bold fill-cyan-300 select-none">
                  I₀ Sink
                </text>
                <text x="632" y="182" className="text-[12px] font-mono font-bold fill-white select-none">
                  {params.constantCurrent || 10} A
                </text>
                <text x="590" y="242" textAnchor="middle" className="text-[11px] font-mono font-bold fill-amber-300 select-none">
                  V_load: {currentState.vLoad.toFixed(1)} V
                </text>
                <text x="590" y="260" textAnchor="middle" className="text-[10px] font-mono fill-emerald-400 select-none">
                  I_load: {currentState.iLoad.toFixed(1)} A
                </text>

                <line x1="590" y1="205" x2="590" y2="350" stroke="#475569" strokeWidth="2.5" />

                {(selectedComponent === 'current_source' || selectedComponent === 'load') && (
                  <rect x="655" y="102" width="26" height="12" rx="2" fill="#EF4444" />
                )}
              </g>
            ) : isRLE ? (
              /* R-L-E LOAD: Series Inductor + Resistor + Back EMF Battery (3-PHASE) */
              <g>
                <rect
                  x="545"
                  y="75"
                  width="145"
                  height="265"
                  rx="6"
                  fill="rgba(15, 23, 42, 0.7)"
                  stroke={selectedComponent === 'load' ? '#F59E0B' : '#334155'}
                  strokeWidth={selectedComponent === 'load' ? '2.5' : '1.5'}
                  strokeDasharray={selectedComponent === 'load' ? 'none' : '4 4'}
                  className="cursor-pointer hover:stroke-amber-400/80"
                  onClick={() => onSelectComponent('load')}
                />
                <text
                  x="617"
                  y="68"
                  textAnchor="middle"
                  className="text-[11px] font-mono font-bold fill-amber-300 cursor-pointer select-none"
                  onClick={() => onSelectComponent('load')}
                >
                  3Φ RLE Load ({currentState.vLoad.toFixed(1)}V)
                </text>

                <line x1="590" y1="50" x2="590" y2="85" stroke="#475569" strokeWidth="2.5" />

                {/* 1. Inductor L */}
                <g className="cursor-pointer group" onClick={() => onSelectComponent('ind')}>
                  <rect
                    x="555"
                    y="85"
                    width="125"
                    height="68"
                    rx="4"
                    fill={selectedComponent === 'ind' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(30, 41, 59, 0.4)'}
                    stroke={selectedComponent === 'ind' ? '#F59E0B' : 'transparent'}
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 580 90 C 564 96, 564 106, 580 108 C 564 114, 564 124, 580 126 C 564 132, 564 142, 580 144 L 580 150"
                    fill="none"
                    stroke={selectedComponent === 'ind' ? '#F59E0B' : '#38BDF8'}
                    strokeWidth="2.5"
                  />
                  <text x="592" y="112" className="text-[10px] font-mono font-bold fill-cyan-300 select-none">
                    L: {(params.inductance * 1000).toFixed(0)}mH
                  </text>
                  <text x="592" y="128" className="text-[9px] font-mono fill-slate-300 select-none">
                    v_L: {currentState.vInd.toFixed(1)}V
                  </text>
                  {selectedComponent === 'ind' && (
                    <rect x="650" y="88" width="24" height="11" rx="2" fill="#EF4444" />
                  )}
                </g>

                <line x1="580" y1="150" x2="580" y2="160" stroke="#475569" strokeWidth="2" />

                {/* 2. Resistor R */}
                <g className="cursor-pointer group" onClick={() => onSelectComponent('load_r')}>
                  <rect
                    x="555"
                    y="158"
                    width="125"
                    height="68"
                    rx="4"
                    fill={selectedComponent === 'load_r' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(30, 41, 59, 0.4)'}
                    stroke={selectedComponent === 'load_r' ? '#F59E0B' : 'transparent'}
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 580 162 L 580 170 L 586 174 L 574 182 L 586 190 L 574 198 L 586 206 L 580 210 L 580 220"
                    fill="none"
                    stroke={selectedComponent === 'load_r' ? '#F59E0B' : '#F8FAFC'}
                    strokeWidth="2"
                  />
                  <text x="592" y="184" className="text-[10px] font-mono font-bold fill-slate-200 select-none">
                    R: {params.resistance}Ω
                  </text>
                  <text x="592" y="200" className="text-[9px] font-mono fill-emerald-400 select-none">
                    v_R: {currentState.vRes.toFixed(1)}V
                  </text>
                  {selectedComponent === 'load_r' && (
                    <rect x="650" y="161" width="24" height="11" rx="2" fill="#EF4444" />
                  )}
                </g>

                <line x1="580" y1="220" x2="580" y2="232" stroke="#475569" strokeWidth="2" />

                {/* 3. Back EMF / Battery Source E */}
                <g className="cursor-pointer group" onClick={() => onSelectComponent('emf')}>
                  <rect
                    x="555"
                    y="232"
                    width="125"
                    height="75"
                    rx="4"
                    fill={selectedComponent === 'emf' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(30, 41, 59, 0.4)'}
                    stroke={selectedComponent === 'emf' ? '#F59E0B' : 'transparent'}
                    strokeWidth="1.5"
                  />
                  <line x1="568" y1="250" x2="592" y2="250" stroke="#F59E0B" strokeWidth="3" />
                  <line x1="573" y1="258" x2="587" y2="258" stroke="#38BDF8" strokeWidth="2.5" />
                  <text x="561" y="249" className="text-[9px] font-mono font-bold fill-amber-400 select-none">+</text>
                  <text x="566" y="267" className="text-[9px] font-mono font-bold fill-sky-400 select-none">-</text>

                  <text x="596" y="254" className="text-[10px] font-mono font-bold fill-amber-400 select-none">
                    E: {params.emfVoltage || 48}V
                  </text>
                  <text x="596" y="270" className="text-[9px] font-mono fill-slate-300 select-none">
                    v_E = {(currentState.vEmf || 48).toFixed(1)}V
                  </text>
                  <text x="596" y="284" className="text-[9px] font-mono fill-emerald-400 select-none">
                    I_o: {currentState.iLoad.toFixed(2)}A
                  </text>
                  {selectedComponent === 'emf' && (
                    <rect x="650" y="235" width="24" height="11" rx="2" fill="#EF4444" />
                  )}
                </g>

                <line x1="580" y1="307" x2="580" y2="350" stroke="#475569" strokeWidth="2.5" />
              </g>
            ) : isRL ? (
              <g>
                {/* Total Load Boundary / Header */}
                <rect
                  x="545"
                  y="85"
                  width="145"
                  height="240"
                  rx="6"
                  fill="rgba(15, 23, 42, 0.7)"
                  stroke={selectedComponent === 'load' ? '#F59E0B' : '#334155'}
                  strokeWidth={selectedComponent === 'load' ? '2.5' : '1.5'}
                  strokeDasharray={selectedComponent === 'load' ? 'none' : '4 4'}
                  className="cursor-pointer hover:stroke-amber-400/80"
                  onClick={() => onSelectComponent('load')}
                />
                <text
                  x="617"
                  y="74"
                  textAnchor="middle"
                  className="text-[11px] font-mono font-bold fill-amber-300 cursor-pointer select-none"
                  onClick={() => onSelectComponent('load')}
                >
                  3Φ RL Load (V_dc = {currentState.vLoad.toFixed(1)}V)
                </text>

                {/* Wire from Top Bus into Inductor */}
                <line x1="590" y1="50" x2="590" y2="95" stroke="#475569" strokeWidth="2.5" />

                {/* 1. INDUCTOR CHOKE (L) */}
                <g
                  className="cursor-pointer group"
                  onClick={() => onSelectComponent('ind')}
                >
                  <rect
                    x="555"
                    y="95"
                    width="125"
                    height="85"
                    rx="4"
                    fill={selectedComponent === 'ind' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(30, 41, 59, 0.5)'}
                    stroke={selectedComponent === 'ind' ? '#F59E0B' : 'transparent'}
                    strokeWidth="1.5"
                    className="hover:stroke-cyan-400"
                  />
                  <path
                    d="M 590 98 C 570 106, 570 118, 590 120 C 570 128, 570 140, 590 142 C 570 150, 570 162, 590 164 L 590 178"
                    fill="none"
                    stroke={selectedComponent === 'ind' ? '#F59E0B' : '#38BDF8'}
                    strokeWidth="2.5"
                  />
                  <text
                    x="605"
                    y="126"
                    className="text-[10px] font-mono font-bold fill-cyan-300 select-none group-hover:fill-amber-400"
                  >
                    L: {(params.inductance * 1000).toFixed(0)}mH
                  </text>
                  <text
                    x="605"
                    y="144"
                    className="text-[9px] font-mono fill-slate-300 select-none"
                  >
                    v_L: {currentState.vInd.toFixed(1)}V
                  </text>
                  {selectedComponent === 'ind' && (
                    <rect x="648" y="98" width="26" height="12" rx="2" fill="#EF4444" />
                  )}
                </g>

                {/* Series connection wire between L and R */}
                <line x1="590" y1="178" x2="590" y2="195" stroke="#475569" strokeWidth="2.5" />
                <circle cx="590" cy="186" r="2.5" fill="#38BDF8" />

                {/* 2. LOAD RESISTOR (R) */}
                <g
                  className="cursor-pointer group"
                  onClick={() => onSelectComponent('load_r')}
                >
                  <rect
                    x="555"
                    y="190"
                    width="125"
                    height="95"
                    rx="4"
                    fill={selectedComponent === 'load_r' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(30, 41, 59, 0.5)'}
                    stroke={selectedComponent === 'load_r' ? '#F59E0B' : 'transparent'}
                    strokeWidth="1.5"
                    className="hover:stroke-amber-400"
                  />
                  <path
                    d="M 590 195 L 590 205 L 598 210 L 582 220 L 598 230 L 582 240 L 598 250 L 582 260 L 590 265 L 590 280"
                    fill="none"
                    stroke={selectedComponent === 'load_r' ? '#F59E0B' : '#F8FAFC'}
                    strokeWidth="2"
                  />
                  <text
                    x="605"
                    y="228"
                    className="text-[10px] font-mono font-bold fill-slate-200 select-none group-hover:fill-amber-400"
                  >
                    R: {params.resistance}Ω
                  </text>
                  <text
                    x="605"
                    y="246"
                    className="text-[9px] font-mono fill-emerald-400 select-none"
                  >
                    v_R: {currentState.vRes.toFixed(1)}V
                  </text>
                  <text
                    x="605"
                    y="262"
                    className="text-[9px] font-mono fill-slate-400 select-none"
                  >
                    I_dc: {currentState.iLoad.toFixed(2)}A
                  </text>
                  {selectedComponent === 'load_r' && (
                    <rect x="648" y="195" width="26" height="12" rx="2" fill="#EF4444" />
                  )}
                </g>

                {/* Wire from Resistor to Bottom Bus */}
                <line x1="590" y1="280" x2="590" y2="350" stroke="#475569" strokeWidth="2.5" />
              </g>
            ) : (
              /* Pure Resistive (R) */
              <g
                className="cursor-pointer group"
                onClick={() => onSelectComponent('load')}
              >
                <rect
                  x="560"
                  y="110"
                  width="60"
                  height="180"
                  rx="6"
                  fill="rgba(15, 23, 42, 0.9)"
                  stroke={selectedComponent === 'load' ? '#F59E0B' : '#475569'}
                  strokeWidth={selectedComponent === 'load' ? '2.5' : '1.5'}
                  className="hover:stroke-amber-400/80"
                />

                <path
                  d="M 590 130 L 590 150 L 602 155 L 578 165 L 602 175 L 578 185 L 602 195 L 578 205 L 590 210 L 590 230"
                  fill="none"
                  stroke="#F8FAFC"
                  strokeWidth="2"
                />

                <text
                  x="590"
                  y="250"
                  textAnchor="middle"
                  className="text-[11px] font-mono font-bold fill-slate-200 select-none group-hover:fill-amber-400"
                >
                  R ({params.resistance}Ω)
                </text>
                <text
                  x="590"
                  y="95"
                  textAnchor="middle"
                  className="text-[12px] font-mono font-bold fill-amber-300 select-none"
                >
                  V_dc ({currentState.vLoad.toFixed(1)}V)
                </text>
                <text
                  x="590"
                  y="275"
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-emerald-400 select-none"
                >
                  I_dc ({currentState.iLoad.toFixed(2)}A)
                </text>

                {selectedComponent === 'load' && (
                  <rect
                    x="578"
                    y="66"
                    width="24"
                    height="12"
                    rx="2"
                    fill="#EF4444"
                  />
                )}
              </g>
            )}

            {/* Optional 3-Phase Filter Components */}
            {loadType === 'RC' && (
              <g
                className="cursor-pointer group"
                onClick={() => onSelectComponent('cap')}
              >
                <line x1="510" y1="50" x2="510" y2="190" stroke="#475569" strokeWidth="2" />
                <line x1="496" y1="190" x2="524" y2="190" stroke="#38BDF8" strokeWidth="3" />
                <line x1="496" y1="200" x2="524" y2="200" stroke="#38BDF8" strokeWidth="3" />
                <line x1="510" y1="200" x2="510" y2="350" stroke="#475569" strokeWidth="2" />
                <text x="510" y="230" textAnchor="middle" className="text-[10px] font-mono font-bold fill-cyan-400 select-none">
                  C (Filter)
                </text>
              </g>
            )}

            {/* Freewheeling Diode Branch in 3-Phase */}
            {isFWD && (
              <g
                className="cursor-pointer group"
                onClick={() => onSelectComponent('fwd')}
              >
                <line x1="510" y1="50" x2="510" y2="175" stroke="#475569" strokeWidth="2" />
                {renderDiodeOrThyristor('fwd', 'D_FW', 510, 200, 'up')}
                <line x1="510" y1="225" x2="510" y2="350" stroke="#475569" strokeWidth="2" />
                {currentState.iFwd && currentState.iFwd > 0.05 ? (
                  <circle cx="510" cy="200" r="26" fill="none" stroke="#10B981" strokeWidth="2" className="animate-ping opacity-60" />
                ) : null}
              </g>
            )}
          </svg>
        )}
      </div>

      {/* Interactive Quick-Probe Switcher Bar */}
      <div className="p-2.5 bg-slate-900 border-t border-slate-800 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-mono uppercase text-slate-400">
            Probe Component Selector (Click in diagram or choose below):
          </span>
          <span className="text-[11px] font-mono text-cyan-400">
            Angle: {currentState.omegaTDeg.toFixed(1)}°
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onSelectComponent('load')}
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
              selectedComponent === 'load'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isRLE
              ? 'Total RLE Load (Vₒ/Iₒ)'
              : isCurrentLoad
              ? 'Load Output (Vₒ)'
              : isRL
              ? 'Total RL Load (Vₒ/Iₒ)'
              : 'Output Load (Vₒ/Iₒ)'}
          </button>

          {(isRL || isRLE) && (
            <>
              <button
                onClick={() => onSelectComponent('load_r')}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                  selectedComponent === 'load_r'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Resistor R (v_R)
              </button>
              <button
                onClick={() => onSelectComponent('ind')}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                  selectedComponent === 'ind'
                    ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Inductor L (v_L)
              </button>
            </>
          )}

          {isRLE && (
            <button
              onClick={() => onSelectComponent('emf')}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                selectedComponent === 'emf'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Back EMF (v_E)
            </button>
          )}

          {isCurrentLoad && (
            <button
              onClick={() => onSelectComponent('current_source')}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                selectedComponent === 'current_source'
                  ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Current Sink (I₀)
            </button>
          )}

          {isFWD && (
            <button
              onClick={() => onSelectComponent('fwd')}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                selectedComponent === 'fwd'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Freewheeling Diode (FWD)
            </button>
          )}

          {loadType === 'RC' && (
            <button
              onClick={() => onSelectComponent('cap')}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                selectedComponent === 'cap'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Capacitor (C)
            </button>
          )}

          <button
            onClick={() =>
              onSelectComponent(phase === 'single' ? 'source' : 'source_a')
            }
            className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
              selectedComponent === 'source' || selectedComponent === 'source_a'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {phase === 'single' ? 'AC Source (vₛ)' : 'Phase A (v_a)'}
          </button>

          {phase === 'three' && (
            <>
              <button
                onClick={() => onSelectComponent('source_b')}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                  selectedComponent === 'source_b'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Phase B (v_b)
              </button>
              <button
                onClick={() => onSelectComponent('source_c')}
                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                  selectedComponent === 'source_c'
                    ? 'bg-sky-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Phase C (v_c)
              </button>
            </>
          )}

          {/* Switch Probes */}
          {(rectifierType === 'thyristor'
            ? ['t1', 't2', 't3', 't4']
            : ['d1', 'd2', 'd3', 'd4']
          ).map((id) => (
            <button
              key={id}
              onClick={() => onSelectComponent(id as ComponentId)}
              className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                selectedComponent === id
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {id.toUpperCase()}
            </button>
          ))}

          {phase === 'three' &&
            (rectifierType === 'thyristor' ? ['t5', 't6'] : ['d5', 'd6']).map(
              (id) => (
                <button
                  key={id}
                  onClick={() => onSelectComponent(id as ComponentId)}
                  className={`px-2.5 py-1 text-xs font-mono rounded transition-colors whitespace-nowrap ${
                    selectedComponent === id
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {id.toUpperCase()}
                </button>
              )
            )}
        </div>
      </div>
    </div>
  );
};
