---
title: "Affection System and Point Guide"
description: "Hidden affection values, thresholds, relationship checks, and all available point gains in Password b0.85"
toc: true
---

Password b0.85 tracks a separate hidden affection value for each of the six main characters.

These values are not displayed as an in-game meter. They begin at 0 in a new game, increase through specific choices or automatic story events, and are checked later for text variations, intimate options, several CGs, and the D19 relationship outcome.

::: {.callout-important}
## What affection does—and does not—control

Affection can affect:

- internal narration and short dialogue variations;
- hugs, kisses, and other intimate options;
- whether a kiss or relationship has occurred;
- several Gallery CGs;
- whether a D19 relationship is automatic, optional, or unavailable.

No lettered Path, Vault-password result, survival check, medal check, or Path P condition directly reads any of the six affection values.
:::

## Core behavior

::: {.pw-rule-groups}

**Saves and loading**

- All six values are ordinary story-save values, not persistent data.
- Loading an older save restores the affection values stored in that save.

**Points and choices**

- Affection does not decrease during normal play.
- Choices outside the current character route can still award points.
- D5 movie choices and the D7 family-subject menu can award points to several characters, but each menu still allows only one selection.

**Reset exception**

- Path C contains one important exception: the Sal pool sequence directly sets Sal's affection to 0.

:::

The listed thresholds include the threshold itself. For example, Hoss affection 15–19 means a value from 15 through 19.

## Threshold overview

| Character | Affection thresholds |
|---|---|
| Orlando | 5, 7, 10, 15, 18, 20 |
| Dean | 5, 10, 15, 17, 20 |
| Tyson | 10, 15, 16, 17, 18, 20 |
| Roswell | 5, 10, 15, 20 |
| Hoss | 5, 12, 15, 16, 20 |
| Sal | 8, 15, 16, 20 |

## D19 relationship outcomes

::: {.pw-key-rule}

The D19 relationship check uses the affection value for the current character Route.

:::

::: {.affection-d19-summary-table .table-responsive .table-scroll-large}

| Character | Automatic at | Choice range | Choice | Below range |
|---|---:|---:|---|---|
| Dean | Dean affection ≥ 10 | None | None | Relationship automatically fails |
| Orlando | Orlando affection ≥ 20 | Orlando affection 10–19 | `I love you too.` / `Stay quiet.` | Automatic rejection |
| Tyson | Tyson affection ≥ 20 | Tyson affection 10–19 | `I love you.` / `...` | Automatic rejection |
| Roswell | Roswell affection ≥ 20 | Roswell affection 10–19 | `Relationship` / `Friendship` | Automatic friendship result |
| Hoss | Hoss affection ≥ 20 | Hoss affection 15–19 | `Try dating.` / `Stay friends.` | Automatic friends result |
| Sal | Sal affection ≥ 20 | Sal affection 15–19 | `Romantic` / `Platonic` | Automatic friends result |

:::

Dave enters a romantic relationship with the character only when the automatic relationship threshold is reached or the player accepts a relationship in the middle point range. Dean is the only route without a middle choice range.

## Hoss threshold planning

Hoss is the character for whom point planning matters most because two Gallery images sit behind different D8 and D19 outcomes.

### D8 hidden-library kiss CG

Without any D1 cup-affection result or the D3 hidden shared bonus, the highest possible value before the D8 hidden-library check is **13**.

The threshold of 12 is therefore achievable through ordinary visible choices alone.

If Hoss enters the library below 12:

1. the D8 kiss and hidden-library kiss CG do not occur;
2. being below 12 awards 2 points;
3. the later `Hold his hand` choice can award another 2 points.

::: {.pw-key-rule}

Those later gains help with D19, but they occur after the D8 check and cannot repair the missed CG in that run.

:::

### D19 Hoss relationship CG

Under the same restriction—no D1 cup-affection result and no D3 hidden shared bonus—the maximum by D19 is **19**. That still opens the `Try dating.` / `Stay friends.` menu, but it cannot trigger the automatic 20-point relationship.

Using the D1 `Hoss` cup-name point raises that ordinary maximum to exactly 20. Hidden shared bonuses provide additional margin but are not required for the D8 kiss.

## Shared and cross-character gains

::: {.affection-shared-gains-table .table-responsive .table-scroll-compact}

| Source | Gain | Input rule |
|---|---:|---|
| D1 shared-affection cup answer | All six characters +1 | Same cup input as every other D1 answer; trims spaces but is case-sensitive |
| D1 hidden driver-name answer | All six characters +1 | Same mutually exclusive cup input |
| D1 exact main-character name | Matching character +1 | Exact title-case spelling after trimming spaces |
| D3 hidden shared-affection input | All six characters +5 | Trims spaces and converts the input to uppercase |

