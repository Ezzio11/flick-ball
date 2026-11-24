// No imports, so Node scripts/tests can load it directly (utils.ts re-exports it for the app).
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
