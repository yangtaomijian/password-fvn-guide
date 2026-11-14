---
title: "Password b0.85 Guide & Mechanics Reference"
description: "An unofficial guide and walkthrough reference for Password, Grizz's furry visual novel (FVN), covering b0.85 routes, endings, password hints, medals, Gallery completion, mechanics, and version differences."
comments: false
toc: false
body-classes: pw-home
css: assets/home-scene/scene.css
---

```{=html}
<div id="pw-home-scene"><a class="home-skip" href="#notebook">Skip to notebook</a><section class="scroll-journey" id="journey" aria-label="Vault and notebook"><div class="travel-stage"><div class="space-backdrop" aria-hidden="true"></div><div class="space-light" aria-hidden="true"></div><div class="near-post near-left" aria-hidden="true"></div><div class="near-post near-right" aria-hidden="true"></div><div class="travel-toolbar"><span>PASSWORD · b0.85</span><div><button id="page-sound" type="button" aria-pressed="false" title="Remembers your choice in this browser; plays only when you change tabs">Page sound: off</button><button id="skip-journey" type="button">Open notebook ↓</button><button id="normal-view" type="button" aria-pressed="false">Read without motion</button></div></div><div class="journey-intro"><p>Routes, password hints and collectibles</p><h2>The Password guide</h2><a class="home-directory-link no-external" href="#home-directory-heading">Browse all 16 guides ↓</a><div class="scroll-prompt"><span aria-hidden="true">↓</span>Scroll down to open the notebook</div></div><div class="book-carrier"><section class="scene" id="notebook" tabindex="-1" aria-label="Guide notebook"><div class="left-page"><div class="small-label">GUIDE INDEX <span>·</span> NOTEBOOK</div><h2>Where to begin?</h2><p class="lede">For story branches, choose Routes.<br>For a password, choose Hints.<br>For medals, Compendium and Gallery, choose Collectibles.</p><div class="line-art" aria-hidden="true"><svg viewBox="0 0 300 60"><rect x="8" y="15" width="52" height="30" rx="2"/><path d="M60 30h40m42 0h45m44 0h40"/><circle cx="120" cy="30" r="20"/><rect x="187" y="15" width="44" height="30" rx="2"/><path d="M275 23v6m0 5v2"/></svg></div><p class="margin-note">Password hints open in tiers.<br>Collection guides include unlock conditions and spoilers.</p><div class="folio">PASSWORD <span>Guide notebook</span></div></div>
<div class="right-page"><div class="page-heading"><span id="section-label">01 / ROUTES</span><span aria-hidden="true">✦</span></div>
<div id="panel-routes" class="panel" role="tabpanel" aria-labelledby="tab-routes"><h2>Routes and branches</h2><p class="subline">Character Routes, lettered Paths and common questions</p><a class="no-external entry" href="guide/route-overview.html"><span class="entry-num">01</span><span><strong>Route and Path Overview</strong><small>Follow character Routes and story branches</small></span><b>→</b></a><a class="no-external entry" href="guide/path-system.html"><span class="entry-num">02</span><span><strong>Lettered Path System</strong><small>Distinguish character Routes from story Paths</small></span><b>→</b></a><a class="no-external entry" href="guide/faq.html"><span class="entry-num">03</span><span><strong>Frequently Asked Questions</strong><small>Find help with routes, passwords and unlocks</small></span><b>→</b></a></div>
<div id="panel-passwords" class="panel" role="tabpanel" aria-labelledby="tab-passwords" hidden><h2>Password hints</h2><p class="subline">Find tiered hints by story date</p><div class="hint-note"><span>Vault · Four main password checks</span><div class="vault-dates" aria-label="Main password-check dates"><span>D4 / D6</span><span>D7</span><span>D10</span><span>D17</span></div><p>Find the section for your current story date,<br>then open hints one tier at a time.</p></div><a class="no-external action-link" href="guide/password-hints.html">Open tiered password hints <span>→</span></a></div>
<div id="panel-collections" class="panel" role="tabpanel" aria-labelledby="tab-collections" hidden><h2>Collectibles and unlocks</h2><p class="subline">Medals, Compendium and CG Gallery</p><button class="reveal" id="reveal" aria-expanded="false" aria-controls="collection-links"><span aria-hidden="true">◇</span><strong>Show collection guides</strong><small>These guides include story spoilers and unlock conditions.</small></button><div id="collection-links" hidden><a class="no-external entry" href="collectibles/medals.html"><span class="entry-num">01</span><span><strong>Twelve medals</strong><small>CollectiblesRequirements and suggested progression</small></span><b>→</b></a><a class="no-external entry" href="collectibles/compendium.html"><span class="entry-num">02</span><span><strong>Compendium Unlock Index</strong><small>Find entries you have not unlocked</small></span><b>→</b></a><a class="no-external entry" href="collectibles/gallery.html"><span class="entry-num">03</span><span><strong>CG Gallery Completion</strong><small>Use the index to find missing images</small></span><b>→</b></a></div></div>
<div class="page-bottom"><span id="page-number">01</span></div></div>
<div class="tabs" role="tablist" aria-label="Notebook sections"><button role="tab" id="tab-routes" aria-controls="panel-routes" aria-selected="true" data-key="routes">Routes<span>01</span></button><button role="tab" id="tab-passwords" aria-controls="panel-passwords" aria-selected="false" tabindex="-1" data-key="passwords">Hints<span>02</span></button><button role="tab" id="tab-collections" aria-controls="panel-collections" aria-selected="false" tabindex="-1" data-key="collections">Collectibles<span>03</span></button></div></section></div><div class="travel-progress" aria-hidden="true"><span>Vault</span><i><b></b></i><span>Notebook</span></div></div></section></div>
<script src="assets/home-scene/scene.js"></script>
<link rel="stylesheet" href="assets/dave-portrait/portrait.css"><script defer src="assets/dave-portrait/portrait.js"></script>
```