:::

The D1 options share one input field, so only one D1 branch can apply in a single run. The D3 bonus is independent.

Visible ordinary menus can also affect several characters:

- one D5 movie choice can award points to multiple characters;
- one D7 family-subject choice can award points to multiple characters.

Every available point gain is listed in the character tables below.

## Complete point list

The tables list all 126 point gains available in normal play, plus each character's D1 exact-name point. Points available only in Replay Mode or never awarded during a normal run are excluded.

Exact menu strings are preserved for comparison with the game. Rows from the same mutually exclusive menu are not simultaneously obtainable.

::: {.panel-tabset .character-tabs group="affection-character"}

### Orlando

::: {.affection-point-table .affection-orlando-table .table-responsive .table-scroll-large}

| Day | Choice / condition | Requirement | Points |
|---|---|---|---:|
| D1 | Enter `Orlando` as the cup name | Exact capitalization after trimming spaces | +1 |
| D2 | `Cherry Pie!` | — | +1 |
| D3 | `Orlando` | D3 message recipient | +1 |
| D4 | `Wind?` | Orlando Route | +1 |
| D5 | `Yes.` | Orlando Route | +1 |
| D5 | `Cookies` | Orlando Route; D5 Orlando dessert | +1 |
| D5 | `Brownies` | Orlando Route; D5 Orlando dessert | +1 |
| D5 | `Comedy` | mutually exclusive D5 movie choice | +1 |
| D6 | `Orlando` | Sal or Orlando Route | +1 |
| D6 | `What was it like?` | Orlando Route | +1 |
| D6 | `Yes.` | Orlando Route; successful D6 Vault check; Orlando affection at least 7; D6 Orlando follow-up yes/no | +1 |
| D6 | automatic after the first practice kiss | Orlando Route; successful D6 Vault check; Orlando affection 5–6 | +1 |
| D7 | `Hug.` | Orlando Route; D7 Orlando response | +1 |
| D7 | `Advice.` | Orlando Route; D7 Orlando response | +2 |
| D7 | `Stay.` → `Dean.` | mutually exclusive D7 family-subject choice | +1 |
| D7 | `Stay.` → `Roswell.` | mutually exclusive D7 family-subject choice | +1 |
| D7 | `Stay.` → `Orlando.` | mutually exclusive D7 family-subject choice | +2 |
| D9 | `...Reverse.` | Roswell Route, Orlando Route, or Sal Route; D9 Uno final-card menu | +1 |
| D9 | `Hold his hand.` | Orlando Route | +2 |
| D9 | `Invite him to stay.` | Orlando Route; D9 night Orlando menu | +1 |
| D9 | `Reassure him.` | Orlando Route; D9 night Orlando menu | +2 |
| D15 | `Kiss him.` | Orlando Route; Path A or B | +2 |
| D16 | `Agree.` | Orlando Route; Path A or B; Orlando affection at least 15 | +1 |

:::

### Dean

::: {.affection-point-table .affection-dean-table .table-responsive .table-scroll-large}

| Day | Choice / condition | Requirement | Points |
|---|---|---|---:|
| D1 | Enter `Dean` as the cup name | Exact capitalization after trimming spaces | +1 |
| D2 | `Greenhouse.` — automatic on entering the room | — | +1 |
| D3 | `Dean` | D3 message recipient | +1 |
| D4 | `Call for help.` | Dean Route | +1 |
| D5 | automatic during the Dean Route morning scene | Dean Route | +2 |
| D5 | `Dean` → `Get Closer` | Dean Route | +1 |
| D5 | `Comedy` | mutually exclusive D5 movie choice | +2 |
| D5 | `Action` | mutually exclusive D5 movie choice | +1 |
| D5 | `Romance` → `Hold his hand` | Dean Route; mutually exclusive D5 movie choice | +1 |
| D6 | `Dean.` → `Yes` | Dean Route; kissed Dean on D5; choose Dean during the D6 check-in | +2 |
| D6 | `Hold his hand.` | Dean Route | +1 |
| D7 | `Stay.` → `Dean.` | mutually exclusive D7 family-subject choice | +3 |
| D7 | `Stay.` → `Hoss.` | mutually exclusive D7 family-subject choice | +1 |
| D7 | `Stay.` → `Sal.` | mutually exclusive D7 family-subject choice | +2 |
| D9 | `Dean.` | Dean Route, Hoss Route, or Tyson Route; D9 morning companion menu | +1 |
| D15 | `Go for it.` | Dean Route; Path A or B; D15 Dean response | +1 |
| D15 | `Hold off.` | Dean Route; Path A or B; D15 Dean response | +2 |

:::

### Tyson

