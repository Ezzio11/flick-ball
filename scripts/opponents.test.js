// Gate tests for src/lib/opponents.ts (Node strips the TS types on import).
const test = require('node:test');
const assert = require('node:assert');

const load = () => import('../src/lib/opponents.ts');

// Top of the real 24/25 and 25/26 tables, padded to 20.
const pad = (top) => [...top, ...Array.from({ length: 20 - top.length }, (_, i) => `Team ${top.length + i + 1}`)];
const tables = {
    '24/25': pad(['Barcelona', 'Real Madrid', 'Atlético Madrid', 'Athletic Club', 'Villarreal']),
    '25/26': pad(['Barcelona', 'Real Madrid', 'Villarreal', 'Atlético Madrid', 'Real Betis', 'Celta Vigo', 'Getafe', 'Rayo Vallecano',
        'X9', 'X10', 'Athletic Club', 'X12', 'X13', 'X14', 'X15', 'X16', 'X17', 'X18', 'Girona', 'X20']),
};
const ctx = { laligaTables: tables, uclQuarterFinalists: { '24/25': ['Bayern München', 'Borussia Dortmund', 'Inter'], '25/26': ['Paris Saint-Germain'] } };

test('leagueRank: season from date, accent-insensitive, previous table as fallback', async () => {
    const { leagueRank } = await load();
    assert.strictEqual(leagueRank(tables, 'Athletic Club', '2025-01-08'), 4);
    assert.strictEqual(leagueRank(tables, 'Athletic Club', '2025-11-22'), 11);
    assert.strictEqual(leagueRank(tables, 'Atletico Madrid', '2025-12-02'), 4); // no accent in input
    assert.strictEqual(leagueRank(tables, 'Real Betis', '2026-09-20'), 5); // 26/27 not there yet: falls back to 25/26
    assert.strictEqual(leagueRank(tables, 'Bayern München', '2024-10-23'), null);
    assert.strictEqual(leagueRank({}, 'Real Madrid', '2024-10-26'), null);
});

test('opponentTier follows that season\'s table, not reputation', async () => {
    const { opponentTier } = await load();
    const t = (opponent, date, competition = 'LaLiga', round = '1') => opponentTier(ctx, { opponent, date, competition, round });
    assert.strictEqual(t('Athletic Club', '2025-01-08'), 'elite'); // 4th in 24/25
    assert.strictEqual(t('Athletic Club', '2025-11-22'), 'mid'); // 11th in 25/26
    assert.strictEqual(t('Girona', '2026-01-01'), 'weak'); // 19th in 25/26
    assert.strictEqual(t('Villarreal', '2025-12-21'), 'elite'); // 3rd in 25/26
    assert.strictEqual(t('Real Betis', '2025-12-06'), 'strong'); // 5th
    assert.strictEqual(t('Bayern München', '2024-10-23', 'Champions League', '3'), 'elite'); // 24/25 quarter-finalist
    assert.strictEqual(t('Brest', '2024-11-26', 'Champions League', '5'), 'strong');
    assert.strictEqual(t('Inter', '2025-04-30', 'Champions League', '1/2'), 'elite');
    assert.strictEqual(t('CD Guadalajara', '2025-12-16', 'Copa del Rey', '1/16'), 'weak');
});

test('isBigGame: top-4 sides, UCL knockouts, finals; not mid-table Athletic', async () => {
    const { isBigGame } = await load();
    const b = (opponent, date, competition = 'LaLiga', round = '1') => isBigGame(ctx, { opponent, date, competition, round });
    assert.ok(b('Real Madrid', '2024-10-26'));
    assert.ok(b('Athletic Club', '2025-01-08', 'Super Cup', '1/2')); // 4th that season
    assert.ok(!b('Athletic Club', '2025-11-22')); // 11th
    assert.ok(b('Borussia Dortmund', '2025-04-09', 'Champions League', '1/4'));
    assert.ok(!b('Brest', '2024-11-26', 'Champions League', '5'));
    assert.ok(b('Bayern München', '2024-10-23', 'Champions League', '3')); // league phase, but a quarter-finalist
    assert.ok(b('Paris Saint-Germain', '2026-10-20', 'Champions League', '3')); // 26/27 unresolved: 25/26 quarter-finalist
    assert.ok(!b('Chelsea', '2025-11-25', 'Champions League', '5'));
    assert.ok(b('Real Madrid', '2025-04-26', 'Copa del Rey', 'final'));
    assert.ok(!b('Girona', '2026-01-01'));
});
