import {
  ComponentId,
  ComponentMetadata,
  InstantaneousState,
  InstantaneousSwitchState,
  MetricSummary,
  PhaseType,
  RectifierType,
  SimulationDataset,
  SimulationParams,
} from '../types/simulation';

export const COMPONENT_METADATA: Record<ComponentId, ComponentMetadata> = {
  load: {
    id: 'load',
    name: 'Total DC Output Load (Vₒ / Iₒ)',
    category: 'load',
    description: 'Output terminal voltage and current across the complete load network (R / RL / RC).',
    unit: 'V / A',
    nominalMetricName: 'Total Output Voltage V_dc',
  },
  load_r: {
    id: 'load_r',
    name: 'Load Resistor R (v_R = R·i)',
    category: 'load',
    description: 'Resistive part of the RL load network. Voltage across R is strictly proportional to the smoothed load current.',
    unit: 'V / A',
    nominalMetricName: 'Resistor Voltage Drop v_R',
  },
  source: {
    id: 'source',
    name: 'AC Input Supply (vₛ)',
    category: 'source',
    description: 'Primary alternating current source feeding the rectifier.',
    unit: 'V',
    nominalMetricName: 'RMS Supply Voltage',
  },
  source_a: {
    id: 'source_a',
    name: 'Phase A Supply (v_a)',
    category: 'source',
    description: 'Phase A voltage reference of the 3-phase AC utility input.',
    unit: 'V',
    nominalMetricName: 'Phase A RMS',
  },
  source_b: {
    id: 'source_b',
    name: 'Phase B Supply (v_b)',
    category: 'source',
    description: 'Phase B voltage (-120° lag) of the 3-phase AC utility input.',
    unit: 'V',
    nominalMetricName: 'Phase B RMS',
  },
  source_c: {
    id: 'source_c',
    name: 'Phase C Supply (v_c)',
    category: 'source',
    description: 'Phase C voltage (+120° / -240°) of the 3-phase AC utility input.',
    unit: 'V',
    nominalMetricName: 'Phase C RMS',
  },
  d1: {
    id: 'd1',
    name: 'Diode D1 (Top Leg A)',
    category: 'switch',
    description: 'Solid-state rectifier diode D1. Evaluates forward drop and peak inverse reverse blocking voltage (PIV).',
    unit: 'V / A',
    nominalMetricName: 'D1 Peak Inverse Voltage',
  },
  d2: {
    id: 'd2',
    name: 'Diode D2 (Bottom Leg C / Return)',
    category: 'switch',
    description: 'Solid-state rectifier diode D2. Conducts return path during positive/Phase C intervals.',
    unit: 'V / A',
    nominalMetricName: 'D2 Peak Inverse Voltage',
  },
  d3: {
    id: 'd3',
    name: 'Diode D3 (Top Leg B / High-side)',
    category: 'switch',
    description: 'Solid-state rectifier diode D3. Conducts high-side current during Phase B / negative AC half-cycle.',
    unit: 'V / A',
    nominalMetricName: 'D3 Peak Inverse Voltage',
  },
  d4: {
    id: 'd4',
    name: 'Diode D4 (Bottom Leg A / Return)',
    category: 'switch',
    description: 'Solid-state rectifier diode D4. Conducts return path from Phase A / negative supply.',
    unit: 'V / A',
    nominalMetricName: 'D4 Peak Inverse Voltage',
  },
  d5: {
    id: 'd5',
    name: 'Diode D5 (Top Leg C)',
    category: 'switch',
    description: 'Solid-state rectifier diode D5 on Phase C top rail (3-phase bridge).',
    unit: 'V / A',
    nominalMetricName: 'D5 Peak Inverse Voltage',
  },
  d6: {
    id: 'd6',
    name: 'Diode D6 (Bottom Leg B)',
    category: 'switch',
    description: 'Solid-state rectifier diode D6 on Phase B bottom rail (3-phase bridge).',
    unit: 'V / A',
    nominalMetricName: 'D6 Peak Inverse Voltage',
  },
  t1: {
    id: 't1',
    name: 'Thyristor T1 (SCR Leg A)',
    category: 'switch',
    description: 'Phase-controlled thyristor T1. Withstands forward blocking until gate pulse at firing angle α.',
    unit: 'V / A',
    nominalMetricName: 'T1 Peak Blocking Voltage',
  },
  t2: {
    id: 't2',
    name: 'Thyristor T2 (SCR Bottom Leg C / Return)',
    category: 'switch',
    description: 'Phase-controlled thyristor T2. Fired at α + 90° (3Φ) or α (1Φ).',
    unit: 'V / A',
    nominalMetricName: 'T2 Peak Blocking Voltage',
  },
  t3: {
    id: 't3',
    name: 'Thyristor T3 (SCR Top Leg B)',
    category: 'switch',
    description: 'Phase-controlled thyristor T3. Fired at α + 150° (3Φ) or π + α (1Φ).',
    unit: 'V / A',
    nominalMetricName: 'T3 Peak Blocking Voltage',
  },
  t4: {
    id: 't4',
    name: 'Thyristor T4 (SCR Bottom Leg A)',
    category: 'switch',
    description: 'Phase-controlled thyristor T4. Fired at α + 210° (3Φ) or π + α (1Φ).',
    unit: 'V / A',
    nominalMetricName: 'T4 Peak Blocking Voltage',
  },
  t5: {
    id: 't5',
    name: 'Thyristor T5 (SCR Top Leg C)',
    category: 'switch',
    description: 'Phase-controlled thyristor T5 on 3-phase top rail. Fired at α + 270°.',
    unit: 'V / A',
    nominalMetricName: 'T5 Peak Blocking Voltage',
  },
  t6: {
    id: 't6',
    name: 'Thyristor T6 (SCR Bottom Leg B)',
    category: 'switch',
    description: 'Phase-controlled thyristor T6 on 3-phase bottom rail. Fired at α + 330°.',
    unit: 'V / A',
    nominalMetricName: 'T6 Peak Blocking Voltage',
  },
  cap: {
    id: 'cap',
    name: 'Filter Capacitor (C_filter)',
    category: 'filter',
    description: 'Smoothing capacitor across the DC bus. Stores charge to suppress output voltage ripple.',
    unit: 'V / A',
    nominalMetricName: 'Capacitor Voltage',
  },
  ind: {
    id: 'ind',
    name: 'Inductor Choke L (v_L = L·di/dt)',
    category: 'filter',
    description: 'Series choke inductance in RL/RLE load. Stores magnetic energy to smooth ripple and maintain continuous current conduction.',
    unit: 'V / A',
    nominalMetricName: 'Inductor Voltage v_L',
  },
  emf: {
    id: 'emf',
    name: 'Back EMF Source E (v_E)',
    category: 'load',
    description: 'DC Back EMF or battery voltage in RLE load (DC motor / charging battery). Holds terminal voltage at E during non-conduction.',
    unit: 'V',
    nominalMetricName: 'Back EMF Voltage E',
  },
  current_source: {
    id: 'current_source',
    name: 'Constant Current Sink (I_0)',
    category: 'load',
    description: 'Ideal constant DC current load (infinite choke L → ∞). Yields perfectly continuous ripple-free DC current.',
    unit: 'A',
    nominalMetricName: 'Constant Load Current I_0',
  },
  fwd: {
    id: 'fwd',
    name: 'Freewheeling Diode (D_FW)',
    category: 'filter',
    description: 'Commutating diode across inductive/RLE load to clamp negative voltage to 0V and provide a continuous freewheeling current loop.',
    unit: 'V / A',
    nominalMetricName: 'FWD Reverse Voltage',
  },
};

