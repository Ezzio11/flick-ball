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

export { positionGroup, type PositionGroup } from './positions'
