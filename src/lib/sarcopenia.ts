// AWGS 2019 clinical thresholds for sarcopenia diagnosis
export type Gender = 'male' | 'female'
export type SarcopeniaStage = 'sarcopenia' | 'at-risk' | 'normal'

export interface InBodyData {
  age: number
  gender: Gender
  weight: number       // kg
  height: number       // cm
  skeletalMuscleMass: number  // kg
}

export interface SarcopeniaResult {
  smi: number
  stage: SarcopeniaStage
  dailyProteinTarget: number  // grams
  proteinPerKg: number
}

export function analyzeSarcopenia(data: InBodyData): SarcopeniaResult {
  const heightM = data.height / 100
  const smi = data.skeletalMuscleMass / (heightM * heightM)

  let stage: SarcopeniaStage
  if (data.gender === 'male') {
    stage = smi < 7.0 ? 'sarcopenia' : smi < 8.0 ? 'at-risk' : 'normal'
  } else {
    stage = smi < 5.4 ? 'sarcopenia' : smi < 6.0 ? 'at-risk' : 'normal'
  }

  const proteinPerKg = stage === 'sarcopenia' ? 2.0 : stage === 'at-risk' ? 1.6 : 1.2
  const dailyProteinTarget = Math.round(data.weight * proteinPerKg)

  return { smi: Math.round(smi * 100) / 100, stage, dailyProteinTarget, proteinPerKg }
}

export function getStageLabelKo(stage: SarcopeniaStage): string {
  return stage === 'sarcopenia' ? 'Sarcopenia' : stage === 'at-risk' ? 'At-Risk' : 'Normal'
}

export function getStageLabelEn(stage: SarcopeniaStage): string {
  return stage === 'sarcopenia' ? 'Sarcopenia' : stage === 'at-risk' ? 'At-Risk' : 'Normal'
}

export function getStageColor(stage: SarcopeniaStage): string {
  return stage === 'sarcopenia' ? 'text-red-600' : stage === 'at-risk' ? 'text-orange-500' : 'text-green-600'
}