/**
 * Calculates instantaneous state of the rectifier circuit at angle omegaT (in radians).
 */
export function calculateInstantaneousState(
  omegaT: number,
  time: number,
  params: SimulationParams
): InstantaneousState {
  const {
    phase,
    rectifierType,
    loadType,
    hasFreewheelingDiode,
    vinRms,
    alpha: alphaDeg,
    resistance: R,
    inductance: L,
    capacitance: C,
    emfVoltage: rawE = 48,
    constantCurrent: rawI0 = 10,
    diodeForwardDrop: vDrop,
    selectedComponent,
  } = params;

  const isRLE = loadType === 'RLE' || loadType === 'RLE_FWD';
  const isCurrentLoad = loadType === 'CURRENT';
  const isFWD = Boolean(hasFreewheelingDiode || loadType === 'RL_FWD' || loadType === 'RLE_FWD');
  const E = isRLE ? rawE : 0;
  const I0 = isCurrentLoad ? rawI0 : 0;

  const alpha = (alphaDeg * Math.PI) / 180;
  const modOmegaT = ((omegaT % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const omegaTDeg = (modOmegaT * 180) / Math.PI;

  let vSource = 0;
  let vPhaseA = 0;
  let vPhaseB = 0;
  let vPhaseC = 0;
  let vLineAB = 0;
  let vLineBC = 0;
  let vLineCA = 0;
  let vLoad = 0;
  let iLoad = 0;
  let iFwd = 0;

  const switches: Record<string, InstantaneousSwitchState> = {};

  if (phase === 'single') {
    const Vm = Math.SQRT2 * vinRms;
    vSource = Vm * Math.sin(modOmegaT);
    const absV = Math.abs(vSource);
    const isPos = vSource >= 0;

    if (rectifierType === 'diode') {
      // --- 1-PHASE DIODE BRIDGE ---
      if (isCurrentLoad) {
        // Ideal Constant Current Load
        iLoad = I0;
        vLoad = Math.max(0, absV - 2 * vDrop);
        const d1Cond = isPos && absV > 2 * vDrop;
        const d2Cond = d1Cond;
        const d3Cond = !isPos && absV > 2 * vDrop;
        const d4Cond = d3Cond;

        switches['d1'] = {
          isConducting: d1Cond,
          isForwardBlocking: false,
          isReverseBlocking: !d1Cond,
          gateActive: false,
          voltage: d1Cond ? vDrop : -vLoad,
          current: d1Cond ? I0 : 0,
        };
        switches['d2'] = {
          isConducting: d2Cond,
          isForwardBlocking: false,
          isReverseBlocking: !d2Cond,
          gateActive: false,
          voltage: d2Cond ? vDrop : -vLoad,
          current: d2Cond ? I0 : 0,
        };
        switches['d3'] = {
          isConducting: d3Cond,
          isForwardBlocking: false,
          isReverseBlocking: !d3Cond,
          gateActive: false,
          voltage: d3Cond ? vDrop : -vLoad,
          current: d3Cond ? I0 : 0,
        };
        switches['d4'] = {
          isConducting: d4Cond,
          isForwardBlocking: false,
          isReverseBlocking: !d4Cond,
          gateActive: false,
          voltage: d4Cond ? vDrop : -vLoad,
          current: d4Cond ? I0 : 0,
        };
      } else if (isRLE) {
        // R-L-E Load (Back EMF E)
        const vThreshold = E + 2 * vDrop;
        const sinRatio = Math.min(0.999, Math.max(0, vThreshold / Math.max(1, Vm)));
        const theta1 = Math.asin(sinRatio);

        // Conduction extension past pi - theta1 due to inductance
        const tau = L / Math.max(0.1, R);
        const extendAngle = Math.min(Math.PI * 0.7, (2 * Math.PI * params.frequency * tau) * 0.6);
        const extAngle = Math.PI - theta1 + extendAngle;

        let d1Cond = false;
        let d3Cond = false;
        let inFreewheel = false;

        const halfOmegaT = modOmegaT % Math.PI;
        const inPosHalf = modOmegaT < Math.PI;

        if (halfOmegaT >= theta1 && halfOmegaT <= extAngle) {
          // Conduction interval
          if (halfOmegaT < Math.PI) {
            // Main forward conduction interval
            vLoad = Math.max(0, (inPosHalf ? vSource : -vSource) - 2 * vDrop);
            d1Cond = inPosHalf;
            d3Cond = !inPosHalf;
          } else {
            // Past 180 deg: AC source polarity reversed
            if (isFWD) {
              vLoad = 0;
              inFreewheel = true;
            } else {
              vLoad = (inPosHalf ? vSource : -vSource) - 2 * vDrop;
              d1Cond = inPosHalf;
              d3Cond = !inPosHalf;
            }
          }
          iLoad = Math.max(0, (vLoad - E) / Math.max(0.1, R) + 0.5 * Math.sin(halfOmegaT - theta1) * (Vm / Math.max(1, R)));
        } else {
          // Non-conduction interval: Output sits at Back EMF voltage E!
          vLoad = E;
          iLoad = 0;
        }

        iFwd = inFreewheel ? iLoad : 0;
        const d2Cond = d1Cond;
        const d4Cond = d3Cond;

        switches['d1'] = {
          isConducting: d1Cond,
          isForwardBlocking: false,
          isReverseBlocking: !d1Cond,
          gateActive: false,
          voltage: d1Cond ? vDrop : vSource - vLoad,
          current: d1Cond ? iLoad : 0,
        };
        switches['d2'] = {
          isConducting: d2Cond,
          isForwardBlocking: false,
          isReverseBlocking: !d2Cond,
          gateActive: false,
          voltage: d2Cond ? vDrop : -vLoad,
          current: d2Cond ? iLoad : 0,
        };
        switches['d3'] = {
          isConducting: d3Cond,
          isForwardBlocking: false,
          isReverseBlocking: !d3Cond,
          gateActive: false,
          voltage: d3Cond ? vDrop : -vSource - vLoad,
          current: d3Cond ? iLoad : 0,
        };
        switches['d4'] = {
          isConducting: d4Cond,
          isForwardBlocking: false,
          isReverseBlocking: !d4Cond,
          gateActive: false,
          voltage: d4Cond ? vDrop : -vLoad,
          current: d4Cond ? iLoad : 0,
        };
      } else {
        // Standard R / RL / RC Diode Bridge
        let rawVout = Math.max(0, absV - 2 * vDrop);

        if (loadType === 'RC' && C > 0 && R > 0) {
          const tau = R * C;
          const T = 1 / params.frequency;
          const decayFactor = Math.min(0.98, Math.exp(-(T / 2) / tau));
          const minV = Vm * decayFactor;
          const tHalfCycle = (modOmegaT % Math.PI) / Math.PI;
          const expV = Vm * Math.exp(-(tHalfCycle * (T / 2)) / tau);
          rawVout = Math.max(rawVout, Math.max(minV, expV) - 2 * vDrop);
        }

        vLoad = rawVout;
        iLoad = vLoad / Math.max(0.1, R);

        const d1Conducting = isPos && absV > 2 * vDrop;
        const d2Conducting = d1Conducting;
        const d3Conducting = !isPos && absV > 2 * vDrop;
        const d4Conducting = d3Conducting;

        switches['d1'] = {
          isConducting: d1Conducting,
          isForwardBlocking: false,
          isReverseBlocking: !d1Conducting,
          gateActive: false,
          voltage: d1Conducting ? vDrop : -vLoad,
          current: d1Conducting ? iLoad : 0,
        };
        switches['d2'] = {
          isConducting: d2Conducting,
          isForwardBlocking: false,
          isReverseBlocking: !d2Conducting,
          gateActive: false,
          voltage: d2Conducting ? vDrop : -vLoad,
          current: d2Conducting ? iLoad : 0,
        };
        switches['d3'] = {
          isConducting: d3Conducting,
          isForwardBlocking: false,
          isReverseBlocking: !d3Conducting,
          gateActive: false,
          voltage: d3Conducting ? vDrop : -vLoad,
          current: d3Conducting ? iLoad : 0,
        };
        switches['d4'] = {
          isConducting: d4Conducting,
          isForwardBlocking: false,
          isReverseBlocking: !d4Conducting,
          gateActive: false,
          voltage: d4Conducting ? vDrop : -vLoad,
          current: d4Conducting ? iLoad : 0,
        };
      }
    } else {
      // --- 1-PHASE THYRISTOR (SCR) CONTROLLED RECTIFIER ---
      const gateWidth = (14 * Math.PI) / 180;
      const t12Gate = modOmegaT >= alpha && modOmegaT <= alpha + gateWidth;
      const t34Gate =
        modOmegaT >= Math.PI + alpha && modOmegaT <= Math.PI + alpha + gateWidth;

      let t12Cond = false;
      let t34Cond = false;
      let inFreewheel = false;

      if (isCurrentLoad) {
        // Constant Current Load
        iLoad = I0;
        if (isFWD) {
          // With FWD: FWD clamps to 0 when input swings negative!
          if (modOmegaT >= alpha && modOmegaT < Math.PI) {
            t12Cond = true;
            vLoad = Math.max(0, vSource - 2 * vDrop);
          } else if (modOmegaT >= Math.PI && modOmegaT < Math.PI + alpha) {
            inFreewheel = true;
            vLoad = 0;
          } else if (modOmegaT >= Math.PI + alpha && modOmegaT < 2 * Math.PI) {
            t34Cond = true;
            vLoad = Math.max(0, -vSource - 2 * vDrop);
          } else {
            inFreewheel = true;
            vLoad = 0;
          }
        } else {
          // Without FWD: Conduction continues through negative swing!
          if (modOmegaT >= alpha && modOmegaT < Math.PI + alpha) {
            t12Cond = true;
            vLoad = vSource - 2 * vDrop;
          } else {
            t34Cond = true;
            vLoad = -vSource - 2 * vDrop;
          }
        }
        iFwd = inFreewheel ? I0 : 0;
      } else if (isRLE) {
        // R-L-E Load with Thyristors
        const vThresh = E + 2 * vDrop;
        const theta1 = Math.asin(Math.min(0.999, Math.max(0, vThresh / Math.max(1, Vm))));
        const effectiveAlpha = Math.max(alpha, theta1);

        const tau = L / Math.max(0.1, R);
        const extendAngle = Math.min(Math.PI * 0.8, (2 * Math.PI * params.frequency * tau) * 0.65);
        const extAngle = Math.PI + extendAngle;

        const inPosInterval = modOmegaT >= effectiveAlpha && modOmegaT < Math.PI + effectiveAlpha;

        if (inPosInterval) {
          if (modOmegaT < Math.PI) {
            t12Cond = true;
            vLoad = vSource - 2 * vDrop;
          } else if (isFWD) {
            inFreewheel = true;
            vLoad = 0;
          } else if (modOmegaT < extAngle) {
            t12Cond = true;
            vLoad = vSource - 2 * vDrop;
          } else {
            vLoad = E;
          }
        } else {
          const shiftOmegaT = modOmegaT - Math.PI;
          if (shiftOmegaT >= effectiveAlpha && shiftOmegaT < Math.PI) {
            t34Cond = true;
            vLoad = -vSource - 2 * vDrop;
          } else if (isFWD && shiftOmegaT >= Math.PI) {
            inFreewheel = true;
            vLoad = 0;
          } else if (!isFWD && shiftOmegaT >= Math.PI && shiftOmegaT < extAngle) {
            t34Cond = true;
            vLoad = -vSource - 2 * vDrop;
          } else {
            vLoad = E;
          }
        }

        iLoad = (t12Cond || t34Cond || inFreewheel)
          ? Math.max(0, (vLoad - E) / Math.max(0.1, R) + (Vm / Math.max(1, R)) * 0.4)
          : 0;
        iFwd = inFreewheel ? iLoad : 0;
      } else if (loadType === 'R' || isFWD) {
        // Resistive or with Freewheeling Diode (clamped at pi)
        if (modOmegaT >= alpha && modOmegaT < Math.PI) {
          t12Cond = true;
          vLoad = Math.max(0, vSource - 2 * vDrop);
        } else if (modOmegaT >= Math.PI && modOmegaT < Math.PI + alpha) {
          inFreewheel = isFWD;
          vLoad = 0;
        } else if (modOmegaT >= Math.PI + alpha && modOmegaT < 2 * Math.PI) {
          t34Cond = true;
          vLoad = Math.max(0, -vSource - 2 * vDrop);
        } else {
          inFreewheel = isFWD;
          vLoad = 0;
        }
        iLoad = Math.max(0, vLoad / Math.max(0.1, R));
        iFwd = inFreewheel ? (loadType === 'RL' ? iLoad : 0) : 0;
      } else {
        // Inductive continuous without FWD: swings negative until next trigger
        if (modOmegaT >= alpha && modOmegaT < Math.PI + alpha) {
          t12Cond = true;
          vLoad = vSource - 2 * vDrop;
        } else {
          t34Cond = true;
          vLoad = -vSource - 2 * vDrop;
        }
        iLoad = Math.max(0, (Math.SQRT2 * vinRms) / Math.max(0.1, R));
      }

      // SCR Terminal Voltages (v_AK)
      const vT1 = t12Cond ? vDrop : inFreewheel ? vSource : modOmegaT < alpha ? vSource : -absV;
      const vT3 = t34Cond ? vDrop : inFreewheel ? -vSource : (modOmegaT >= Math.PI && modOmegaT < Math.PI + alpha) ? -vSource : -absV;

      switches['t1'] = {
        isConducting: t12Cond,
        isForwardBlocking: !t12Cond && vT1 >= 0,
        isReverseBlocking: !t12Cond && vT1 < 0,
        gateActive: t12Gate,
        voltage: vT1,
        current: t12Cond ? iLoad : 0,
      };
      switches['t2'] = { ...switches['t1'] };
      switches['t3'] = {
        isConducting: t34Cond,
        isForwardBlocking: !t34Cond && vT3 >= 0,
        isReverseBlocking: !t34Cond && vT3 < 0,
        gateActive: t34Gate,
        voltage: vT3,
        current: t34Cond ? iLoad : 0,
      };
      switches['t4'] = { ...switches['t3'] };
    }
  } else {
    // --- 3-PHASE RECTIFIERS ---
    const VmPh = Math.SQRT2 * vinRms;
    vPhaseA = VmPh * Math.sin(modOmegaT);
    vPhaseB = VmPh * Math.sin(modOmegaT - (2 * Math.PI) / 3);
    vPhaseC = VmPh * Math.sin(modOmegaT + (2 * Math.PI) / 3);

    vLineAB = vPhaseA - vPhaseB;
    vLineBC = vPhaseB - vPhaseC;
    vLineCA = vPhaseC - vPhaseA;

    if (rectifierType === 'diode') {
      const maxPh = Math.max(vPhaseA, vPhaseB, vPhaseC);
      const minPh = Math.min(vPhaseA, vPhaseB, vPhaseC);
      const instantVLL = maxPh - minPh;

      let d1Cond = vPhaseA === maxPh;
      let d3Cond = vPhaseB === maxPh;
      let d5Cond = vPhaseC === maxPh;
      let d4Cond = vPhaseA === minPh;
      let d6Cond = vPhaseB === minPh;
      let d2Cond = vPhaseC === minPh;

      if (isCurrentLoad) {
        iLoad = I0;
        vLoad = Math.max(0, instantVLL - 2 * vDrop);
      } else if (isRLE) {
        if (instantVLL > E + 2 * vDrop) {
          vLoad = instantVLL - 2 * vDrop;
          iLoad = Math.max(0, (vLoad - E) / Math.max(0.1, R));
        } else {
          vLoad = E;
          iLoad = 0;
          d1Cond = d3Cond = d5Cond = d4Cond = d6Cond = d2Cond = false;
        }
      } else {
        vLoad = Math.max(0, instantVLL - 2 * vDrop);
        iLoad = vLoad / Math.max(0.1, R);
      }

      switches['d1'] = {
        isConducting: d1Cond,
        isForwardBlocking: false,
        isReverseBlocking: !d1Cond,
        gateActive: false,
        voltage: d1Cond ? vDrop : vPhaseA - maxPh,
        current: d1Cond ? iLoad : 0,
      };
      switches['d3'] = {
        isConducting: d3Cond,
        isForwardBlocking: false,
        isReverseBlocking: !d3Cond,
        gateActive: false,
        voltage: d3Cond ? vDrop : vPhaseB - maxPh,
        current: d3Cond ? iLoad : 0,
      };
      switches['d5'] = {
        isConducting: d5Cond,
        isForwardBlocking: false,
        isReverseBlocking: !d5Cond,
        gateActive: false,
        voltage: d5Cond ? vDrop : vPhaseC - maxPh,
        current: d5Cond ? iLoad : 0,
      };
      switches['d4'] = {
        isConducting: d4Cond,
        isForwardBlocking: false,
        isReverseBlocking: !d4Cond,
        gateActive: false,
        voltage: d4Cond ? vDrop : minPh - vPhaseA,
        current: d4Cond ? iLoad : 0,
      };
      switches['d6'] = {
        isConducting: d6Cond,
        isForwardBlocking: false,
        isReverseBlocking: !d6Cond,
        gateActive: false,
        voltage: d6Cond ? vDrop : minPh - vPhaseB,
        current: d6Cond ? iLoad : 0,
      };
      switches['d2'] = {
        isConducting: d2Cond,
        isForwardBlocking: false,
        isReverseBlocking: !d2Cond,
        gateActive: false,
        voltage: d2Cond ? vDrop : minPh - vPhaseC,
        current: d2Cond ? iLoad : 0,
      };
    } else {
      // 3-Phase Thyristor Bridge
      const deg = omegaTDeg;
      const a = alphaDeg;

      const pulseWidth = 15;
      const isPulsed = (firingAngleDeg: number) => {
        const normAngle = ((firingAngleDeg % 360) + 360) % 360;
        const diff = (deg - normAngle + 360) % 360;
        return diff >= 0 && diff <= pulseWidth;
      };

      const t1Gate = isPulsed(30 + a);
      const t2Gate = isPulsed(90 + a);
      const t3Gate = isPulsed(150 + a);
      const t4Gate = isPulsed(210 + a);
      const t5Gate = isPulsed(270 + a);
      const t6Gate = isPulsed(330 + a);

      const shiftAngle = ((deg - (30 + a)) % 360 + 360) % 360;
      const sector = Math.floor(shiftAngle / 60);

      let t1Cond = false;
      let t2Cond = false;
      let t3Cond = false;
      let t4Cond = false;
      let t5Cond = false;
      let t6Cond = false;
      let instantVLL = 0;

      switch (sector) {
        case 0:
          t1Cond = true;
          t6Cond = true;
          instantVLL = vLineAB;
          break;
        case 1:
          t1Cond = true;
          t2Cond = true;
          instantVLL = -vLineCA;
          break;
        case 2:
          t3Cond = true;
          t2Cond = true;
          instantVLL = vLineBC;
          break;
        case 3:
          t3Cond = true;
          t4Cond = true;
          instantVLL = -vLineAB;
          break;
        case 4:
          t5Cond = true;
          t4Cond = true;
          instantVLL = vLineCA;
          break;
        case 5:
          t5Cond = true;
          t6Cond = true;
          instantVLL = -vLineBC;
          break;
      }

      let inFreewheel = false;
      if (instantVLL < 0 && isFWD) {
        // FWD catches negative dips in 3-phase thyristor bridge
        inFreewheel = true;
        vLoad = 0;
        t1Cond = t2Cond = t3Cond = t4Cond = t5Cond = t6Cond = false;
      } else if (instantVLL < 0 && (loadType === 'R' || isRLE)) {
        vLoad = isRLE ? E : 0;
        t1Cond = t2Cond = t3Cond = t4Cond = t5Cond = t6Cond = false;
      } else {
        vLoad = instantVLL - 2 * vDrop;
      }

      if (isCurrentLoad) {
        iLoad = I0;
      } else if (isRLE) {
        iLoad = vLoad > E ? Math.max(0, (vLoad - E) / Math.max(0.1, R)) : 0;
      } else {
        iLoad = Math.max(0, vLoad / Math.max(0.1, R));
      }

      iFwd = inFreewheel ? iLoad : 0;

      const posBus = t1Cond ? vPhaseA : t3Cond ? vPhaseB : t5Cond ? vPhaseC : Math.max(vPhaseA, vPhaseB, vPhaseC);
      const negBus = t4Cond ? vPhaseA : t6Cond ? vPhaseB : t2Cond ? vPhaseC : Math.min(vPhaseA, vPhaseB, vPhaseC);

      const makeThyristorState = (
        isCond: boolean,
        vAnode: number,
        vCathode: number,
        isGate: boolean
      ): InstantaneousSwitchState => {
        const vDiff = vAnode - vCathode;
        return {
          isConducting: isCond,
          isForwardBlocking: !isCond && vDiff >= 0,
          isReverseBlocking: !isCond && vDiff < 0,
          gateActive: isGate,
          voltage: isCond ? vDrop : vDiff,
          current: isCond ? iLoad : 0,
        };
      };

      switches['t1'] = makeThyristorState(t1Cond, vPhaseA, posBus, t1Gate);
      switches['t3'] = makeThyristorState(t3Cond, vPhaseB, posBus, t3Gate);
      switches['t5'] = makeThyristorState(t5Cond, vPhaseC, posBus, t5Gate);
      switches['t4'] = makeThyristorState(t4Cond, negBus, vPhaseA, t4Gate);
      switches['t6'] = makeThyristorState(t6Cond, negBus, vPhaseB, t6Gate);
      switches['t2'] = makeThyristorState(t2Cond, negBus, vPhaseC, t2Gate);
    }
  }

  // Filter & Sub-Component Voltage Allocation
  const iCap = loadType === 'RC' ? (C > 0 ? (vLoad / Math.max(0.1, R)) * 0.4 : 0) : 0;

  // Voltage across Resistor R alone
  let vRes = isCurrentLoad ? 0 : R * iLoad;
  // Voltage across Back EMF source
  const vEmf = E;
  // Voltage across Inductor L alone (v_L = v_o - v_R - E)
  let vInd = isCurrentLoad ? 0 : Math.max(-500, Math.min(500, vLoad - vRes - vEmf));
  // Voltage across Freewheeling Diode (Anode grounded / at V-, Cathode at V+)
  const vFwd = iFwd > 0 ? -vDrop : -vLoad;

  // If pure RL load and L > 0, calculate smooth ripple
  if ((loadType === 'RL' || loadType === 'RL_FWD') && L > 0) {
    const rippleMul = phase === 'single' ? 2 : 6;
    const omegaRip = 2 * Math.PI * params.frequency * rippleMul;
    const XL = omegaRip * L;
    const Z = Math.sqrt(R * R + XL * XL);
    const cosPhi = R / Z;
    const Vm = Math.SQRT2 * vinRms;
    const vDcEst = phase === 'single'
      ? (rectifierType === 'diode' ? (2 * Vm) / Math.PI : (2 * Vm / Math.PI) * Math.cos(alpha))
      : (rectifierType === 'diode' ? (3 / Math.PI) * Math.sqrt(6) * vinRms : (3 / Math.PI) * Math.sqrt(6) * vinRms * Math.cos(alpha));
    const iDcEst = Math.max(0, vDcEst / Math.max(0.1, R));
    const vRipple = vLoad - vDcEst;
    iLoad = Math.max(0, iDcEst + (vRipple / Z) * cosPhi);
    vRes = R * iLoad;
    vInd = vLoad - vRes;
  }

  // Determine probed component instantaneous value
  let probedVoltage = vLoad;
  let probedCurrent = iLoad;
  let probedGate: number | undefined = undefined;
  let probedStateLabel = 'Normal';

  if (selectedComponent === 'load') {
    probedVoltage = vLoad;
    probedCurrent = iLoad;
    probedStateLabel =
      isRLE
        ? `RLE Output Load (v_R + v_L + E)`
        : isCurrentLoad
        ? `Constant Current Output (I₀ = ${I0}A)`
        : loadType === 'RL' || loadType === 'RL_FWD'
        ? `Total RL Load (v_R + v_L)`
        : `Active Load (${loadType})`;
  } else if (selectedComponent === 'load_r') {
    probedVoltage = vRes;
    probedCurrent = iLoad;
    probedStateLabel = `Load Resistor R (v_R = ${vRes.toFixed(1)}V, ${R}Ω)`;
  } else if (selectedComponent === 'ind') {
    probedVoltage = vInd;
    probedCurrent = iLoad;
    probedStateLabel = `Inductive Choke L (v_L = ${vInd.toFixed(1)}V, ${(L * 1000).toFixed(0)}mH)`;
  } else if (selectedComponent === 'emf') {
    probedVoltage = vEmf;
    probedCurrent = iLoad;
    probedStateLabel = `Back EMF / Battery E (v_E = ${vEmf.toFixed(1)}V)`;
  } else if (selectedComponent === 'current_source') {
    probedVoltage = vLoad;
    probedCurrent = I0;
    probedStateLabel = `Constant Current Load Sink (I₀ = ${I0}A)`;
  } else if (selectedComponent === 'fwd') {
    probedVoltage = vFwd;
    probedCurrent = iFwd;
    probedStateLabel = iFwd > 0 ? 'Freewheeling Diode (ON - Clamping 0V)' : `FWD Reverse Biased (${vFwd.toFixed(0)}V PIV)`;
  } else if (selectedComponent === 'source') {
    probedVoltage = vSource;
    probedCurrent = iLoad;
    probedStateLabel = `AC Input Supply (${params.frequency} Hz)`;
  } else if (selectedComponent === 'source_a') {
    probedVoltage = vPhaseA;
    probedCurrent = switches['d1']?.current || switches['t1']?.current || 0;
    probedStateLabel = 'Phase A (0°)';
  } else if (selectedComponent === 'source_b') {
    probedVoltage = vPhaseB;
    probedCurrent = switches['d3']?.current || switches['t3']?.current || 0;
    probedStateLabel = 'Phase B (-120°)';
  } else if (selectedComponent === 'source_c') {
    probedVoltage = vPhaseC;
    probedCurrent = switches['d5']?.current || switches['t5']?.current || 0;
    probedStateLabel = 'Phase C (+120°)';
  } else if (switches[selectedComponent]) {
    const sw = switches[selectedComponent];
    probedVoltage = sw.voltage;
    probedCurrent = sw.current;
    probedGate = sw.gateActive ? 5.0 : 0.0;
    if (sw.isConducting) {
      probedStateLabel = 'Conducting (ON)';
    } else if (sw.isForwardBlocking) {
      probedStateLabel = 'Forward Blocking (Waiting for Trigger/Bias)';
    } else {
      probedStateLabel = 'Reverse Blocking (OFF / PIV)';
    }
  } else if (selectedComponent === 'cap') {
    probedVoltage = vLoad;
    probedCurrent = iCap;
    probedStateLabel = 'Smoothing Capacitor Filter';
  }

  return {
    time,
    omegaT: modOmegaT,
    omegaTDeg,
    vSource,
    vPhaseA,
    vPhaseB,
    vPhaseC,
    vLineAB,
    vLineBC,
    vLineCA,
    vLoad,
    iLoad,
    vRes,
    vInd,
    vEmf,
    switches,
    iCap,
    iFwd,
    vFwd,
    probedVoltage,
    probedCurrent,
    probedGate,
    probedStateLabel,
  };
}

/**
 * Runs a full period simulation and extracts analytical metrics + time-series dataset.
 */
export function runSimulation(params: SimulationParams, numPeriods = 2, samplesPerPeriod = 360): SimulationDataset {
  const period = 1 / params.frequency;
  const totalTime = period * numPeriods;
  const totalSamples = samplesPerPeriod * numPeriods;
  const dt = totalTime / totalSamples;

  const samples: InstantaneousState[] = [];

  let sumV = 0;
  let sumV2 = 0;
  let sumI = 0;
  let sumI2 = 0;
  let sumP = 0;

  let minProbedV = Infinity;
  let maxProbedV = -Infinity;
  let maxProbedI = 0;
  let conductionCount = 0;

  for (let i = 0; i < totalSamples; i++) {
    const t = i * dt;
    const omegaT = 2 * Math.PI * params.frequency * t;
    const state = calculateInstantaneousState(omegaT, t, params);
    samples.push(state);

    sumV += state.vLoad;
    sumV2 += state.vLoad * state.vLoad;
    sumI += state.iLoad;
    sumI2 += state.iLoad * state.iLoad;
    sumP += state.vLoad * state.iLoad;

    if (state.probedVoltage < minProbedV) minProbedV = state.probedVoltage;
    if (state.probedVoltage > maxProbedV) maxProbedV = state.probedVoltage;
    if (state.probedCurrent > maxProbedI) maxProbedI = state.probedCurrent;

    const sw = state.switches[params.selectedComponent];
    if (sw && sw.isConducting) {
      conductionCount++;
    } else if (params.selectedComponent === 'load' && state.vLoad > 0.5) {
      conductionCount++;
    }
  }

  const vDcAvg = sumV / totalSamples;
  const vRms = Math.sqrt(sumV2 / totalSamples);
  const iDcAvg = sumI / totalSamples;
  const iRms = Math.sqrt(sumI2 / totalSamples);
  const activePowerW = sumP / totalSamples;

  const rippleVoltageRms = Math.sqrt(Math.max(0, vRms * vRms - vDcAvg * vDcAvg));
  const rippleFactor = vDcAvg > 0.001 ? rippleVoltageRms / vDcAvg : 0;
  const formFactor = vDcAvg > 0.001 ? vRms / vDcAvg : 0;

  const pTotal = vRms * iRms;
  const pDc = vDcAvg * iDcAvg;
  const rectificationEfficiency = pTotal > 0.001 ? (pDc / pTotal) * 100 : 0;

  // Peak inverse voltage is the absolute maximum negative voltage across switch
  const piv = Math.abs(Math.min(0, minProbedV));
  const conductionAngleDeg = (conductionCount / totalSamples) * 360;

  // Output ripple frequency
  const fundamentalRippleFreqHz =
    params.phase === 'single' ? 2 * params.frequency : 6 * params.frequency;

  // Total harmonic distortion approximation
  const thdPercent = rippleFactor * 100;

  const metrics: MetricSummary = {
    vDcAvg,
    vRms,
    iDcAvg,
    iRms,
    rippleFactor,
    formFactor,
    rippleVoltageRms,
    piv,
    peakForwardCurrent: maxProbedI,
    conductionAngleDeg,
    activePowerW,
    fundamentalRippleFreqHz,
    rectificationEfficiency,
    thdPercent,
  };

  const probedMetadata = COMPONENT_METADATA[params.selectedComponent] || {
    id: params.selectedComponent,
    name: params.selectedComponent.toUpperCase(),
    category: 'switch',
    description: 'Probed component in circuit.',
    unit: 'V / A',
    nominalMetricName: 'Voltage',
  };

  return {
    samples,
    periodSeconds: period,
    metrics,
    probedMetadata,
  };
}
