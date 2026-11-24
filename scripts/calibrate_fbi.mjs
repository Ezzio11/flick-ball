// Recalibrate FBI so each position averages TARGET_MEAN with spread TARGET_SD on the current data,
// and write the constants into the CALIBRATION block of src/lib/fbi-rating.ts.
// Run after a big data change (new season):  node scripts/calibrate_fbi.mjs
import fs from 'node:fs';
import { loadRows, mean, sd } from './fbi_dataset.mjs';

const FILE = new URL('../src/lib/fbi-rating.ts', import.meta.url);
const POSITION_OF = { GK: 'GK', DEF: 'DEF', MID: 'MID', ST: 'FWD', W: 'FWD' };
const POSITIONS = Object.keys(POSITION_OF); // calibration groups

async function fbi() {
    return import(`../src/lib/fbi-rating.ts?t=${Date.now()}`); // fresh copy after each rewrite
}

function writeCalibration(cal) {
    const src = fs.readFileSync(FILE, 'utf8');
    const body = POSITIONS.map(p => `    ${p}: { volumeMean: ${cal[p].volumeMean.toFixed(4)}, rawMean: ${cal[p].rawMean.toFixed(4)}, rawSd: ${cal[p].rawSd.toFixed(4)}, scaleMean: ${cal[p].scaleMean.toFixed(4)} },`).join('\n');
    const next = src.replace(/(\/\/ CALIBRATION:START[^\n]*\n[^\n]*\n)[\s\S]*?(\n};\n\/\/ CALIBRATION:END)/, `$1${body}$2`);
    if (next === src && !src.includes(body)) throw new Error('CALIBRATION block not found');
    fs.writeFileSync(FILE, next);
}

let F = await fbi();
const rows = loadRows().map(r => ({ ...r, group: F.calibrationGroup(r.position, r.role) }));
const cal = {};
for (const p of POSITIONS) {
    const rs = rows.filter(r => r.group === p);
    const full = rs.filter(r => (r.match.minutes_played ?? r.match.minutes) >= 60);
    const volumeMean = mean(full.map(r => F.fbiParts(r.match, POSITION_OF[p]).volume * 90 / (r.match.minutes_played ?? r.match.minutes)));
    cal[p] = { volumeMean, rawMean: 0, rawSd: 1, scaleMean: F.TARGET_MEAN };
}
writeCalibration(cal); F = await fbi();
for (const p of POSITIONS) {
    const raws = rows.filter(r => r.group === p).map(r => F.rawFBI(r.match, r.position, r.role));
    cal[p].rawMean = mean(raws); cal[p].rawSd = sd(raws);
}
// The context bonuses and the 1-10 clamp shift the final numbers a little: correct for them.
for (let i = 0; i < 5; i++) {
    writeCalibration(cal); F = await fbi();
    for (const p of POSITIONS) {
        const finals = rows.filter(r => r.group === p).map(r => F.calculateFBI(r.match, r.position, r.tier, r.role).final);
        cal[p].scaleMean += F.TARGET_MEAN - mean(finals);
        cal[p].rawSd *= sd(finals) / F.TARGET_SD;
    }
}
writeCalibration(cal); F = await fbi();
for (const p of POSITIONS) {
    const finals = rows.filter(r => r.group === p).map(r => F.calculateFBI(r.match, r.position, r.tier, r.role).final);
    console.log(`${p}: n=${finals.length} mean=${mean(finals).toFixed(2)} sd=${sd(finals).toFixed(2)}`);
}
