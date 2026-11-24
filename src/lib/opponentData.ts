import honours from './honours.json';
import { opponentTier, isBigGame, OpponentMatch, OpponentContext, Tier } from './opponents';

const ctx: OpponentContext = {
    laligaTables: (honours as Partial<OpponentContext>).laligaTables ?? {},
    uclQuarterFinalists: (honours as Partial<OpponentContext>).uclQuarterFinalists ?? {},
};

/** Opponent tier from the real LaLiga tables and UCL results (see src/lib/opponents.ts for the rule). */
export const tierOf = (m: OpponentMatch): Tier => opponentTier(ctx, m);
export const bigGame = (m: OpponentMatch): boolean => isBigGame(ctx, m);
