---
title: "Lettered Path System"
description: "How Path A–G and Path P branch in Password b0.85"
toc: true
---

Character routes and lettered Paths are separate but interacting systems. The conditions for Path A–G and Path P are covered below; earlier Route-specific bad endings are not listed.

For the broader distinction between the two systems, see [Route and Path Overview](route-overview.md).

::: {.callout-warning}
## Path spoilers

The sections below reveal major route outcomes, but not the password answers.
:::

Before the normal Path A–D split, missing an earlier vault requirement can lead to `BAD END: BENSON` on D8. This is a separate failure, not one of the lettered Paths.

## Base split: Path A–D

The first major split is the D8 choice between **Reveal Oz** and **Support Benson**. This choice affects whether Oswin dies early, while the D10 password check determines whether the run stays on the shared Path A/B story or moves to the Path C/D story.

Outside the Sal Route, the normal mapping is:

::: {.path-base-split-table .table-responsive}

| D8 choice | Meaning | D10 check | Base Path |
|---|---|---|---|
| **Support Benson** | Keep Oswin hidden | Passed | Path A |
| **Reveal Oz** | Reveal Oswin to the group | Passed | Path B |
| **Support Benson** | Keep Oswin hidden | Failed | Path C |
| **Reveal Oz** | Reveal Oswin to the group | Failed | Path D |

:::

The D8 choice does not immediately change the displayed Path; the game applies that choice later.

### Sal Route exception

On the Sal Route, giving up on the D10 password keeps the story on Path A/B, following the earlier Oswin outcome.

Completing it correctly still matters for Gallery completion: the successful Sal Route branch displays Sal's Vault CG and a related image filed under another character's Gallery category. Other Sal Gallery content is unlocked through normal Route progression and does not depend on this check.

## Later splits: Path E–G

After D10, the ordinary Path C/D story continues to the D14 rescue. The Path reached at the end depends on whether Sal reaches the mill alive and whether the player chooses **Save Benson.** or **Save Sal.**

A run that begins on the Path C side can therefore finish as Path C, Path D, or Path E. A run that begins on the Path D side can finish as Path D or Path E, but it cannot return to Path C because Oswin's earlier death cannot be reversed.

When Sal reaches the D14 mill sequence alive, the main outcomes are:

::: {.d14-result-table .table-responsive}

| Starting side | D14 choice | Final result |
|---|---|---|
| Path C side | **Save Benson.** | Path C |
| Path C side | **Save Sal.** | Story continues as Path D |
| Path D side | **Save Sal.** | Remains on Path D |
| Path D side | **Save Benson.** | Path E |

:::

On the Path C side, saving Sal causes Benson to die. Oswin then takes his own life, so the story moves from Path C to Path D. Other outcomes in which everyone dies lead to Path E.

Path E covers several D14 outcomes in which everyone dies. It is not tied to one menu choice; the result also depends on who is still alive when the rescue begins.

Path A and Path B instead continue to the D17 password check.

::: {.d17-path-table .table-responsive}

| Current Path | D17 check passed | D17 check failed outside the Tyson Route |
|---|---|---|
| Path A | Remains on Path A | Leads to the D19 disaster; Path F begins on D20 |
| Path B | Remains on Path B | Leads to the D19 disaster; Path G begins on D20 |

:::

The password is entered on D17, but the consequences of failure occur on D19. On D20, the story continues as Path F if Oswin is alive or Path G if he is dead.

### Early bad ending within Path F/G

After a failed D17 check, the disaster occurs on D19 and the story enters Path F or Path G on D20. D21 then presents the choices **Stay.** and **Leave.**

Choosing **Leave.** causes Dave to leave the group and leads to `BAD END: DOMINIC`. Unlike the normal Path F and Path G endings, it does not offer **Resonate?**

### Tyson Route exception

On the Tyson Route, the story stays on its existing A/B Path after a failed D17 password check.

On D18, the Tyson Route reveals the source of the high-frequency sound that would otherwise trigger the D19 disaster. Tyson then sleeps in Dave’s room instead.

No additional affection threshold, romance status, character-survival requirement, or extra choice is needed.

<details>
<summary><strong>How the Sal and Tyson Route exceptions differ</strong></summary>

::: {.path-exception-comparison-table .table-responsive .table-scroll-wide}

| | Sal Route at D10 | Tyson Route at D17 |
|---|---|---|
| When the exception takes effect | Immediately after **Give up**, through a Sal-specific failure branch; D11 confirms that Dave avoids the disaster | Not during the D17 failure scene; its effect becomes clear at the end of D19 |
| Password treated as solved | No | No |
| Failure scene | Sal receives a route-specific Vault scene | Uses the same D17 failure scene as the other routes |
| Disaster prevented | The D11 disaster and the ordinary Path C/D branch | The D19 disaster and the later Path F/G diversion |
| Path display | The save slot may temporarily show `Path C` even while the shared Path A/B story is running | The existing `Path A` or `Path B` display remains consistent |
| Success-only content | The successful warning scene and related Gallery content can still be missed | The successful warning and related password-specific dialogue can still be missed |
| Story no longer available afterward | The true Path C/D/E storyline and endings | The Path F/G storyline and endings |
| Other Path diversion still possible | Sal Route can still enter Path F/G after a later D17 failure | Tyson Route can still enter Path C/D after an earlier D10 failure |

:::

</details>

## Path P

Once all twelve medals have been recorded, completing Path A leads into Path P.

To enter Path P:

1. remain on Path A through its main ending;
2. reach the final medal check after `PATH A: END`;
3. have all twelve medals recorded by the game.

With fewer than twelve medals, the game ends after the normal Path A conclusion. With all twelve medals, the story continues into the final Path P sequence.

The requirements and recommended collection order are covered in the [Twelve-Medal Collection Guide](../collectibles/medals.md).

## Path summary

::: {.path-summary-table .table-responsive}

| Path | How to reach it |
|---|---|
| **Path A** | Keep Oswin from dying early; remain on the D10 safe side; avoid the F/G split through either D17 success or the Tyson Route safeguard |
| **Path B** | Allow Oswin to die early; remain on the D10 safe side; avoid the F/G split through either D17 success or the Tyson Route safeguard |
| **Path C** | Keep Oswin from dying early; fail the D10 check outside the Sal Route |
| **Path D** | Reach the D10 failure side outside the Sal Route with Oswin dead; a Path C run can also become Path D on D14 |
| **Path E** | Reach one of the D14 outcomes in which everyone dies from the ordinary C/D side |
| **Path F** | Begin from the Path A direction, fail the D17 check outside the Tyson Route, and reach the D19 disaster with Oswin alive |
| **Path G** | Begin from the Path B direction, fail the D17 check outside the Tyson Route, and reach the D19 disaster with Oswin dead |
| **Path P** | Complete the main Path A sequence and reach the final medal check with all twelve medals |

:::

## Related guides

- [Tiered Password Hints](password-hints.md)
- [Twelve-Medal Collection Guide](../collectibles/medals.md)
