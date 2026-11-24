// Gate tests for the ingest pipeline. Offline: run with `npm test`.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { parseMatchData } = require('./ingest_data');
const { isMatch, seasonLabel, seasonStartYear } = require('./fotmob');

const MATCH_ID = 4837472; // Barcelona 3-1 Real Betis, 2026-05-17 (trimmed real FotMob payload)
const details = JSON.parse(fs.readFileSync(path.join(__dirname, '__fixtures__', `match_${MATCH_ID}.json`), 'utf8'));

test('parseMatchData extracts a real match correctly (Barcelona 3-1 Real Betis)', () => {
    const parsed = parseMatchData(details, { id: MATCH_ID, status: { utcTime: '2026-05-17T19:15:00.000Z' }, leagueName: 'LaLiga' });
    assert.strictEqual(parsed.id, MATCH_ID);
    assert.strictEqual(parsed.opponent, 'Real Betis');
    assert.strictEqual(parsed.score, '3 - 1');
    assert.strictEqual(parsed.isHome, true);
    assert.strictEqual(parsed.season, '25/26');
    assert.strictEqual(parsed.competition, 'LaLiga');
    assert.strictEqual(parsed.formation, '4-2-3-1');
    assert.strictEqual(parsed.stats.available, true);
    assert.strictEqual(parsed.stats.possession, 63);
    assert.strictEqual(parsed.stats.xG, '1.35');
    assert.strictEqual(parsed.stats.totalShots, 15);
    assert.strictEqual(parsed.stats.shotsOnTarget, 9);
    assert.deepStrictEqual(parsed.stats.accuratePasses, { value: 641, percentage: 91 });
    assert.deepStrictEqual(parsed.scorers.map(g => `${g.team}:${g.player}:${g.minute}`),
        ['barca:Raphinha:28', 'barca:Raphinha:62', 'opponent:Isco:69', 'barca:João Cancelo:74']);
});

test('season labels roll over on Aug 1 UTC', () => {
    assert.strictEqual(seasonLabel('2025-07-31T23:59:59Z'), '24/25');
    assert.strictEqual(seasonLabel('2025-08-01T00:00:00Z'), '25/26');
    assert.strictEqual(seasonLabel('2026-05-17T19:15:00Z'), '25/26');
    assert.strictEqual(seasonLabel('2026-11-22T13:00:00Z'), '26/27');
    assert.strictEqual(seasonStartYear('2027-01-10T20:00:00Z'), 2026);
});

test('isMatch rejects a payload that is a different match (old cache corruption)', () => {
    assert.ok(isMatch(details, MATCH_ID));
    assert.ok(isMatch(details, String(MATCH_ID)));
    assert.ok(!isMatch(details, 4506777)); // the real bug: 4506777's cache held 4507091
    assert.ok(!isMatch({ general: { matchId: MATCH_ID } }, MATCH_ID)); // no content/header
    assert.ok(!isMatch(null, MATCH_ID));
});

const { lineupPositions } = require('./fotmob');
const { derivePosition } = require('./ingest_players');

test('lineupPositions maps real Barca starters to slots and subs to roles', () => {
    const lineup = lineupPositions(details, 8634);
    const byName = Object.fromEntries(details.content.lineup.homeTeam.starters.map(p => [p.name, lineup.get(String(p.id))]));
    assert.deepStrictEqual(byName['Joan García'], { lineupPosition: 'GK', lineupRole: 'Goalkeeper' });
    assert.strictEqual(byName['João Cancelo'].lineupPosition, 'LB');
    assert.strictEqual(byName['Pedri'].lineupPosition, 'CDM');
    assert.strictEqual(byName['Robert Lewandowski'].lineupPosition, 'ST');
    const sub = details.content.lineup.homeTeam.subs[0];
    assert.strictEqual(lineup.get(String(sub.id)).lineupPosition, null); // subs have no slot
    assert.strictEqual(lineup.size, 11 + details.content.lineup.homeTeam.subs.length); // only Barca, not Betis
    assert.strictEqual(lineupPositions(details, 1).size, 0);
});

test('derivePosition: most common slot, broad role when the slot disagrees or is absent', () => {
    const m = (lineupPosition, lineupRole) => ({ lineupPosition, lineupRole });
    // Gerard Martín: LB early, CB since -> CB
    assert.strictEqual(derivePosition([m('LB', 'Defender'), m('CB', 'Defender'), m('CB', 'Defender')], 'Defender'), 'CB');
    // One start at RW for a midfielder (Pablo Torre) -> Midfielder, not RW
    assert.strictEqual(derivePosition([m('RW', 'Midfielder'), m(null, 'Midfielder')], 'CAM'), 'Midfielder');
    // Bench only -> broad role
    assert.strictEqual(derivePosition([m(null, 'Attacker'), m(null, 'Attacker')], null), 'Attacker');
    // Tie goes to the most recent slot
    assert.strictEqual(derivePosition([m('LB', 'Defender'), m('RB', 'Defender')], null), 'RB');
    // No lineup data at all -> keep what we had
    assert.strictEqual(derivePosition([m(null, null)], 'LW'), 'LW');
});

test('matchCards: yellow, red, and a second yellow counts as both', () => {
    const { matchCards } = require('./fotmob');
    const props = { content: { matchFacts: { events: { events: [
        { type: 'Card', card: 'Yellow', playerId: 1 }, { type: 'Card', card: 'Red', playerId: 2 },
        { type: 'Card', card: 'YellowRed', playerId: 3 }, { type: 'Goal', playerId: 4 }, { type: 'Card', card: 'Yellow' },
    ] } } } };
    const c = matchCards(props);
    assert.deepStrictEqual(c.get('1'), { yellowCard: true, redCard: false });
    assert.deepStrictEqual(c.get('2'), { yellowCard: false, redCard: true });
    assert.deepStrictEqual(c.get('3'), { yellowCard: true, redCard: true });
    assert.strictEqual(c.has('4'), false);
    assert.strictEqual(c.size, 3);
    assert.strictEqual(matchCards({ content: {} }).size, 0);
});
