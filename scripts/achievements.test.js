// Gate tests for src/lib/achievements.ts (Node strips the TS types on import).
const test = require('node:test');
const assert = require('node:assert');

const load = () => import('../src/lib/achievements.ts');

const m = (date, opponent, score, isHome, competition = 'LaLiga', season = '24/25', scorers = []) =>
    ({ id: date, date, opponent, score, isHome, competition, season, scorers });

const honours = {
    trophies: [
        { name: 'LaLiga', won: 29, seasonsWon: ['2025/2026', '2024/2025', '2022/2023', '1929'], seasonsRunnerup: ['2023/2024'] },
        { name: 'Copa del Rey', won: 32, seasonsWon: ['2024/2025', '2020/2021'], seasonsRunnerup: ['2018/2019'] },
        { name: 'Supercopa de España', won: 20, seasonsWon: ['2025/2026', '2024/2025'], seasonsRunnerup: ['2023/2024'] },
        { name: 'Champions League', won: 5, seasonsWon: ['2014/2015'], seasonsRunnerup: ['2025/2026'] },
    ],
    laligaByCoach: [
        { season: '2014/2015', coach: 'Luis Enrique', pointsPerGame: 2.47 },
        { season: '2017/2018', coach: 'Ernesto Valverde', pointsPerGame: 2.45 },
        { season: '2012/2013', coach: 'Tito Vilanova', pointsPerGame: 2.63 },
        { season: '2024/2025', coach: 'Hans-Dieter Flick', pointsPerGame: 2.32 },
    ],
};

test('result reads the score from Barca\'s side', async () => {
    const { result } = await load();
    assert.deepStrictEqual(result(m('2024-10-26', 'Real Madrid', '0 - 4', false)), { gf: 4, ga: 0, outcome: 'W' });
    assert.deepStrictEqual(result(m('2025-10-26', 'Real Madrid', '2 - 1', false)), { gf: 1, ga: 2, outcome: 'L' });
    assert.strictEqual(result(m('2025-01-01', 'X', '1 - 1', true)).outcome, 'D');
});

test('flickTrophies: only Flick-era wins, numbered all-time, newest first', async () => {
    const { flickTrophies } = await load();
    const t = flickTrophies(honours);
    assert.deepStrictEqual(t.map(x => `${x.competition} ${x.season} #${x.nth}`), [
        'LaLiga 2025/2026 #4', 'Supercopa de España 2025/2026 #2',
        'Copa del Rey 2024/2025 #2', 'LaLiga 2024/2025 #3', 'Supercopa de España 2024/2025 #1',
    ]);
});

test('finalsRecord counts cup wins and runner-ups, never LaLiga', async () => {
    const { finalsRecord } = await load();
    assert.deepStrictEqual(finalsRecord(honours), { won: 3, played: 4 }); // the UCL 25/26 runner-up is a lost final
});

test('headToHead: record and biggest win (earliest on a tie)', async () => {
    const { headToHead } = await load();
    const ms = [m('2025-05-11', 'Real Madrid', '4 - 3', true), m('2024-10-26', 'Real Madrid', '0 - 4', false),
        m('2025-10-26', 'Real Madrid', '2 - 1', false), m('2026-05-10', 'Real Madrid', '4 - 0', true), m('2025-01-01', 'Girona', '9 - 0', true)];
    const h = headToHead(ms, 'Real Madrid');
    assert.deepStrictEqual([h.played, h.won, h.drawn, h.lost], [4, 3, 0, 1]);
    assert.strictEqual(h.biggestWin.match.date, '2024-10-26');
});

