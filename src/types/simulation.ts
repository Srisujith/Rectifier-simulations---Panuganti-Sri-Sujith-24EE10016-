export type PhaseType = 'single' | 'three';
export type RectifierType = 'diode' | 'thyristor';
export type LoadType = 'R' | 'RL' | 'RLE' | 'RC' | 'CURRENT' | 'RL_FWD' | 'RLE_FWD';

export type ComponentId =
  | 'load'
  | 'load_r'
  | 'emf'
  | 'current_source'
  | 'source'
  | 'source_a'
  | 'source_b'
  | 'source_c'
  | 'd1'
  | 'd2'
  | 'd3'
  | 'd4'
  | 'd5'
  | 'd6'
  | 't1'
  | 't2'
  | 't3'
  | 't4'
  | 't5'
  | 't6'
  | 'cap'
  | 'ind'
  | 'fwd';

export interface ComponentMetadata {
  id: ComponentId;
  name: string;
  category: 'switch' | 'source' | 'load' | 'filter';
  description: string;
  unit: string;
  nominalMetricName: string;
}

export interface SimulationParams {
  phase: PhaseType;
  rectifierType: RectifierType;
  loadType: LoadType;
  hasFreewheelingDiode: boolean; // Independent FWD toggle
  vinRms: number; // Volts RMS (phase-to-neutral for 3-phase or 1-phase supply)
  frequency: number; // Hz
  alpha: number; // Firing angle in degrees (0 to 180)
  resistance: number; // Ohms
  inductance: number; // Henry
  capacitance: number; // Farad
  emfVoltage: number; // Volts DC (Back EMF / Battery voltage E for RLE load)
  constantCurrent: number; // Amps DC (for Constant Current Source load)
  diodeForwardDrop: number; // Volts (0.7V or 0V)
  selectedComponent: ComponentId;
}

export interface InstantaneousSwitchState {
  isConducting: boolean;
  isForwardBlocking: boolean;
  isReverseBlocking: boolean;
  gateActive: boolean;
  voltage: number; // Anode to Cathode voltage (v_AK)
  current: number; // Anode to Cathode current (i_A)
}

export interface InstantaneousState {
  time: number; // seconds
  omegaT: number; // radians (0 to 2*PI in modulo)
  omegaTDeg: number; // degrees (0 to 360)
  
  // Sources
  vSource: number; // for 1-phase
  vPhaseA: number; // for 3-phase
  vPhaseB: number; // for 3-phase
  vPhaseC: number; // for 3-phase
  vLineAB: number;
  vLineBC: number;
  vLineCA: number;
  
  // Output
  vLoad: number; // Output DC voltage across entire load network (R + L + E)
  iLoad: number; // Output DC current through load
  vRes: number; // Voltage across resistor alone: v_R = R * i_load
  vInd: number; // Voltage across inductor alone: v_L = L * di/dt
  vEmf?: number; // Voltage across Back EMF / battery: v_E = E
  
  // Switches map
  switches: Record<string, InstantaneousSwitchState>;
  
  // Filter / auxiliary
  iCap?: number;
  iFwd?: number;
  vFwd?: number;
  
  // Currently probed component instantaneous values
  probedVoltage: number;
  probedCurrent: number;
  probedGate?: number;
  probedStateLabel: string;
}

export interface MetricSummary {
  vDcAvg: number;
  vRms: number;
  iDcAvg: number;
  iRms: number;
  rippleFactor: number; // V_ac_rms / V_dc
  formFactor: number; // V_rms / V_dc
  rippleVoltageRms: number;
  piv: number; // Peak Inverse Voltage across selected switch
  peakForwardCurrent: number;
  conductionAngleDeg: number; // In degrees
  activePowerW: number;
  fundamentalRippleFreqHz: number;
  rectificationEfficiency: number; // (P_dc / P_total) * 100%
  thdPercent: number; // Total harmonic distortion of output
}

export interface SimulationDataset {
  samples: InstantaneousState[];
  periodSeconds: number;
  metrics: MetricSummary;
  probedMetadata: ComponentMetadata;
}
