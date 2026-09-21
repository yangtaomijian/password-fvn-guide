---
title: "Legacy Route Archive"
description: "Removed route branches and route-related differences between Password b0.7 and b0.85"
toc: true
---

If an older guide does not match the routes in b0.85, use this archive to check whether it describes a removed b0.7 branch.

It covers route changes that affect normal story access, Bad Endings, or how older guides describe character Routes and lettered Paths. Passwords, replays, and broader story rewrites are covered in their own archives.

::: {.callout-warning}
## Historical reference only

Do not use this page as a b0.85 walkthrough. For the current structure, see [Route and Path Overview](../guide/route-overview.md) and [Lettered Path System](../guide/path-system.md).
:::

## Structure shared by both builds

The core distinction between a D4 **character Route** and the later **lettered Paths** already existed in b0.7. Much of the A–G and Path P structure also remains recognizable in b0.85.

The differences that need special attention are removed branches and older mechanics that can make a legacy guide misleading.

## D6 mansion departure branch

b0.7 contained a normal D6 choice near the end of the mansion sequence: **Stay.** / **Leave.**

Choosing **Stay.** continued to D7. Choosing **Leave.** entered `BAD END: OZ` and ended the playthrough.

b0.85 no longer contains the D6 mansion-departure menu or its Bad Ending during normal play.

::: {.d6-result-table .table-responsive .table-scroll-compact}
| Build | D6 result |
|---|---|
| b0.7 | `Stay.` continues; `Leave.` enters `BAD END: OZ` |
| b0.85 | The departure choice and its Bad Ending are no longer available during normal play |
:::

## D7 alternatives and the D8 outcome

The two older D7 alternatives accepted by b0.7 did not allow the player to continue past D8. Both therefore entered the `BAD END: BENSON` timeline rather than creating additional lettered Paths.

For their warning scenes and hint structure, see [Legacy Password Archive](legacy-passwords.md).

::: {.callout-note}
## Two different “Reveal Oz” choices

A legacy D7 failure sequence can contain a choice about revealing Oswin. That Bad Ending choice is separate from the normal D8 **Reveal Oz** decision used by the current lettered Path system.

The Bad Ending version does not carry over the normal Reveal Oz result and does not determine Path A or Path B.
:::

## Lettered Paths after D10 and Path P

b0.85 keeps most of b0.7's lettered Path structure.

Both builds contain:

- the story moving to the Path A/B or Path C/D side after D10;
- later survival outcomes still changing the lettered Path;
- Path E covering more than one outcome in which everyone dies;
- the later Path F/G split;
- the transition from the Path A ending into Path P after the twelve-medal check.

Path P already exists in b0.7; it is not a new b0.85 route.

In both builds, the core transition is:

```text
Path A ending
→ check the cross-save collection records for the twelve medals
→ all twelve obtained
→ story continues into the final Path P sequence
```

b0.85 changes the later Path P sequence by adding a standalone input and an explicit cross-save true-ending completion record. Those additions are documented in [Major Changes in b0.85](b085-changes.md).

The game does not display a formal `PATH P: END` title or give the letter `P` an official full name. References to a “prime timeline” make `P = Prime` plausible, but that wording is not shown as an official name.

## Older systems that do not change the Path

Several removed systems occurred inside route material without changing the lettered Path itself.

::: {.table-responsive .table-scroll-medium}
| Legacy system | Story effect | Primary archive |
|---|---|---|
| D8 Oswin free-text conversation | Changes later dialogue only; Route, Path, medals, and ending are unchanged | [Legacy Mechanics Archive](legacy-mechanics.md) |
| D11 optional Vault | Changes some laboratory and later text; Route and Path are unchanged | [Legacy Password Archive](legacy-passwords.md) |
| Path A first-run scenes | Two special segments play only on the first profile-wide run; b0.85 later makes them replayable in Additional Scenes | [Legacy Mechanics Archive](legacy-mechanics.md) |
| D11 injection decision | Lets the player decide whether and who receives the injection, recording different choice results that could affect local dialogue; Route, Path, medals, and ending are unchanged | [Legacy Mechanics Archive](legacy-mechanics.md) |
:::

The broader Dean interaction changes and the D19 relationship threshold do not change the lettered Path structure. See [Major Changes in b0.85](b085-changes.md) for details.
