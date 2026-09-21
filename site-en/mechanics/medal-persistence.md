---
title: "Medal Persistence and Final Check"
description: "How Password b0.85 stores medal progress, updates the Compendium, and checks all twelve medals for Path P"
toc: true
---

Each of the twelve zodiac medals has its own cross-save collection record, retained across Routes, Paths, and playthroughs. After `PATH A: END`, the game checks whether all twelve medals have been formally recorded.

::: {.callout-important}
## Three separate stages

Medal collection has three distinct layers:

::: {.pw-process-list}

1. **Story discovery:** a medal appears or is found in the narrative.
2. **Formal recording:** the medal is added to cross-save collection progress.
3. **Final check:** the Path A ending checks the collection records for all twelve medals.

:::

Only the second stage permanently adds that medal to the collection state used by the final check.
:::

## How medal progress is stored

Each zodiac medal has an independent cross-save collection record. Once a scene formally records a medal, later playthroughs treat it as collected.

b0.85 has no normal in-game option that clears all twelve medal collection records, and ordinary story branches do not revoke medals already recorded.

Loading an ordinary save restores the story state while keeping medals already collected. You can gather medals across different Routes and playthroughs, then use them all in the final Path A check.

After obtaining a medal, it is sensible to let the scene finish and make a normal save before switching runs or closing the game.

## Finding a medal is not always enough

Some medals appear in the story before the game formally records them.

The clearest examples are:

- **Aquarius:** found in the D4 hedge maze, but not formally recorded until the D16 A/B inventory scene;
- **Taurus:** found under the giant pumpkin on D7, but likewise not formally recorded until the D16 A/B inventory scene.

A player can therefore remember seeing one of these medals even though it has not yet been added to cross-save collection progress.

By contrast, Pisces, Cancer, and Capricorn are recorded during their D9 character-route scenes even though some of their zodiac identities are confirmed later.

For exact discovery and recording points, see [Twelve-Medal Collection Guide](../collectibles/medals.md).

## Why some medals are recorded more than once

The same medal can be recorded in different branches or confirmed again later. Pisces, Cancer, and Capricorn are collected during their D9 character-route scenes; the D16 Path A/B inventory may record them again.

Virgo and Sagittarius are also recorded in several mutually exclusive relationship endings. Any one valid Path A ending awards Virgo, and any one valid Path B ending awards Sagittarius.

::: {.pw-key-rule}

You do not need to complete all six relationship endings for the same medal.

:::

## How the final twelve-medal check works

After `PATH A: END`, the game checks whether each of the twelve medals has been formally recorded. Once that check is complete:

- fewer than twelve ends the current post-Path-A sequence without entering Path P;
- all twelve allows the story to continue into the Path P sequence.

::: {.callout-note}
## The check only runs after Path A

The game does not continuously watch for the twelfth medal.

If Path A is completed before all twelve medals have been formally recorded, collecting the missing medals later will not automatically reopen the final sequence. Path A must be completed again so the twelve-medal check can run again.
:::

## Compendium and medal progress

The Lore list uses the same cross-save medal collection progress as the final Path P check, but a newly earned medal may not appear there until the game is restarted. See [Compendium Unlock Index](../collectibles/compendium.md) for the full access and refresh behavior.

## What the game does not reset

b0.85 has no normal in-game option that clears all twelve medal collection records.

The hidden D1 `THE END` password resets several ending completion records, including the true-ending record and Path A–G ending records, but it does **not** clear the zodiac medal collection.

Deleting ordinary story saves also leaves medal progress intact. Progress can be lost if all game user data holding cross-save progress is cleared, omitted during a device transfer, or otherwise replaced.

## Troubleshooting medal progress

When the final check reports an incomplete set:

1. Confirm that every medal was formally recorded, rather than merely appearing in the story.
2. Restart the game and use the Lore list to identify any medal that is still missing.
3. Complete Path A again after all twelve medals have been recorded; the check does not run when the last medal is earned elsewhere.
4. If progress moved between devices, confirm that the cross-save collection data was transferred with the ordinary saves.

For the fastest collection order and all twelve locations, see [Twelve-Medal Collection Guide](../collectibles/medals.md).

## Related guides

- [Compendium Unlock Index](../collectibles/compendium.md)
