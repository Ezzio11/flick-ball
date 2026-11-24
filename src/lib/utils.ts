import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** "25/26" label for a date. Seasons roll over on Aug 1 UTC (same rule as scripts/fotmob.js). */
function seasonStartYear(date: string | Date) {
  const d = new Date(date)
  return d.getUTCMonth() >= 7 ? d.getUTCFullYear() : d.getUTCFullYear() - 1
}

export function seasonLabel(date: string | Date) {
  const y = seasonStartYear(date)
  return `${String(y).slice(2)}/${String(y + 1).slice(2)}`
}

/** Every Flick season from 24/25 up to the current one, e.g. ['24/25', '25/26', '26/27']. */
export function flickSeasons(now: Date = new Date()) {
  const seasons: string[] = []
  for (let y = 2024; y <= seasonStartYear(now); y++) seasons.push(`${String(y).slice(2)}/${String(y + 1).slice(2)}`)
  return seasons
}

/** Team-name match that ignores accents and case: FotMob says "Atlético Madrid", our lists say "Atletico Madrid". */
const foldName = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
export function isTeamIn(teams: string[], name: string | undefined) {
  if (!name) return false
  const n = foldName(name)
  return teams.some(t => foldName(t) === n)
}

export type PositionGroup = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward'
const POSITION_GROUPS: Record<string, PositionGroup> = {
  GK: 'Goalkeeper', Goalkeeper: 'Goalkeeper',
  CB: 'Defender', RB: 'Defender', LB: 'Defender', RWB: 'Defender', LWB: 'Defender', DEF: 'Defender', Defender: 'Defender',
  CDM: 'Midfielder', CM: 'Midfielder', CAM: 'Midfielder', RM: 'Midfielder', LM: 'Midfielder', MID: 'Midfielder', Midfielder: 'Midfielder',
  RW: 'Forward', LW: 'Forward', ST: 'Forward', CF: 'Forward', FWD: 'Forward', Attacker: 'Forward', Forward: 'Forward',
}
/** Broad group for any position the data uses (slot codes like 'LW' or roles like 'Attacker'). */
export function positionGroup(position: string | undefined): PositionGroup {
  return POSITION_GROUPS[position?.trim() ?? ''] ?? 'Midfielder'
}
