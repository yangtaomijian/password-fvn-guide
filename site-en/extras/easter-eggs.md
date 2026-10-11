---
title: "Easter Eggs and Hidden Inputs"
description: "Optional Vault inputs, D1 coffee-cup names, hidden drivers, and the Ophiuchus reference in Password b0.85"
toc: true
---

The following optional inputs and Easter eggs still work in Password b0.85. None is required for a lettered Path or for reaching Path P.

## D1–D3 Vault Easter Eggs

The first three Vault visits include two optional inputs and one day with no accepted answer.

::: {.easter-vault-table .table-responsive .table-scroll-compact}

| Day | Input | Effect |
|---:|---|---|
| D1 | `THE END` | Clears the recorded endings, then quits the game |
| D2 | — | No input is accepted as the correct D2 password in b0.85 |
| D3 | `THE LOVERS` | Helps Dave grow closer to all six main characters |

:::

### Input rules

These Vault inputs are not case-sensitive, and leading or trailing spaces are removed. Spaces inside the answer must remain, and each input works only on its assigned day.

For example, `the lovers` works on D3, but `THELOVERS` does not.

### `THE END`

Entering `THE END` during the D1 Vault visit clears the stored true ending and Path A–G ending records, then closes the game. It does not clear the twelve zodiac medals, so use it only if you intend to reset those endings.

### D2 has no correct password

D2 still opens the Vault input screen, but no answer is accepted as correct on that day. Passwords assigned to other days may receive different failure feedback, but none opens a D2 success branch.

### `THE LOVERS`

Entering `THE LOVERS` on D3 makes Dave feel closer to all his friends. It supports later intimacy and can change story variations or make romance begin automatically. Follow the character guide’s specified Easter-egg choices when you want to retain a D19 relationship menu.

See [Affection and Character Choice Guide](../mechanics/affection.md) for concrete choice routes and character variations.

## D1 Coffee-Cup Name Easter Eggs

Near the beginning of D1, Roswell asks Dave to enter the name written on his coffee cup. The answer can change the cup dialogue, add affection, or replace the bus driver who takes the group to the mansion.

Unlike Vault input, the cup name remains case-sensitive. Leading and trailing spaces are removed, but the capitalization below must be exact:

```text
Dave Dean Tyson Roswell Orlando Hoss Sal
Chase
Civ Rem
Wilson Timber Zylus
```

For example, `Dave` works, while `dave` and `DAVE` use the generic response.

### Dave and the six main characters

Entering `Dave` triggers a dedicated response and helps Dave grow closer to all six main characters.

Entering `Dean`, `Tyson`, `Roswell`, `Orlando`, `Hoss`, or `Sal` triggers that character’s dedicated response and helps Dave grow closer **to that character**.

These names do not replace the driver.

### `Chase`

`Chase` is a reference to the otter protagonist of *[Echo](https://echoproject.itch.io/echo)*. Roswell says that the name sounds as though it belongs to an otter, then adds that it might also suit a dog.

This input does not change affection or the driver.

### `Civ`

`Civ` produces a short `Civ` / `shiv` exchange, followed by Roswell commenting that the name sounds musical.

Civ Valian is credited for **Sound Design/Composition**. This input does not change affection or the driver.

### `Rem`

`Rem` makes Dave discover that the drink is almost entirely water. Roswell nervously suggests that it might be “caffeinated water.”

Rem is credited as a **Diamond Patron**. This input does not change affection or the driver.

## Hidden Driver Names

`Wilson`, `Timber`, and `Zylus` replace the default driver later on D1. Each driver branch also positively affects Dave’s relationships with all six main characters. That effect occurs during the driver scene rather than the cup dialogue.

### `Wilson`

Wilson's cup is covered in tiny lines and writing that resemble an essay or mind map. The drink itself is ordinary coffee.

The replacement driver is a fox named Wilson. Roswell compares him to Charon, the ferryman of the dead, while Hoss points out that his name tag clearly says Wilson. He uses the normal farewell after the group reaches the mansion.

### `Timber`

Timber's cup has circles around its base that may form a bear. Roswell suggests that someone tried to make the coffee resemble the milk tea Hoss likes.

Timber is an exceptionally large bear. The group is astonished by his size, and Dean becomes noticeably competitive. After arriving at the mansion, Timber privately tells Dave to take care of himself, as though he senses what lies ahead.

Timber is credited as a **Diamond Patron**.

### `Zylus`

`Zylus` uses the generic cup response, but he still replaces the driver later on D1.

Zylus is a deer-like driver with large antlers and prominent fangs. The group discusses his teeth and the difficulty of fitting his antlers around the driver's seat. He uses the normal arrival farewell.

Zylus is credited as a **Diamond Patron**.

### Special-input summary

::: {.easter-special-input-table .table-responsive .table-scroll-compact}

| Input | Dedicated cup response | Affection effect | Driver | Additional note |
|---|---|---|---|---|
| `Dave` | Yes | Closer to all six | Default | Dave-name response |
| Six main character names | Yes | Closer to the matching character | Default | One character only |
| `Chase` | Yes | None | Default | *Echo* reference |
| `Civ` | Yes | None | Default | Civ Valian reference |
| `Rem` | Yes | None | Default | Credited Diamond Patron |
| `Wilson` | Yes | Closer to all six during the driver scene | Wilson | Hidden driver |
| `Timber` | Yes | Closer to all six during the driver scene | Timber | Credited Diamond Patron |
| `Zylus` | No; generic response | Closer to all six during the driver scene | Zylus | Credited Diamond Patron |

:::

### Other names

Any other non-empty input uses the generic cup response. This includes later character names such as `Oswin` and `Benson`.

## Known Passwords Entered on the Wrong Day

The Vault recognizes some passwords even on the wrong day, but the failure response changes across the story.

::: {.easter-wrong-day-table .table-responsive .table-scroll-compact}

| Input day | Wrong-day behavior |
|---:|---|
| D1 | Uses the ordinary error response |
| D2 | Produces a pause and click that sounds almost correct |
| D3 | Displays `PASSWORD INVALID FOR CURRENT DATE` and hints that the answer belongs to another day |
| D4 | Uses the same current-date warning |
| D6 | Distinguishes a known password from the password required that day |
| D7 onward | Generally merges wrong-day passwords into the ordinary error response |

:::

This changes only the feedback. A password still works only on its assigned day.

For accepted-password hints, see [Tiered Password Hints](../guide/password-hints.md). For input rules and failure results, see [Vault Input and Password Checks](../mechanics/password-checks.md).

## Ophiuchus and the Twelve-Medal Limit

Late Path A dialogue mentions **Ophiuchus**, but the game has no corresponding medal or hidden password. The Compendium and the final Path P check both cover the twelve zodiac medals.

See [Twelve-Medal Collection Guide](../collectibles/medals.md) and [Medal Persistence and Final Check](../mechanics/medal-persistence.md) for the complete collection rules.

## Related guides

- [Tiered Password Hints](../guide/password-hints.md)
- [Affection and Character Choice Guide](../mechanics/affection.md)
