import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export const runtime = 'edge';

// Position mapping for detailed tactical context
const POSITION_DETAILS: Record<string, string> = {
    // TACTICAL ROLES (Generic)
    'Goalkeeper': 'Sweeper-Keeper (stabilizer behind hyper-high line, vocal organization)',
    'Defender': 'High-Line Specialist (must anticipate offside trap triggers, 40m recovery runs)',
    'Midfielder': 'Vertical Engine (looks for through-ball immediately, relentless pressing)',
    'Attacker': 'First Defender (initiates press) / Vertical Finisher (attacks space behind)',

    // GOALKEEPERS
    'Szczęsny': 'Starting Goalkeeper (14 clean sheets, high-line stabilizer, retired-then-returned veteran) [2]',
    'Iñaki Peña': 'Cup Goalkeeper (shot-stopper, secondary option)',
    'ter Stegen': 'Club Captain (Injured/Unavailable - long-term knee injury, mentor role)',

    // DEFENDERS
    'Koundé': 'Right Back (High-volume attacker, forms "Yamal-Axis", 4,423 mins played, elite 1v1 defender) [3]',
    'Cubarsí': 'Right Centre-Back (The "Quarterback", 5.69 progressive passes/90, brain of the offside trap) [4]',
    'Iñigo Martínez': 'Left Centre-Back (The "Marshal", calls the offside line, aggressive step-up, long diagonals) [5]',
    'Balde': 'Left Back (Secondary Winger, holds width allowing Raphinha to roam, recovery pace specialist)',
    'Araujo': 'Centre-Back (Returning Titan, physical monster, high-line recovery specialist) [6]',
    'Gerard Martín': 'Left Back (Defensive specialist, squad rotation) [7]',
    'Héctor Fort': 'Right Back (Inverted option, youth prospect) [8]',
    'Christensen': 'Centre-Back/Pivot (Injured - ACL, ball-playing specialist) [9]',
    'Eric García': 'Centre-Back/Pivot (Utility player, ball circulation)',

    // MIDFIELDERS
    'Casadó': 'Defensive Midfielder (The "Kimmich" role, 14.85km/match, primary anchor, tactical discipline) [10]',
    'Pedri': 'Deep-Lying Playmaker (Orchestrator, 99th percentile progressive carries, now plays deeper to launch attacks) [11]',
    'Dani Olmo': 'Number 10/False 9 (The "Skeleton Key", operates in pockets, tactical variability) [12]',
    'Gavi': 'Interior/Pressing Chaos (Impact sub/starter, aggression trigger, returning from ACL) [13]',
    'Frenkie de Jong': 'Central Midfielder (Ball carrier, rotation option for vertical control)',
    'Fermín López': 'Attacking Midfielder (The "Shadow Striker", crashes box late, 0.53 goals/90) [14]',
    'Pablo Torre': 'Attacking Midfielder (Set-piece specialist, rotation creator)',
    'Marc Bernal': 'Pivot (Injured - long-term prospect)',

    // ATTACKERS
    'Lewandowski': 'Centre-Forward (Pure Poacher, screened from pressing duties, 42 goals, target man) [15]',
    'Raphinha': 'Left Winger/Free Role ("The Pressing Captain", starts the press, 22 assists, covers entire pitch) [16]',
    'Lamine Yamal': 'Right Winger (Creative Engine, 21 assists, 99th percentile dribbling, cuts inside) [17]',
    'Ferran Torres': 'Forward/Winger ("The Shark", runs into channels to create space, rotation scorer) [18]',
    'Pau Víctor': 'Striker (Backup 9, high xG per 90, direct Lewandowski deputy) [19]',
    'Ansu Fati': 'Left Winger (Squad player, seeking form)',

    // FALLBACK
    'Unknown': 'Squad player expecting vertical instructions'
};

