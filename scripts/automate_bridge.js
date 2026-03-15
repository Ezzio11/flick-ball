const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function run() {
    console.log('Connecting to existing Chrome instance on port 9222...');
    
    let browser;
    try {
        browser = await chromium.connectOverCDP('http://localhost:9222');
    } catch (e) {
        console.error('❌ Failed to connect. Ensure Chrome is running with --remote-debugging-port=9222');
        process.exit(1);
    }

    const context = browser.contexts()[0];
    const page = context.pages().find(p => p.url().includes('fotmob.com')) || await context.newPage();
    
    if (!page.url().includes('fotmob.com')) {
        console.log('Navigating to fotmob.com...');
        await page.goto('https://www.fotmob.com', { waitUntil: 'domcontentloaded' });
    }

    console.log('Injecting bridge script with Auto-Discovery...');
    
    const data = await page.evaluate(async () => {
        const TEAM_ID = 8634; // Barcelona
        console.log("[CDP] Discovering matches...");
        
        try {
            const teamRes = await fetch(`https://www.fotmob.com/api/teams?id=${TEAM_ID}&tab=fixtures`);
            const teamData = await teamRes.json();
            const fixtures = teamData.fixtures?.allFixtures?.fixtures || [];
            
            const matchIds = fixtures.filter(f => {
                const isFinished = f.status.finished;
                const isFriendly = f.tournament?.name?.toLowerCase().includes('friendly');
                return isFinished && !isFriendly;
            }).map(f => f.id);
            
            console.log(`[CDP] Found ${matchIds.length} matches. Fetching details...`);
            
            const results = [];
            for (const id of matchIds) {
                try {
                    const res = await fetch(`https://www.fotmob.com/api/matchDetails?matchId=${id}`);
                    results.push({ id, data: await res.json() });
                    await new Promise(r => setTimeout(r, Math.floor(Math.random() * 1500) + 1000));
                } catch (e) { console.error(e); }
            }
            return results;
        } catch (e) {
            console.error("[CDP] Discovery failed", e);
            return [];
        }
    });

    const CACHE_DIR = path.join(__dirname, '../.cache');
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    
    const outputPath = path.join(CACHE_DIR, 'batch_export.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    
    console.log(`✅ Success! Batch data saved to ${outputPath}`);
    process.exit(0);
}

run();