## About this guide

*Password* is a furry visual novel (FVN) by Grizz. This unofficial guide covers the public **b0.85** build: character Routes, lettered Paths, endings and Path P, password hints, collectibles, and unlock mechanics. It does not cover Patreon-only or unreleased content.

## [All guides]{#home-directory-heading tabindex="-1"} {#browse-the-guide}

[Start here]{#start-here .pw-legacy-anchor aria-hidden="true"}

:::: {.pw-home-directory-grid}

::: {.pw-home-directory-group}
### Guide

- [Route and Path Overview](guide/route-overview.md){#route-and-path-overview} — The D4 character Route and later story branches
- [Lettered Path System](guide/path-system.md) — Character Routes and lettered Paths
- [Tiered Password Hints](guide/password-hints.md){#tiered-password-hints} — Clues for the four main checks
- [Frequently Asked Questions](guide/faq.md){#frequently-asked-questions} — Routes, passwords, endings and unlocks
:::

::: {.pw-home-directory-group}
### Collectibles

- [Twelve-Medal Collection Guide](collectibles/medals.md){#twelve-medal-collection-guide} — Collect every medal and reach Path P
- [Compendium Unlock Index](collectibles/compendium.md) — Find entries you have not unlocked
- [CG Gallery Completion Index](collectibles/gallery.md) — Check all 100 Gallery images
:::

::: {.pw-home-directory-group}
### Mechanics

- [Vault Input and Password Checks](mechanics/password-checks.md) — Input rules and checks
- [Medal Persistence and Final Check](mechanics/medal-persistence.md) — Persistent progress and the final check
- [Affection and Character Choice Guide](mechanics/affection.md) — Character choices and affection
- [Affection and Story Variations](mechanics/affection-differences.md) — Dialogue and scenes that vary with conditions
:::

::: {.pw-home-directory-group}
### Extras

- [Easter Eggs and Hidden Inputs](extras/easter-eggs.md) — Optional Vault inputs, D1 coffee-cup names and hidden drivers
:::

::: {.pw-home-directory-group .pw-home-archives}
### Version Archives

Compare **b0.7 and b0.85**. These historical records are separate from the current guide.

- [Major Changes in b0.85](versions/b085-changes.md){#major-changes-in-b0.85} — Features, interactions, passwords and Gallery changes
- [Legacy Route Archive](versions/legacy-routes.md){#legacy-route-archive} — The removed D6 mansion-departure branch and earlier Routes/Paths
- [Legacy Password Archive](versions/legacy-passwords.md){#legacy-password-archive} — The three b0.7 D7 inputs (two do not advance the story) and the retired D11 Vault
- [Legacy Mechanics Archive](versions/legacy-mechanics.md){#legacy-mechanics-archive} — Path A first runs/replays, D8 Oswin questions and the removed D11 injection choice
:::

::::

::: {.pw-home-reading-notes}
### Spoilers

The guide includes Routes, Bad Endings, medals, CGs, Compendium entries and ending requirements. Read after reaching the relevant chapter if you want to experience it first; use tiered hints or the FAQ when stuck.

### Hint-first passwords

The four main password checks offer progressive hints without spelling out the answers. Easter-egg inputs and legacy passwords are covered separately.
:::

## Game and site links {#official-links}

**Grizz’s official links:** [Game and downloads · itch.io](https://passwordvn.itch.io/password) · [Creator support · Patreon](https://www.patreon.com/PASSWORDVN) · [Community · Discord](https://discord.gg/CSuEPWt) (18+ / NSFW)

Maintained by [Carambi](https://carambi.com/). This guide is not affiliated with Grizz or itch.io and does not distribute the game or unauthorized game art, full scripts or third-party material.

::: {.pw-discussions-entry}
[View all discussions](discussions.md) — Read discussions across the English and Chinese guides, then return to the original page to reply. No account is required.
:::

For errors, unclear guidance, broken links or page problems, use **Private feedback** in the footer. If feedback is unavailable or the issue concerns the repository, use [GitHub Issues](https://github.com/yangtaomijian/password-fvn-guide/issues).
