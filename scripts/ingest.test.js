// Gate tests for the ingest pipeline. Offline: run with `npm test`.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { parseMatchData } = require('./ingest_data');
const { extractPageProps, seasonLabel, seasonStartYear } = require('./fotmob');

const MATCH_ID = 4837472; // Barcelona 3-1 Real Betis, 2026-05-17 (trimmed real FotMob payload)
const details = JSON.parse(fs.readFileSync(path.join(__dirname, '__fixtures__', `match_${MATCH_ID}.json`), 'utf8'));

test('parseMatchData reproduces the stored, known-good match record', () => {
    const stored = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/data/matches.json'), 'utf8'))
        .find(m => m.id === MATCH_ID);
    const parsed = parseMatchData(details, {
        id: MATCH_ID,
        status: { utcTime: stored.date },
        leagueName: 'LaLiga',
    });
    assert.deepStrictEqual(parsed, stored);
});

test('season labels roll over on Aug 1 UTC', () => {
    assert.strictEqual(seasonLabel('2025-07-31T23:59:59Z'), '24/25');
    assert.strictEqual(seasonLabel('2025-08-01T00:00:00Z'), '25/26');
    assert.strictEqual(seasonLabel('2026-05-17T19:15:00Z'), '25/26');
    assert.strictEqual(seasonLabel('2026-11-22T13:00:00Z'), '26/27');
    assert.strictEqual(seasonStartYear('2027-01-10T20:00:00Z'), 2026);
});

test('extractPageProps reads __NEXT_DATA__ and rejects pages without it', () => {
    const html = `<html><script id="__NEXT_DATA__" type="application/json">${JSON.stringify({ props: { pageProps: details } })}</script></html>`;
    assert.strictEqual(extractPageProps(html).header.teams[0].name, 'Barcelona');
    assert.throws(() => extractPageProps('<html>Just a moment...</html>'), /No __NEXT_DATA__/);
    const empty = `<script id="__NEXT_DATA__">${JSON.stringify({ props: { pageProps: {} } })}</script>`;
    assert.throws(() => extractPageProps(empty), /Unexpected/);
});