test('laligaSeasons + bestLeagueSeason: only complete seasons; ties and better seasons reported', async () => {
    const { laligaSeasons, bestLeagueSeason } = await load();
    // 38 games: 31 W, 1 D, 6 L = 94 pts = 2.47
    const season = (label, w, d, l) => [
        ...Array(w).fill(0).map((_, i) => m(`20${label.slice(0, 2)}-09-${i}`, 'X', '1 - 0', true, 'LaLiga', label)),
        ...Array(d).fill(0).map((_, i) => m(`20${label.slice(0, 2)}-10-${i}`, 'X', '0 - 0', true, 'LaLiga', label)),
        ...Array(l).fill(0).map((_, i) => m(`20${label.slice(0, 2)}-11-${i}`, 'X', '0 - 1', true, 'LaLiga', label)),
    ];
    const ms = [...season('24/25', 28, 4, 6), ...season('25/26', 31, 1, 6), ...season('26/27', 12, 0, 1)];
    const s = laligaSeasons(ms);
    assert.deepStrictEqual(s.map(x => [x.season, x.points, x.pointsPerGame, x.complete]),
        [['24/25', 88, 2.32, true], ['25/26', 94, 2.47, true], ['26/27', 36, 2.77, false]]);
    const best = bestLeagueSeason(ms, honours);
    assert.strictEqual(best.season, '25/26'); // 26/27's 2.77 is ignored: incomplete
    assert.deepStrictEqual(best.equalled.map(c => c.season), ['2014/2015']);
    assert.strictEqual(best.betterSince.season, '2012/2013'); // Tito's 2.63
    assert.strictEqual(best.recordsFrom, '2012/2013');
});

test('longestUnbeaten spans draws and resets on a loss', async () => {
    const { longestUnbeaten } = await load();
    const ms = [m('2025-01-01', 'A', '1 - 0', true), m('2025-01-02', 'B', '0 - 1', true), m('2025-01-03', 'C', '1 - 1', true),
        m('2025-01-04', 'D', '2 - 0', true), m('2025-01-05', 'E', '0 - 3', false), m('2025-01-06', 'F', '0 - 1', true)]; // E is an away win, F a home loss
    const u = longestUnbeaten(ms);
    assert.strictEqual(u.length, 3);
    assert.strictEqual(u.from.date, '2025-01-03');
    assert.strictEqual(u.to.date, '2025-01-05');
});

test('secondHalfShare counts only Barca goals, 45th minute is first half', async () => {
    const { secondHalfShare } = await load();
    const ms = [m('2025-01-01', 'A', '3 - 1', true, 'LaLiga', '24/25',
        [{ team: 'barca', minute: 45 }, { team: 'barca', minute: 46 }, { team: 'barca', minute: 90 }, { team: 'opponent', minute: 80 }])];
    assert.deepStrictEqual(secondHalfShare(ms), { goals: 3, share: 2 / 3 });
    assert.strictEqual(secondHalfShare([]), null);
});

test('playerSummary: totals, best season, top-scorer seasons, hat-tricks', async () => {
    const { playerSummary } = await load();
    const players = [
        { name: 'Lewa', matches: [{ matchId: 1, date: '2024-09-01', goals: 3, assists: 1 }, { matchId: 2, date: '2025-09-01', goals: 1 }] },
        { name: 'Raph', matches: [{ matchId: 1, date: '2024-09-01', goals: 1 }, { matchId: 2, date: '2025-09-01', goals: 2, assists: 2 }] },
    ];
    const s = playerSummary(players, 'Lewa');
    assert.deepStrictEqual([s.goals, s.assists, s.apps], [4, 1, 2]);
    assert.strictEqual(s.bestSeason.season, '24/25');
    assert.deepStrictEqual(s.topScorerSeasons, ['24/25']);
    assert.deepStrictEqual(s.hatTricks.map(h => h.matchId), [1]);
    assert.deepStrictEqual(playerSummary(players, 'Raph').topScorerSeasons, ['25/26']);
    assert.strictEqual(playerSummary(players, 'Nobody'), null);
});

test('ordinal and isBackToBack', async () => {
    const { ordinal, isBackToBack } = await load();
    assert.deepStrictEqual([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 29, 111].map(ordinal),
        ['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '23rd', '29th', '111th']);
    assert.ok(isBackToBack(['2024/2025', '2025/2026']));
    assert.ok(isBackToBack(['2025/2026', '2024/2025', '2018/2019']));
    assert.ok(!isBackToBack(['2022/2023', '2024/2025']));
    assert.ok(!isBackToBack(['2024/2025']));
});