::: {.affection-point-table .affection-tyson-table .table-responsive .table-scroll-large}

| Day | Choice / condition | Requirement | Points |
|---|---|---|---:|
| D1 | Enter `Tyson` as the cup name | Exact capitalization after trimming spaces | +1 |
| D2 | `I like how you smell.` | — | +1 |
| D3 | `Tyson` | D3 message recipient | +1 |
| D3 | `Tyson.` | D3 lunch companion | +1 |
| D3 | `Tyson.` → `Chase after Tyson.` | — | +1 |
| D4 | `Grab his hand.` | Tyson Route | +1 |
| D5 | `Beating?` | Tyson Route | +1 |
| D5 | `Tyson` | Tyson Route | +1 |
| D5 | `Horror` | mutually exclusive D5 movie choice | +1 |
| D5 | `Comedy` | mutually exclusive D5 movie choice | +1 |
| D5 | `Action` | mutually exclusive D5 movie choice | +1 |
| D5 | `Romance` | Tyson Route; mutually exclusive D5 movie choice | +1 |
| D6 | `Tyson.` → `I didn't know I was spotting for a bitch.` | Hoss or Tyson Route; D6 Tyson encouragement | +1 |
| D6 | `Tyson.` → `Keep going! You can do it!` | Hoss or Tyson Route; D6 Tyson encouragement | +2 |
| D6 | `You.` | Tyson Route | +1 |
| D6 | `Stop Tyson.` → `Save Tyson.` → `Truth.` | Tyson Route; successful D6 Vault check; nested Tyson rescue choices | +1 |
| D6 | `Stop Tyson.` → `Save Tyson.` → `I've got your back too.` | Tyson Route; successful D6 Vault check; nested Tyson rescue choices | +1 |
| D6 | `Stop Tyson.` → `Save Tyson.` → `Stay.` | Tyson Route; successful D6 Vault check; nested Tyson rescue choices | +1 |
| D7 | `Assist.` | Tyson Route | +1 |
| D7 | `Follow Tyson.` → `Hug him.` | Tyson Route | +1 |
| D7 | `Follow Tyson.` → `Hug Tyson.` | Tyson Route | +1 |
| D8 | `Pet him.` | Tyson Route | +1 |
| D9 | `Tyson.` | Dean Route, Hoss Route, or Tyson Route; D9 morning companion menu | +1 |
| D15 | `'Ty'.` | Tyson Route; Path A or B; D15 Tyson name choice | +2 |
| D15 | `'Tyson'.` | Tyson Route; Path A or B; D15 Tyson name choice | +1 |
| D16 | `As something more.` | Tyson Route; Path A or B; Tyson affection at least 18 | +2 |
| D18 | `Stay by the door.` | Tyson Route | +1 |

:::

### Roswell

::: {.affection-point-table .affection-roswell-table .table-responsive .table-scroll-large}

| Day | Choice / condition | Requirement | Points |
|---|---|---|---:|
| D1 | Enter `Roswell` as the cup name | Exact capitalization after trimming spaces | +1 |
| D2 | `Museum.` — automatic on entering the room | — | +1 |
| D3 | `Roswell` | D3 message recipient | +1 |
| D3 | `Roswell.` | D3 lunch companion | +1 |
| D4 | `Nah.` | Roswell Route | +1 |
| D4 | `Sure.` | — | +1 |
| D4 | `Invest` | Roswell Route; D4 Roswell investment choice | +2 |
| D4 | `Vacation` | Roswell Route; D4 Roswell investment choice | +1 |
| D4 | `Pay Debts` | Roswell Route; D4 Roswell investment choice | +1 |
| D6 | `Okay.` | Roswell Route | +1 |
| D6 | `Lie` | Roswell Route | +1 |
| D6 | `Kiss him.` | Roswell Route; Roswell affection at least 5; D6 Roswell response | +2 |
| D6 | `Hug him.` | Roswell Route; Roswell affection at least 5; D6 Roswell response | +1 |
| D7 | `Stay.` → `Dean.` | mutually exclusive D7 family-subject choice | +1 |
| D7 | `Stay.` → `Roswell.` | mutually exclusive D7 family-subject choice | +2 |
| D7 | `Stay.` → `Orlando.` | mutually exclusive D7 family-subject choice | +1 |
| D9 | `...Wild.` | Roswell Route, Orlando Route, or Sal Route; D9 Uno final-card menu | +1 |
| D15 | `Agree.` | Roswell Route; Path A or B | +1 |
| D16 | `I like you.` | Roswell Route; Path A or B; Roswell affection at least 15 | +2 |

:::

### Hoss

::: {.affection-point-table .table-responsive .table-scroll-large}

