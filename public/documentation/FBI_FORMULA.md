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
Evaluates verticality and progression (normalized per 90 mins).
```
PBU = (Accurate Passes/90 × 0.01) +
      (Passes to Final 3rd/90 × 0.3) +    <-- Heavily rewarded for vertical play
      (Long Balls Accurate × 0.1) +
      (Touches/90 × 0.005) +
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
      (Touches in Box/90 × 0.15) -
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
| Defensive | **1.0** | **1.0** | 0.6 | 0.3 |
| Retention | 0.2 | 0.5 | 0.8 | **1.0** |

---

## The "Wall" Algorithm (Goalkeepers)

Goalkeepers are scored on a completely separate model tailored to the modern Sweeper-Keeper role.

1. **Shot-Stopping (35%)**: `(PSxG - Goals) × 3.5` + Volume Metrics
2. **Sweeping (35%)**: Sweeper Actions × 1.8 + Claims & Aerials
3. **Distribution (30%)**: Long Balls & Pass Accuracy
4. **Penalties**: Goals Conceded (-0.8), Errors (-2.0)

---

## Validated Example: Pedri vs Girona

**Stats:**
- Minutes: 69
- Goals: 1, Assists: 0
- xG: 0.21, xA: 0.02
- Key Chances: 1, SOT: 1
- Passing: 30 Acc (7 Final 3rd)
- Defensive: 3 Tackles, 0 Int, 3 Recov
- Duels: 5 Won / 3 Lost (62.5%)

**1. Calculate Components:**
- **Offensive:** (1×1.6) + (0.21×0.8) + (1×0.5) + (1×0.2) = **2.468**
- **Passing:** (30×0.01) + (7×0.3) + (1×0.1) = **2.50** (normalized)
- **Defensive:** (3×0.3) + (3×0.4) + (0.625×0.5) = **2.41**
- **Retention:** (1×0.4) + (2×0.15) = **0.70**

**2. Apply Midfielder Weights:**
- Off: 2.468 × 0.7 = 1.72
- Pass: 2.50 × 1.0 = 2.50
- Def: 2.41 × 0.6 = 1.44
- Ret: 0.70 × 0.8 = 0.56
- **Raw Score = 6.22**

**3. Apply Context:**
- Opponent (Girona - Mid Table): **1.0**
- Result (Win): **+0.3**
- **Context Score = 6.22 × 1.0 × 1.3 = 8.08**

**4. Normalization (Z-Score):**
- Empirical Mean for MID: ~4.5
- Final Z-Score Mapping → **FBI Rating: 8.9**

*(Note: Real-time calculation uses float precision)*
