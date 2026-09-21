---
title: "Legacy Mechanics Archive"
description: "The cross-save Path A first-run sequence, the retired D8 Oswin input system, and other mechanics changed between Password b0.7 and b0.85"
toc: true
---

This archive covers interactions that players could encounter in *Password* b0.7 but that were removed or rewritten in b0.85.

The main subjects are:

- the two late Path A scenes limited to the first profile-wide run;
- the two related Additional Scenes in b0.85;
- the retired D8 free-text conversation with Oswin;
- the removed D11 laboratory decision.

::: {.callout-warning}
## Leftover content does not mean an interaction is playable

A surviving password word or related line does not make an interaction usable in b0.85. Some older content remains in fragments, but the current story and interface no longer provide a complete entry.
:::

## Path A first-run sequence

Both b0.7 and b0.85 record the first complete late-Path-A sequence across saves: its two first-run segments play on the first normal visit, while later eligible visits skip them.

The first-run record is shared across character Routes and save slots rather than belonging to one ordinary save.

### First visit {#first-normal-traversal}

On the first visit, the story continues as follows:

```text
enter the late Path A sequence
→ play the first Dave segment
→ continue into the Roswell segment
→ record the first completion
→ continue with the later Path A story
```

The names **Dave's Demise** and **Roswell's Attempt** were later assigned to the two first-run segments by the b0.85 Additional Scenes interface. They were not separate menu choices in b0.7.

### Later visits {#later-normal-traversals}

When you reach this part again:

```text
common opening material
→ the first completion is already recorded
→ skip the two first-visit segments
→ continue with the later Path A story
```

Starting a new game does not by itself reset the cross-save completion record. Clearing all of the game's cross-save progress data restores the default first-run state.

### Loading an old save

The result depends on where the save was made:

- a save loaded **before** the game checks the first-completion state reads the current cross-save completion record and may skip the first-visit segments;
- a save made **inside** the first-visit sequence can continue from its saved location.

## Additional Scenes in b0.85

b0.85 adds the two segments as the first entries under **Additional Scenes** in **Compendium**:

1. `Dave's Demise`
2. `Roswell's Attempt`

After both first-run segments have been completed, the entries unlock together from the same cross-save completion record.

For their current list positions and troubleshooting, see [Compendium Unlock Index](../collectibles/compendium.md).

### Replays cover only part of the original story

Each entry replays one part of the original Path A story.

`Dave's Demise` begins with Dave's corresponding story segment and ends before the Roswell segment.

`Roswell's Attempt` begins with the Roswell segment and ends before the later Path A story continues.

Replaying these scenes can unlock the Gallery images shown in them and retains any story effects triggered along the way.

## D8 Oswin free-text conversation

b0.7 contains a normal D8 conversation in which the player can type questions for Oswin.

Its structure is a menu-controlled free-text loop:

```text
Question.
→ type a question
→ match keywords
→ show a response
→ return to the question menu

Stay Silent.
→ leave the interaction
```

There is no fixed question limit. Empty input is handled separately, and three unmatched attempts trigger a help response before the unmatched counter is reset.

### What the interaction affected

The conversation tracks three states for the current playthrough:

::: {.oz-variable-table .table-responsive}
| Current-run state | Role |
|---|---|
| Family-history topic | Records whether the corresponding family-history information has been triggered |
| Story/rabbit topic | Records whether the related topic has reached its relevant state |
| Consecutive unmatched inputs | Counts consecutive misses; the third shows help and resets the count |
:::

The family-history and story/rabbit topic states can change later dialogue. The answers leave the character Route, lettered Path, medals, major ending, and main Vault success unchanged.

## How b0.7 recognized input

The system did not require most listed questions to match one exact sentence.

Its parser:

1. converts the input to lowercase;
2. removes a fixed set of ASCII punctuation;
3. checks required keyword groups;
4. accepts any listed synonym inside a group;
5. uses exact token matching for one-word synonyms;
6. uses literal substring matching for multiword synonyms.

Every required group must match, but their order is not enforced. Extra words are usually allowed.

### Input limits

::: {.parser-boundary-table .table-responsive .table-scroll-compact}
| Input feature | Actual behavior |
|---|---|
| Letter case | Ignored because input is lowercased |
| Leading or trailing spaces | Not deliberately trimmed, although many matches still work |
| Common ASCII punctuation | Removed from a fixed list |
| Apostrophes and hyphens | Not removed by that list |
| Unicode punctuation | Not normalized |
| Repeated internal spaces | Can break a multiword substring |
| Word order | Generally not enforced across keyword groups |
:::

A broad response can match before a more specific one, so the wording of an entry may change which response appears first.

## State-dependent rabbit response

The rabbit interaction changes according to whether a related topic was previously triggered, but the second input does not have to be the exact phrase `what rabbit`.

