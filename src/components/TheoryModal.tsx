import React from 'react';
import { X, BookOpen, CheckCircle } from 'lucide-react';
import { SimulationParams } from '../types/simulation';

interface TheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: SimulationParams;
}

export const TheoryModal: React.FC<TheoryModalProps> = ({
  isOpen,
  onClose,
  params,
}) => {
  if (!isOpen) return null;

  const { phase, rectifierType, alpha, vinRms } = params;
  const is3Phase = phase === 'three';
  const isThyristor = rectifierType === 'thyristor';

  const Vm = Math.SQRT2 * vinRms;
  const VmLL = Math.sqrt(6) * vinRms;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden text-slate-200 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-slate-100 font-mono tracking-tight">
              Power Electronics Mathematical Theory & Formulas
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm leading-relaxed">
          {/* Active Configuration Callout */}
          <div className="p-4 rounded-lg bg-slate-950 border border-cyan-500/30 font-mono text-xs space-y-1">
            <div className="text-cyan-400 font-bold uppercase tracking-wider">
              Currently Selected Topology:
            </div>
            <div className="text-slate-300">
              {is3Phase ? '3-Phase (6-Pulse)' : '1-Phase Full-Wave'}{' '}
              {isThyristor ? `Thyristor Bridge (α = ${alpha}°)` : 'Diode Bridge (Uncontrolled)'}
            </div>
            <div className="text-slate-500">
              Supply: {vinRms} V RMS (Peak V_m = {Vm.toFixed(1)} V
              {is3Phase && `, Line-to-Line Peak V_mLL = ${VmLL.toFixed(1)} V`})
            </div>
          </div>

          {/* Section 1: Single-Phase Rectifiers */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              1. Single-Phase Full-Wave Rectifier Principles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-slate-950/80 p-3.5 rounded border border-slate-800 space-y-2">
                <div className="text-slate-300 font-bold">Diode Bridge (Uncontrolled)</div>
                <div className="text-emerald-400 font-mono text-xs">
                  V_dc = (2 · V_m) / π ≈ 0.6366 · V_m
                </div>
                <div className="text-slate-400">
                  V_rms = V_m / √2 ≈ 0.7071 · V_m
                </div>
                <div className="text-slate-400">
                  Form Factor (FF) = V_rms / V_dc = 1.11
                </div>
                <div className="text-slate-400">
                  Ripple Factor (γ) = √(FF² - 1) = 0.483 (48.3%)
                </div>
                <div className="text-rose-400 font-semibold">
                  PIV across each diode = V_m
                </div>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded border border-slate-800 space-y-2">
                <div className="text-slate-300 font-bold">Thyristor Bridge (Phase Controlled)</div>
                <div className="text-emerald-400 font-mono text-xs">
                  R Load: V_dc = (V_m / π) · (1 + cos α)
                </div>
                <div className="text-emerald-400 font-mono text-xs">
                  RL Load (Continuous): V_dc = (2 · V_m / π) · cos α
                </div>
                <div className="text-slate-400">
                  Delay Angle α: 0° to 180°
                </div>
                <div className="text-slate-400">
                  If α &gt; 90° with active source: Inverter Mode
                </div>
                <div className="text-rose-400 font-semibold">
                  PIV across each SCR = V_m
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Three-Phase 6-Pulse Rectifiers */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-mono text-sky-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              2. Three-Phase 6-Pulse Converter Principles
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-slate-950/80 p-3.5 rounded border border-slate-800 space-y-2">
                <div className="text-slate-300 font-bold">3Φ Diode 6-Pulse Bridge</div>
                <div className="text-emerald-400 font-mono text-xs">
                  V_dc = (3√3 / π) · V_m,ph = (3 / π) · V_m,LL ≈ 1.35 · V_LL,rms
                </div>
                <div className="text-slate-400">
                  Ripple Fundamental Frequency = 6 · f (300 Hz @ 50 Hz)
                </div>
                <div className="text-slate-400">
                  Ripple Factor (γ) = 0.042 (4.2% - extremely low ripple!)
                </div>
                <div className="text-rose-400 font-semibold">
                  PIV across each diode = V_m,LL = √3 · V_m,ph
                </div>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded border border-slate-800 space-y-2">
                <div className="text-slate-300 font-bold">3Φ Thyristor 6-Pulse Bridge</div>
                <div className="text-emerald-400 font-mono text-xs">
                  Continuous Conduction (α ≤ 60°):
                  <br />
                  V_dc = (3 / π) · V_m,LL · cos α
                </div>
                <div className="text-amber-400 font-mono text-xs">
                  Discontinuous (α &gt; 60°, R load):
                  <br />
                  V_dc = (3 / π) · V_m,LL · [1 + cos(α + 60°)]
                </div>
                <div className="text-rose-400 font-semibold">
                  PIV across each SCR = V_m,LL
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: RL Inductive Load & Freewheeling Diode Physics */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              3. RL Inductive Load & Freewheeling Diode (D_FW) Mechanics
            </h3>
            <div className="bg-slate-950/80 p-3.5 rounded border border-cyan-500/30 space-y-2 text-xs font-mono">
              <div className="text-slate-300 font-bold">RL Differential Equation & Impedance</div>
              <div className="text-cyan-300">
                L · (di/dt) + R · i = v_o(t) &nbsp;⇒&nbsp; v_o(t) = v_R(t) + v_L(t)
              </div>
              <div className="text-slate-400">
                • <strong>Load Time Constant:</strong> τ = L / R (in seconds). Higher τ maintains continuous forward momentum in load current.
              </div>
              <div className="text-slate-400">
                • <strong>Current Smoothing:</strong> At fundamental ripple frequency ω_rip (2ω for 1Φ, 6ω for 3Φ), impedance is Z = √(R² + (ω_rip·L)²). The inductor attenuates AC current ripple by factor R / Z.
              </div>
              <div className="text-slate-400">
                • <strong>Thyristor RL Without FWD:</strong> Inductor forces conduction to continue past π into the negative half-cycle until next SCR pair fires. Output voltage swings negative, lowering average DC output: V_dc = (2·V_m / π)·cos α (1Φ) or (3/π)·V_m,LL·cos α (3Φ).
              </div>
              <div className="text-emerald-400 font-semibold">
                • <strong>Freewheeling Diode (D_FW) Role:</strong> Connected anti-parallel across the load terminals. The moment the source voltage drops below zero, D_FW becomes forward biased and turns ON. It clamps v_o to 0V and provides a low-impedance freewheeling loop for the inductor energy (½·L·i²) to circulate through R, preventing negative output voltage swings:
                <br />
                <span className="text-cyan-300 ml-3">V_dc = (V_m / π) · (1 + cos α)</span>
                <br />
                Benefits: Higher average DC voltage, zero reactive power drawn from the source during freewheeling, improved input power factor, and lower current ripple.
              </div>
            </div>
          </div>

          {/* Section 4: R-L-E Load (DC Motor Drive & Battery Charging) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-mono text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              4. R-L-E Load (Back EMF & DC Motor Armatures)
            </h3>
            <div className="bg-slate-950/80 p-3.5 rounded border border-amber-500/30 space-y-2 text-xs font-mono">
              <div className="text-slate-300 font-bold">Counter EMF Physics & Conduction Angles</div>
              <div className="text-amber-300">
                v_o(t) = R · i(t) + L · (di/dt) + E &nbsp;⇒&nbsp; DC Motor: E = k_e · Φ · ω_m
              </div>
              <div className="text-slate-400">
                • <strong>Natural Firing Threshold (θ₁):</strong> For diodes or SCRs to turn on, the source voltage must exceed the Back EMF: θ₁ = arcsin(E / V_m). For thyristors, gating pulses must be supplied at α ≥ θ₁.
              </div>
              <div className="text-slate-400">
                • <strong>Terminal Voltage Clamping at E:</strong> During non-conduction intervals (when current i_o = 0), the rectifier switches are open and the output terminal voltage sits strictly at the Back EMF voltage: v_o(t) = E.
              </div>
              <div className="text-slate-400">
                • <strong>Extinction Angle (β):</strong> Inductance L extends conduction beyond π - θ₁ to extinction angle β. If a Freewheeling Diode is present, v_o clamps to 0V whenever the AC source dips below zero.
              </div>
            </div>
          </div>

          {/* Section 5: Constant Current Load Sink (I₀) */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-mono text-sky-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              5. Constant Current Load Sink (Ideal Highly Inductive Load)
            </h3>
            <div className="bg-slate-950/80 p-3.5 rounded border border-sky-500/30 space-y-2 text-xs font-mono">
              <div className="text-slate-300 font-bold">Infinite Inductive Choke Approximation (L → ∞)</div>
              <div className="text-sky-300">
                i_load(t) = I₀ (Strictly constant ripple-free DC current)
              </div>
              <div className="text-slate-400">
                • <strong>AC Line Current Waveforms:</strong> Rectangular pulses of height +I₀ and -I₀ with 180° conduction width in 1-phase or 120° pulses in 3-phase.
              </div>
              <div className="text-slate-400">
                • <strong>Fundamental Line Current:</strong> I_s1,rms = (2√2 / π) · I₀ ≈ 0.90 · I₀.
              </div>
              <div className="text-slate-400">
                • <strong>Input Total Harmonic Distortion:</strong> THD = √( (I_s,rms / I_s1,rms)² - 1 ) = √( (π² / 8) - 1 ) ≈ 48.34%.
              </div>
            </div>
          </div>

          {/* Section 6: Component Voltage Probing & Commutation */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              6. Component Waveforms & Commutation Rules
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
              <li>
                <strong className="text-slate-100">Diode / SCR Voltage (v_AK):</strong>{' '}
                When conducting, the anode-to-cathode voltage drops to the small forward conduction voltage (0.7V for Silicon). When non-conducting, the switch withstands the full line-to-line reverse voltage (PIV).
              </li>
              <li>
                <strong className="text-slate-100">Inductor Voltage (v_L):</strong>{' '}
                v_L = L · di/dt. When current is rising, v_L &gt; 0; when current is falling, v_L &lt; 0. In steady-state, the average voltage across the inductor over one period is strictly zero (∫ v_L dt = 0).
              </li>
              <li>
                <strong className="text-slate-100">Resistor Voltage (v_R):</strong>{' '}
                v_R = R · i_load. The waveform of v_R directly mirrors the smoothed load current profile.
              </li>
              <li>
                <strong className="text-slate-100">Back EMF Voltage (v_E):</strong>{' '}
                v_E = E. Holds the load voltage at the battery/armature level whenever rectifier conduction ceases.
              </li>
              <li>
                <strong className="text-slate-100">Freewheeling Diode (v_FWD):</strong>{' '}
                Reverse-biased when bridge is supplying power (v_FWD = -v_o). When bridge voltage goes negative, FWD clamps forward voltage to ~0V and conducts freewheeling current.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