const SYSTEM_PROMPT = `
You are the Chief Tactical Analyst for FC Barcelona under Hansi Flick (2024-2026 era).

FLICK'S TACTICAL DNA (THE "GROUND TRUTHS"):
- THE TRAP: We play a "Hyper-Aggressive High Line". We forced 201 offsides in 36 games (5.5/game) - the highest in Europe.
- VERTICAL POSSESSION: We have ~66% possession, but we do NOT play "Tiki-Taka". We play "Vertical Tiki-Taka". Pass to provoke -> Pass to penetrate.
- THE ENGINE: Marc Casadó is the anchor (14.8km distance). Raphinha is the "Pressing Captain" (starts the trigger).
- THE FINISHER: Lewandowski does NOT chase CBs. He screens the Pivot. We save his energy for the box (42 goals).
- WIDTH & 1v1: Koundé overlaps to isolate Lamine Yamal (1v1 specialist). Balde provides pure width on the left.

TASK: Write a short, insightful match analysis snippet for the user's selected player.

STYLE GUIDE:
- Format: A single, punchy, natural paragraph (3-4 sentences).
- Tone: Clinical, professional, but flowing (like a high-end football article).
- NO Bullet points. NO bold headings (like **Role Definition**).
- Weave the stats naturally into the narrative. Don't say "The stat is...". Say "With 22 assists, he..."
- Focus on *WHY* they matter to the system (High Line, Vertical Play).

Example Output:
"Operating as the tactical skeleton key, he keeps the high line compact by aggressively stepping up to trap opponents. His 14 clean sheets aren't just saves; they are a result of his sweep-keeper distribution allowing the team to pin rivals deep. By acting as the 11th outfielder, he ensures the vertical possession chain starts from the very first pass."
`;


// --- PROVIDER IMPLEMENTATIONS ---

async function callPollinations(prompt: string) {
    const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Pollinations Failed");
    return await res.text();
}

async function callGemini(prompt: string) {
    if (!process.env.GEMINI_API_KEY) throw new Error("No Gemini Key");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
}

async function callGroq(prompt: string) {
    if (!process.env.GROQ_API_KEY) throw new Error("No Groq Key");
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 300
    });
    return completion.choices[0]?.message?.content || "";
}

async function callCerebras(prompt: string) {
    if (!process.env.CEREBRAS_API_KEY) throw new Error("No Cerebras Key");
    const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.CEREBRAS_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama3.1-8b",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 300
        })
    });
    if (!response.ok) throw new Error("Cerebras Failed");
    const data = await response.json();
    return data.choices[0].message.content;
}

async function callOpenRouter(prompt: string) {
    if (!process.env.OPENROUTER_API_KEY) throw new Error("No OpenRouter Key");
    const openai = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: process.env.OPENROUTER_API_KEY,
        defaultHeaders: { "HTTP-Referer": "https://flick-ball.vercel.app" },
    });
    const completion = await openai.chat.completions.create({
        model: "meta-llama/llama-3-8b-instruct:free",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 300
    });
    return completion.choices[0].message.content || "";
}

async function callHuggingFace(prompt: string) {
    if (!process.env.HUGGING_FACE_TOKEN) throw new Error("No HF Token");
    const response = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3",
        {
            headers: { Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`, "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({ inputs: prompt, parameters: { max_new_tokens: 300, return_full_text: false } })
        }
    );
    if (!response.ok) throw new Error("HF Error");
    const res = await response.json();
    return Array.isArray(res) ? res[0].generated_text : "";
}

// --- MAIN HANDLER ---

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { prompt, playerName, position } = body;

        // Get detailed position context
        const detailedPosition = POSITION_DETAILS[playerName] ||
            POSITION_DETAILS[position] ||
            POSITION_DETAILS['Unknown'];

        // Construct full prompt with position context
        const positionContext = `\nPLAYER CONTEXT:\n- Name: ${playerName || 'Unknown'}\n- Role: ${detailedPosition}\n`;
        const fullPrompt = `${SYSTEM_PROMPT}${positionContext}\n${prompt}`;
        let commentary = "";

        // WATERFALL STRATEGY
        try {
            // 1. Groq (Fastest)
            console.log("Attempting GROQ...");
            commentary = await callGroq(fullPrompt);
        } catch (e) {
            try {
                // 2. Gemini (Best Quality)
                console.log("Groq failed. Attempting GEMINI...");
                commentary = await callGemini(fullPrompt);
            } catch (e) {
                try {
                    // 3. Cerebras (Fast)
                    console.log("Gemini failed. Attempting CEREBRAS...");
                    commentary = await callCerebras(fullPrompt);
                } catch (e) {
                    try {
                        // 4. OpenRouter
                        console.log("Cerebras failed. Attempting OPENROUTER...");
                        commentary = await callOpenRouter(fullPrompt);
                    } catch (e) {
                        try {
                            // 5. HuggingFace
                            console.log("OpenRouter failed. Attempting HUGGINGFACE...");
                            commentary = await callHuggingFace(fullPrompt);
                        } catch (e) {
                            // 6. Pollinations (Fallback)
                            console.log("All failed. Falling back to POLLINATIONS...");
                            commentary = await callPollinations(fullPrompt);
                        }
                    }
                }
            }
        }

        return NextResponse.json({ commentary });

    } catch (error) {
        console.error("Narrative Engine Full Crash:", error);
        return NextResponse.json({ commentary: ">> DATA ERROR. REBOOTING SYSTEM." }, { status: 500 });
    }
}
