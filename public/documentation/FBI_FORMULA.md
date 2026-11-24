# FlickBall Index (FBI) - Formula Documentation v1.0

## Overview
The **FlickBall Index (FBI)** is a transparent, mathematically rigorous player rating system designed specifically for **Hansi Flick's FC Barcelona**. Unlike opaque commercial ratings, FBI evaluates players based on their contribution to the specific system requirements: high pressing, verticality, and risk-taking.

**Scale:** 1.0 (catastrophic) to 10.0 (perfect)
**Target Average:** ~6.8
**Standard Deviation:** ~1.3

---

## Core Philosophy: The 4 Dimensions

FBI evaluates outfield players across 4 dimensions, weighted differently for each position:

### 1. Offensive Contribution (OC)
Measures direct goal threat and creation quality.
```
OC = (Goals × 1.6) + (Assists × 1.1) +
     (xG × 0.8) + (xA × 0.8) +
     (Key Chances × 0.5) + (Shots on Target × 0.2) +
     (Penalties Won × 0.6) + (Was Fouled × 0.1) -
     (Big Chances Missed × 0.3) - (Offsides × 0.15)
```

### 2. Passing & Build-Up (PBU)
Evaluates verticality and progression (match totals; the per-90 conversion happens once, see *Minutes*).
```
PBU = (Accurate Passes × 0.01) +
      (Passes to Final 3rd × 0.3) +    <-- Heavily rewarded for vertical play
      (Long Balls Accurate × 0.1) +
      (Touches × 0.005) +
      (Corners × 0.05) +
      (Crosses × PositionWeight)          <-- FWD: 0.3, DEF: 0.2, MID: 0.15
```

### 3. Defensive Contribution (DC)
Measures intensity and effectiveness of the press.
```
DC = (Interceptions × 0.5) +              <-- Critical for high press
     (Recoveries × 0.4) +                 <-- Critical for Gegenpressing
     (Tackles × 0.3) +
     (Duel Win Rate × 0.5) +
     (Clearances × 0.25) +
     (Shot Blocks × 0.2) +
     (Aerials Won × 0.15) -
     (Dribbled Past × 0.25)
```

### 4. Ball Retention & Progression (BRP)
Evaluates ability to beat the press and carry the ball.
```
BRP = (Successful Dribbles × 0.4) +
      (Touches in Box × 0.15) -
      (Dispossessed × 0.3) -
      (Fouls Committed × 0.1)
```

### Discipline Penalty
```
Penalty = -(Yellow Card × 0.3) - (Red Card × 2.0)
```

---

## Position Weighting System

To ensure fair evaluation, each component is weighted by the player's role:

| Component | GK | DEF | MID | FWD |
|-----------|----|-----|-----|-----|
| Offensive | 0.2 | 0.4 | **0.7** | **1.0** |
| Passing | 0.3 | 0.6 | **1.0** | 0.6 |
| Defensive | **1.0** | **1.0** | 0.6 | 0.5 |
| Retention | 0.2 | 0.5 | 0.8 | **1.0** |

---

## The "Wall" Algorithm (Goalkeepers)

Goalkeepers are scored on a completely separate model tailored to the modern Sweeper-Keeper role.

1. **Shot-Stopping (35%)**: `(PSxG - Goals) × 3.5` + Volume Metrics
2. **Sweeping (35%)**: Sweeper Actions × 1.8 + Claims & Aerials
3. **Distribution (30%)**: Long Balls & Pass Accuracy
4. **Penalties**: Goals Conceded (-0.8), Yellow (-0.5), Red (-2.0), Penalty Conceded (-0.8)

Shot-stopping and penalties count in full; sweeping and distribution are volume (see *Minutes*).

---

## Minutes, Context and Calibration

**Events vs volume.** Goals, assists, xG/xA, chances, shots and cards (the weighted Offensive score plus discipline) count in full, however long the player was on: a goal off the bench is a goal. Passing, Defensive and Retention (weighted) are *volume*: they are turned into a per-90 rate, with 120 minutes of position-average play blended in:

```
Volume/90 = (Volume × 90 + 120 × PositionAverage/90) / (Minutes + 120)
Raw       = Events + Volume/90
```

A 90-minute game keeps 43% of its own volume rate, a 10-minute cameo 8%, so a quiet cameo counts as roughly average instead of terrible, and a 7-minute burst of passes can't count as a world-class game.

**Scale.** Raw is mapped so that every role (goalkeepers, centre-backs, full-backs, holding and attacking midfielders, strikers and wingers) averages **6.8** with a spread of **1.3** on the real data (`node scripts/calibrate_fbi.mjs` writes the constants; `scripts/fbi.test.js` fails if they drift).

**Context** is added to the rating, never multiplied:

| | Bonus |
|---|---|
| Win / Draw / Loss | +0.3 / 0 / −0.2 |
| Opponent top-4 / 5-8 / 9-14 / 15-20 in that season's LaLiga table | +0.2 / +0.1 / 0 / −0.2 |

Champions League knockout opponents and that season's quarter-finalists count as top-4; other UCL sides as 5-8.

**Ceiling.** Up to 9.0 the rating is untouched; above it, it eases toward 10 (`9 + (1 − e^−(x−9))`), so a 10.0 is a once-a-season game.

---

## Worked Example: Pedri vs Valencia (5-0, 6 Sept 2026)

Computed by the real code (`src/lib/fbi-rating.ts`).

**Stats:** 81 minutes · 1 goal · xG 0.30 · xA 0.11 · 1 shot on target · 69 accurate passes (10 into the final third, 2 long balls) · 86 touches · 3 tackles · 8 recoveries · duels 4/5 · 1 dribble · 5 touches in the box

**1. Components (unweighted):** Offensive 2.13 · Passing 4.32 · Defensive 4.50 · Retention 1.15 · Discipline 0

**2. Midfielder weights (0.7 / 1.0 / 0.6 / 0.8):**
- Events = 2.13 × 0.7 = **1.49**
- Volume = 4.32 × 1.0 + 4.50 × 0.6 + 1.15 × 0.8 = **7.94** (in 81 minutes)

**3. Minutes:** Volume/90 = (7.94 × 90 + 120 × 6.16) / (81 + 120) = **7.23** → Raw = 1.49 + 7.23 = **8.72**

**4. Scale (MID: mean 6.99, spread 1.28):** 6.61 + (8.72 − 6.99) / 1.28 × 1.3 = **8.36**

**5. Context:** Valencia were 15th-20th (−0.2), win (+0.3) → **FBI 8.5** (FotMob: 8.64)
