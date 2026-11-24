// Gate tests for the FlickBall Index (src/lib/fbi-rating.ts). Offline; Node strips the TS types.
const test = require('node:test');
const assert = require('node:assert');

const load = () => import('../src/lib/fbi-rating.ts');
const dataset = () => import('./fbi_dataset.mjs');

const base = { matchId: 1, opponent: 'X', date: '2025-01-01T20:00:00Z', competition: 'LaLiga', result: '0 - 0', minutes: 90, minutes_played: 90 };

test('matchOutcome reads home-first scores from Barca\'s side (46% of ratings had it backwards)', async () => {
    const { matchOutcome } = await load();
    assert.strictEqual(matchOutcome({ ...base, result: '0 - 4', isHome: false }), 'W');  // 0-4 at the Bernabeu
    assert.strictEqual(matchOutcome({ ...base, result: '2 - 1', isHome: false }), 'L');  // lost away
    assert.strictEqual(matchOutcome({ ...base, result: '2 - 1', isHome: true }), 'W');
    assert.strictEqual(matchOutcome({ ...base, result: '1 - 1', isHome: false }), 'D');
    assert.strictEqual(matchOutcome({ ...base, result: '0 - 4', teamScore: 4, opponentScore: 0 }), 'W'); // enriched fields win
    assert.strictEqual(matchOutcome({ ...base, result: 'n/a' }), 'D');
});

test('fields the data actually uses are counted (ShotsOnTarget, Offsides, cards)', async () => {
    const { fbiParts } = await load();
    const ev = (m) => fbiParts({ ...base, ...m }, 'FWD').event;
    assert.ok(ev({ ShotsOnTarget: 3 }) > ev({}));
    assert.ok(ev({ Offsides: 3 }) < ev({}));
    assert.ok(ev({ yellowCard: true }) < ev({}));
    assert.ok(ev({ redCard: true }) < ev({ yellowCard: true }));
});

test('goalkeeper: a conceded penalty or red card lowers the score (was a double negative)', async () => {
    const { fbiParts } = await load();
    const gk = (m) => fbiParts({ ...base, ...m }, 'GK').event;
    assert.ok(gk({ conceded_penalties: 1 }) < gk({}));
    assert.ok(gk({ redCard: true }) < gk({}));
});

test('short appearances: volume is a per-90 rate blended toward average, events count in full', async () => {
    const { volumePer90, SHRINK_MINUTES, fbiParts } = await load();
    assert.strictEqual(volumePer90(0, 0, 5), 5);                       // no minutes played: exactly average
    assert.ok(Math.abs(volumePer90(10, 90, 5) - 5) < Math.abs(10 - 5)); // full game keeps part of its own rate
    const tiny = volumePer90(3, 7, 6);                                   // 7' cameo at a 38.6/90 pace
    assert.ok(tiny < 10, `7-minute cameo should stay near average, got ${tiny}`);
    assert.ok(SHRINK_MINUTES > 0);
    const goal = fbiParts({ ...base, goals: 1, minutes: 10, minutes_played: 10 }, 'FWD').event;
    const goal90 = fbiParts({ ...base, goals: 1 }, 'FWD').event;
    assert.strictEqual(goal, goal90);                                    // a goal off the bench is a goal
});

test('outfield players are calibrated by role from their stored position', async () => {
    const { calibrationGroup } = await load();
    assert.strictEqual(calibrationGroup('FWD', 'LW'), 'W');
    assert.strictEqual(calibrationGroup('FWD', 'RW'), 'W');
    assert.strictEqual(calibrationGroup('FWD', 'ST'), 'ST');
    assert.strictEqual(calibrationGroup('FWD', 'Attacker'), 'ST'); // broad role, no wing slot
    assert.strictEqual(calibrationGroup('MID', 'CAM'), 'AM');
    assert.strictEqual(calibrationGroup('MID', 'CDM'), 'DM');
    assert.strictEqual(calibrationGroup('MID', 'Midfielder'), 'DM'); // broad role: central default
    assert.strictEqual(calibrationGroup('DEF', 'LB'), 'FB');
    assert.strictEqual(calibrationGroup('DEF', 'RWB'), 'FB');
    assert.strictEqual(calibrationGroup('DEF', 'CB'), 'CB');
    assert.strictEqual(calibrationGroup('DEF', 'Defender'), 'CB');   // broad role: central default
    assert.strictEqual(calibrationGroup('GK', 'GK'), 'GK')
});

test('softCap leaves ratings to 9.0 alone and keeps a 10.0 rare', async () => {
    const { softCap } = await load();
    assert.strictEqual(softCap(7.3), 7.3);
    assert.strictEqual(softCap(9), 9);
    assert.ok(softCap(10) < 10 && softCap(10) > 9.5);
    assert.ok(softCap(13) < 10);
});

test('on the real data: calibrated scale, rare 10s, agreement with FotMob, fair to subs', async () => {
    const { calculateFBI, matchOutcome, calibrationGroup, CALIBRATION_GROUPS } = await load();
    const { loadRows, mean, sd } = await dataset();
    const rows = loadRows().map(r => ({ ...r, group: calibrationGroup(r.position, r.role), f: calculateFBI(r.match, r.position, r.tier, r.role) }));
    const hint = ' (data drifted: run `node scripts/calibrate_fbi.mjs`)';
    for (const p of CALIBRATION_GROUPS) {
        const x = rows.filter(r => r.group === p).map(r => r.f.final);
        assert.ok(Math.abs(mean(x) - 6.8) <= 0.15, `${p} mean ${mean(x).toFixed(2)}${hint}`);
        assert.ok(Math.abs(sd(x) - 1.3) <= 0.15, `${p} spread ${sd(x).toFixed(2)}${hint}`);
    }
    const truth = ({ match: m }) => (m.teamScore > m.opponentScore ? 'W' : m.teamScore < m.opponentScore ? 'L' : 'D');
    assert.strictEqual(rows.filter(r => matchOutcome(r.match) !== truth(r)).length, 0);
    assert.ok(rows.filter(r => r.f.final >= 10).length / rows.length < 0.01, 'a 10.0 must stay rare');
    const pr = rows.filter(r => r.match.rating);
    const a = pr.map(r => r.f.final), b = pr.map(r => r.match.rating), ma = mean(a), mb = mean(b);
    const corr = a.reduce((s, x, i) => s + (x - ma) * (b[i] - mb), 0) / Math.sqrt(a.reduce((s, x) => s + (x - ma) ** 2, 0) * b.reduce((s, y) => s + (y - mb) ** 2, 0));
    assert.ok(corr >= 0.72, `agreement with FotMob fell to ${corr.toFixed(3)} (0.75 when this test was written)`);
    const benchGoals = rows.filter(r => (r.match.minutes_played ?? r.match.minutes) <= 20 && r.match.goals >= 1).map(r => r.f.final);
    assert.ok(mean(benchGoals) > 6.8, `goals off the bench average ${mean(benchGoals).toFixed(2)}`);
});
