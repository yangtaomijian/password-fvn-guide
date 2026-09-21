---
title: "Compendium Unlock Index"
description: "Unlock conditions and troubleshooting for all Cast Files, Additional Scenes, and Lore entries in Password b0.85"
toc: true
---

The b0.85 Compendium contains three fixed sections:

::: {.compendium-summary-table .table-responsive}

| Section | Entries | Contents |
|---|---:|---|
| Cast Files | 16 | Character profiles |
| Additional Scenes | 9 | Replayable story scenes |
| Lore | 12 | Zodiac-medal entries |
| **Total** | **37** | — |

:::

The Compendium button appears on the **main menu** after the first ending is completed. It is not available from the normal in-game navigation menu.

Locked entries remain in their original positions and display `?????`, so a missing item can be identified by its section and list order.

::: {.callout-important}
## Unlocks are persistent, but the display can lag behind

Cast Files, Additional Scenes, and Lore remain unlocked permanently, but the Compendium does not refresh every new entry while the game remains open.

A newly earned entry may therefore remain `?????` even after it has been saved. Simply closing and reopening the Compendium is not guaranteed to refresh it.

If an entry still displays `?????`, try restarting the game first, then check its unlock requirements.
:::

## Cast Files

### Unlock index

::: {.compendium-cast-table .table-responsive .table-scroll-medium}

| Order | Cast File | Main unlock route |
|---:|---|---|
| 1 | Dave | D14 A/B flashback about Dave's father |
| 2 | Tyson | Tyson Route, D15 A/B |
| 3 | Roswell | Roswell Route, D18 A/B |
| 4 | Orlando | D15 meeting; Route requirement depends on Oswin's state |
| 5 | Hoss | Optional D3 conversation, with an optional D8 fallback |
| 6 | Sal | Successful D10 password scene, or Sal Route fallback on D15 |
| 7 | Dean | Dean Route, D11 A/B |
| 8 | Benson | Late Path A sequence |
| 9 | Thanatos | Late Path A time-loop sequence |
| 10 | Thanatos - Part 2 | Complete the full Path P sequence |
| 11 | Memphis | Path C meeting on D13 |
| 12 | Dominic | Late Path A meeting |
| 13 | Jack | Same meeting as Dominic |
| 14 | Florencia | Path D, G, A, or B ending scene |
| 15 | David | Same D14 A/B flashback as Dave |
| 16 | Hoyt | Same D14 A/B flashback as Dave and David |

:::

### Dave, David, and Hoyt

All three files unlock during the same D14 A/B flashback, on any character Route and at any affection level.

### Orlando

Orlando's Cast File has two different D15 conditions:

::: {.oswin-state-table .table-responsive}

| Oswin state | Unlock condition |
|---|---|
| Oswin alive | Orlando Route required |
| Oswin dead | Unlocks during the common meeting on any character route |

:::

The in-game locked hint only mentions Orlando Route progression, so it does not reveal the second method.

### Hoss

The earliest unlock is the optional D3 conversation `Message...? → Hoss`.

Because the D4 partner choice has not yet occurred, this method does not require the Hoss Route.

An optional D8 hidden-library discovery can also unlock the file. This method also works outside the Hoss Route.

### Sal

The successful D10 password scene unlocks Sal's Cast File on any character Route.

On the Sal Route, failing that password does not permanently lose the file. A D15 Sal conversation provides another unlock opportunity.

### Thanatos and Thanatos - Part 2

The normal Thanatos file unlocks during the late Path A time-loop sequence. An incomplete twelve-medal check provides another unlock opportunity.

`Thanatos - Part 2` unlocks after the full Path P sequence is completed.

### Dominic and Jack

Dominic and Jack unlock consecutively during the same late Path A meeting.

### Florencia

Florencia has several alternative unlock points:

- Path D ending on D14;
- Path G ending;
- Path A ending sequence;
- Path B ending sequence.

The earliest unlock point is the Path D ending. Path C, E, and F do not unlock the file.

<details>
<summary><strong>Oswin is not listed</strong></summary>