After a rabbit-, hare-, or story-related response has triggered the relevant topic, a later rabbit-related input can receive the follow-up version.

## Conversation prompts to try

The following prompts work in b0.7. They are historical examples only and cannot be entered during normal b0.85 play.

Some prompts are intentionally abbreviated or grammatically unusual because those forms match the old keyword parser reliably.

<details>
<summary><strong>Expand the prompt table</strong></summary>

The input box matched groups of keywords, allowing different wording for the same topic.

Capitalization does not matter. Type one prompt at a time, and keep spaces in phrases such as `hidden camera`.

<div class="table-responsive table-scroll-wide oswin-dialogue-table">

| Topic | Prompts to try | What Oswin may discuss |
|---|---|---|
| Dave and Oswin | `who am i` · `who are you` | Their identities and Dave's situation |
| Family | `can i call you dad` · `did you want a family` | Oswin's feelings about family and parenthood |
| Friendly interaction | `can i hug you` · `can i tickle you` · `can i thank you` | Optional personal or humorous responses |
| Small jokes | `boop snoot` · `am i a good boy` | Short character reactions |
| Stories | `story` · `can you tell me a story` | Oswin's stories and related background |
| Rabbit follow-up | `rabbit` | Asking about rabbits again later can produce a different response |
| Preferences | `tea or coffee which do you like better` | Oswin's drink preference |
| General Easter eggs | `what is love` · `got any grapes` · `do you like waffles` · `buhi` | Joke and reference responses |
| The killer | `who want to kill us` · `who try to kill us` | The threat facing the group |
| Poison | `poison` · `did you poison dean` · `you know how to poison` | Poisoning and Oswin's knowledge |
| The gun | `gun` · `where gun` · `who has gun` · `who hide gun` | The firearm and who may possess it |
| The dagger | `dagger` · `where did you get dagger` | The dagger and its origin |
| Emergency plans | `call police` · `what if we die` | Police, death, and the group's situation |
| Surveillance | `hidden camera` · `is camera still working` · `soundproof` | Cameras, blind spots, recordings, and soundproofing |
| Trust | `can i trust hoss` · `can i trust dean` · `can i trust you` · `can you trust me` | Whether Dave or Oswin trusts particular people |
| Oswin's family | `are you roswell's father` · `who is your brother` · `what is your sister's name` | Oswin's relatives and his connection to Roswell |
| Science and research | `why you become a doctor` · `what is morphic resonance` · `mycology` · `you know deathcaps` | Medicine, fungi, experiments, and morphic resonance |
| Benson | `benson` · `where is benson` · `benson old job` · `benson and vault` | Benson's identity, history, location, and connection to the Vault |
| The Vault | `vault` · `who used vault` · `can you open vault` | The Vault's purpose and users |
| The forest | `forest` · `someone else in woods` · `cabin in woods` · `what mushrooms in woods` | The surrounding woods, their inhabitants, and the cabin |
| Hidden areas | `hidden room` · `hidden path` · `safest room` | Secret or protected locations around the mansion |
| The laboratory | `where lab` · `where study` · `how you program` | Oswin's laboratory and technical work |
| Medals | `medals` · `where medals` · `how many medals are there` · `who hid medals` | The medal collection and who placed it |
| Hoss's notes | `hoss list` · `marked` | Hoss's list and the marked medals |
| Other characters | `did you meet my friends` · `have you met hoss` · `what did tyson do` | Oswin's knowledge of Dave's companions |

</div>

Some subjects have more than one response, and a few answers depend on what Dave has already asked. The table is not exhaustive; other wording may work for some topics.

</details>

## b0.85 replacement

b0.85 removes the D8 free-text input and replaces the scene with scripted dialogue:

- the fixed scene reuses selected old topics;
- some older states still affect a small amount of later dialogue;
- the normal input menu and old free-text responses are no longer available to the player.

Cast Files, Lore, and Additional Scenes do not contain the complete old question library either.

## D11 laboratory decision

The b0.7 Oswin-alive D11 laboratory sequence contained a separate three-way decision:

::: {.legacy-d11-choice-table .table-responsive}
| b0.7 choice | Earlier behavior |
|---|---|
| `Inject me.` | Creates no additional difference in the choice record |
| `Inject him.` | Records one distinct choice result |
| `Don't inject.` | Records another distinct choice result |
:::

This choice is distinct from the optional D11 Vault documented in [Legacy Password Archive](legacy-passwords.md).

In b0.85, the menu is removed. The scene instead follows a fixed sequence in which Oswin injects Dave from behind and later reveals that the substance was saline.

The earlier game distinguished all three choices, so some local dialogue could differ. The choices did not affect the character Route, lettered Path, medals, or ending. b0.85 no longer distinguishes these choice results.

## Related pages

- [Legacy Route Archive](legacy-routes.md)
- [Major Changes in b0.85](b085-changes.md)