| Day | Choice / condition | Requirement | Points |
|---|---|---|---:|
| D1 | Enter `Hoss` as the cup name | Exact capitalization after trimming spaces | +1 |
| D2 | `Pilates?` | — | +1 |
| D3 | `Hoss` | D3 message recipient | +1 |
| D4 | `Stay.` | Hoss Route | +1 |
| D5 | `You can pick.` | Hoss Route | +1 |
| D5 | `Oh! Thank god you're here!` | Hoss Route; D5 Hoss threat response | +1 |
| D5 | `Oh no! Not Slimes!` | Hoss Route; D5 Hoss threat response | +1 |
| D5 | `Hoss` | Hoss Route | +1 |
| D5 | `Action` | mutually exclusive D5 movie choice | +1 |
| D6 | `Hoss.` | Hoss or Tyson Route | +1 |
| D6 | `Guys like me?` | Hoss Route | +1 |
| D6 | `Neither.` | Hoss Route | +1 |
| D7 | `Good!` | Hoss Route | +1 |
| D7 | `Stay.` → `Roswell.` | mutually exclusive D7 family-subject choice | +1 |
| D7 | `Stay.` → `Hoss.` | mutually exclusive D7 family-subject choice | +2 |
| D7 | `Stay.` → `Sal.` | mutually exclusive D7 family-subject choice | +1 |
| D8 | automatic in the hidden library when the D8 kiss threshold is not met | Hoss Route; Hoss affection below 12 | +2 |
| D8 | `Hold his hand` | Hoss Route | +2 |
| D9 | `Hoss.` | Dean Route, Hoss Route, or Tyson Route; D9 morning companion menu | +1 |
| D9 | `Answer.` | Hoss Route | +1 |
| D9 | `...want you to stay.` | Hoss Route; D9 night Hoss menu | +1 |
| D9 | `...hope you sleep well.` | Hoss Route; D9 night Hoss menu | +2 |

:::

### Sal

::: {.affection-point-table .affection-sal-table .table-responsive .table-scroll-large}

| Day | Choice / condition | Requirement | Points |
|---|---|---|---:|
| D1 | Enter `Sal` as the cup name | Exact capitalization after trimming spaces | +1 |
| D2 | `Throw towel over.` | — | +1 |
| D3 | `Sal` | D3 message recipient | +1 |
| D4 | `Continue searching.` | Sal Route | +1 |
| D5 | `Yes` | Sal Route | +1 |
| D5 | `Swim to Sal.` | Sal Route | +1 |
| D5 | `The day we first met.` | Sal Route | +1 |
| D5 | `No` | Sal Route | +1 |
| D5 | automatic after choosing `Sal` at dinner | Sal Route | +1 |
| D5 | `Comedy` | mutually exclusive D5 movie choice | +1 |
| D5 | `Action` | mutually exclusive D5 movie choice | +2 |
| D6 | `Sal` | Sal or Orlando Route | +1 |
| D6 | `Wait.` | Sal Route | +1 |
| D6 | `Video games?` | Sal Route; D6 Sal activity | +1 |
| D6 | `Talk?` | Sal Route; D6 Sal activity | +1 |
| D6 | `No.` | Sal Route | +1 |
| D7 | `Stay.` → `Hoss.` | mutually exclusive D7 family-subject choice | +1 |
| D7 | `Stay.` → `Sal.` | mutually exclusive D7 family-subject choice | +2 |
| D7 | `Stay.` → `Orlando.` | mutually exclusive D7 family-subject choice | +1 |
| D9 | `...Skip.` | Roswell Route, Orlando Route, or Sal Route; D9 Uno final-card menu | +1 |
| D9 | `Approach.` | Sal Route; Sal affection at least 15; D9 Sal comfort menu | +1 |
| D9 | `Talk.` | Sal Route; D9 Sal comfort menu | +1 |
| D9 | `...want to cuddle?` | Sal Route; D9 night Sal menu | +1 |
| D9 | `...want to talk more?` | Sal Route; D9 night Sal menu | +2 |

:::

:::

## Sal-specific behavior in b0.85

### Path C resets Sal's value

During the Path C Sal pool sequence, Sal affection is reset to 0, clearing all Sal affection accumulated earlier in that save.

The other five affection values have no comparable reset during normal play.

### D16 `Remain still.` awards no points

On the Sal Route, D16 shows `Remain still.` as a two-point choice, but it awards **0 points** in b0.85. No later event adds those missing points before D19.

::: {.callout-warning}
## Actual b0.85 scoring

Do not count `Remain still.` as a +2 choice when planning Sal's D19 result; Sal affection does not change.
:::

## Related guides

- [Affection Checks and Story Differences](affection-differences.md)
- [CG Gallery Completion Index](../collectibles/gallery.md)