b0.85 contains 16 Cast Files. Oswin is not among them.
</details>

## Additional Scenes

### Fixed order and requirements

::: {.additional-scenes-table .table-responsive .table-scroll-compact}

| Order | Additional Scene | Unlock requirement |
|---:|---|---|
| 1 | Dave's Demise | Unlocks alongside `Roswell's Attempt` after completing the two first-run late-Path-A segments for Dave and Roswell |
| 2 | Roswell's Attempt | Unlocks alongside `Dave's Demise` after completing the two first-run late-Path-A segments for Dave and Roswell |
| 3 | Tyson Epilogue | Complete Path P and unlock Tyson's Cast File |
| 4 | Dean Epilogue | Complete Tyson Epilogue and unlock Dean's Cast File |
| 5 | Orlando Epilogue | Complete Dean Epilogue and unlock Orlando's Cast File |
| 6 | Sal Epilogue | Complete Orlando Epilogue and unlock Sal's Cast File |
| 7 | Hoss Epilogue | Complete Sal Epilogue and unlock Hoss's Cast File |
| 8 | Dave Epilogue | Complete Hoss Epilogue |
| 9 | Roswell Epilogue | Complete Dave Epilogue |

:::

### Dave's Demise and Roswell's Attempt

The first two scenes unlock together after completing the two first-run late-Path-A segments for Dave and Roswell. They can then be replayed independently. The seven Epilogues that follow unlock in sequence.

### Epilogue dependency chain

The seven Epilogues unlock in one fixed sequence:

```text
Tyson
→ Dean
→ Orlando
→ Sal
→ Hoss
→ Dave
→ Roswell
```

The first five character Epilogues use the following additional Cast File checks:

| Epilogue | Cast File required |
|---|---|
| Tyson Epilogue | Tyson |
| Dean Epilogue | Dean |
| Orlando Epilogue | Orlando |
| Sal Epilogue | Sal |
| Hoss Epilogue | Hoss |
| Dave Epilogue | None |
| Roswell Epilogue | None |

Only Tyson Epilogue directly requires completion of Path P. Each later scene requires the preceding Epilogue to have been played through.

### Watch each Epilogue to the end {#play-each-epilogue-almost-to-the-end}

The game counts an Epilogue as completed only near the end of its replay.

Using **End Replay** too early prevents the next scene from unlocking.

Even a fully completed Epilogue may not make the next scene appear until the game is restarted. If the next entry still displays `?????`, try restarting first. If it remains locked, try replaying the previous Epilogue.

::: {.callout-warning}
## Epilogue chain stuck on `?????`

Check these points in order:

1. Did the previous Epilogue reach its actual ending rather than exit through **End Replay**?
2. For Dean through Hoss, is the corresponding Cast File unlocked?
3. Has Tyson Epilogue been made available by completing Path P and unlocking Tyson's file?
4. Has the game been restarted since the latest entry was unlocked or Epilogue was completed?
5. Is the cross-save progress data from an older installation or incomplete device transfer?
:::

## Lore

The Lore section contains the twelve zodiac entries in traditional order:

:::: {.pw-lore-columns}

::: {.compendium-lore-table .table-responsive}

| Order | Lore |
|---:|---|
| 1 | Aries |
| 2 | Taurus |
| 3 | Gemini |
| 4 | Cancer |
| 5 | Leo |
| 6 | Virgo |

:::

::: {.compendium-lore-table .table-responsive}

| Order | Lore |
|---:|---|
| 7 | Libra |
| 8 | Scorpio |
| 9 | Sagittarius |
| 10 | Capricorn |
| 11 | Aquarius |
| 12 | Pisces |

:::

::::

Each Lore entry unlocks with its corresponding medal. The final twelve-medal check after Path A uses the same records.

Lore may remain locked on screen even when a newly earned medal already counts toward the Path P check. If it is still locked after restarting the game, the medal was probably not formally recorded.

For collection locations and an optimized route order, see [Twelve-Medal Collection Guide](medals.md). For how medal progress is saved and refreshed, see [Medal Persistence and Final Check](../mechanics/medal-persistence.md).
