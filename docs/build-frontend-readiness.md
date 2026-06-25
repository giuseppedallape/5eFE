# Build Frontend Readiness Audit

Date: 2026-06-17
Scope: `/api/builds/draft`, `/api/builds/validate`, `/api/builds/sheet` and their supporting services, as consumed by a future 360° character-builder frontend.
Method: source read of `src/api/build-*.mjs`, `src/routes/api.mjs`, `scripts/smoke-api.sh`, plus live calls against the running PM2 process (`server`, port 3333) and the MongoDB-backed `/api/stats` endpoint. Not based on uploaded PDFs.

Not found anywhere: `/api/builds/*` is **not documented in `docs/openapi.yaml`**. Everything below is reverse-engineered from code + live responses, not from a spec.

---

## 1. Endpoint shapes (verified live)

**`GET /builds/draft`** → `{ draft, choiceManifest: { choices[], summary }, spellChoiceManifest: { choices[], summary }, abilityScoreManifest, raceBuilder, classBuilder, backgroundBuilder }`

**`POST /builds/validate`** → `{ valid, partial, errors[], warnings[], summary, resolved: { choices, spellChoices, abilityScores }, choiceManifestSummary, spellChoiceManifestSummary, abilityScoreManifestSummary, draft? }`
Error objects: `{ choiceId, code, message, ...extra }`. On hard failure (e.g. missing required spell choice) the route returns the error envelope at the top level instead (`{ error: "BUILD_SPELL_CHOICES_INVALID", valid:false, errors[], warnings[] }`) — **two different failure shapes**, frontend must handle both.

**`POST /builds/sheet`** → `{ valid, sheet: { identity, abilityBonuses, abilities, size, speed, senses, defenses, proficiencies, equipment, features, spellcasting, spells, resourceUsage, derivedStats, combatStats, weaponAttacks, spellActions, actions, resources, summary, warnings }, resolved, choiceManifestSummary }`

---

## 2. Supported builder domains

| Domain | Status | Notes |
|---|---|---|
| Race | ✅ Working | Ability/skill/language/tool choices resolved generically via `buildChoiceGroup`. |
| Subrace | ❌ Not wired | `subrace` exists as a browsable entity type (92 entries) but is **not referenced anywhere** in `build-draft-service.mjs`, `race-builder-service.mjs`, `build-validation-service.mjs`, or `build-sheet-service.mjs`. Verified by grep — zero hits. |
| Class | ✅ Working (single class) | 13 PHB/TCE classes + Artificer playable; 3 TCE "Sidekick" variants and 1 unofficial UA class (Mystic) also present in data. |
| Multiclassing | ❌ Not supported | Zero occurrences of "multiclass" in any builder service. Schema is single `class` + single `subclass` + one `level` integer. |
| Background | ⚠️ Partial | Skills/languages/tools/equipment choices fully resolved. Background-granted **feats are detected but not resolvable**: confirmed live with `astral-drifter` (AAG) → `backgroundBuilder.feats = { raw, count:1, hasFeat:true }` but **no corresponding entry in `choiceManifest`**, so the feat can't be selected/validated/applied to the sheet. 15 backgrounds in the DB have `hasFeat:true`. |
| Subclass | ✅ Working | Required single choice, resolved at the class's first-subclass-feature level. |
| Skills | ✅ Working | Race/class/background skill choices all flow into `choiceManifest` with labeled options. |
| Equipment | ⚠️ Partial | Choice structure (groups, selectors, focus substitution) is solid, but **underlying item data has holes**: live test shows `item:phb:quarterstaff` missing from the DB, surfaced as `SYNTHETIC_ITEM_SELECTED` warning with placeholder data (`exists:false`). Frontend must handle synthetic/placeholder items gracefully. |
| Languages | ✅ Working | Including wildcard options (e.g. "any standard language"). |
| Spells (selection) | ✅ Working | Cantrips/spellbook/known/prepared/pact choice kinds all implemented with count + ability-modifier-driven formulas. |
| Spells (as actions) | ❌ Mostly stubbed | `SPELL_ACTION_RULES` in `build-spell-action-service.mjs` is a **hand-curated table covering only 8 spells** (sacred-flame, guiding-bolt, healing-word, cure-wounds, bless, shield-of-faith, guidance, light) out of 525 spells in the DB. Live test: a wizard with Fire Bolt + Magic Missile prepared gets `spellActions: { available:false, actions:[] }` — these spells produce **no action card**. |
| Ability scores | ⚠️ Partial | Only `standardArray` and `manual` (3–18 range) methods exist. **No point-buy method.** Manual mode doesn't distinguish "rolled" from "freely assigned" (no cost/legality check either way — by design, since it's manual). |
| Resources | ⚠️ Partial | HP, temp HP, death saves, concentration validity, and active conditions are modeled generically. **No class resource pools**: confirmed zero hits for ki/rage/sorcery points/superiority dice/channel divinity/hit dice/bardic inspiration in `build-resource-state-service.mjs` or `build-sheet-service.mjs`. Spell slots live only inside `spellcasting.spellSlots` / `actions.spellSlots`, not in `resources`. |
| Actions | ⚠️ Partial | Weapon attacks are data-driven via `WEAPON_RULES` (24 of ~37 PHB weapons covered — missing battleaxe, halberd, lance, maul, morningstar, pike, trident, war pick, whip, blowgun, hand/heavy crossbow, net, and all non-PHB/firearm weapons). Spell actions are the 8-spell stub above. Class features that grant repeatable actions (e.g. Second Wind, Lay on Hands, Channel Divinity as an activatable action rather than a resource) are **not surfaced as actions** at all. |
| Conditions | ✅ Working (tracking), ❌ rules engine thin | `resources.conditions` tracks active/unknown condition slugs and a small set of boolean effect flags (`hasAttackRollDisadvantage`, etc.). Only a handful of effect keys exist — not a full 5e condition rules table (e.g. no explicit speed=0 for grappled/restrained, no auto-fail-strength-saves for paralyzed). |

---

## 3. Missing frontend-critical choice types

These are choices a real builder UI needs that the backend either doesn't expose or doesn't resolve:

1. **Background-granted feat selection** — detected (`hasFeat`) but not in `choiceManifest`; can't be picked.
2. **Subrace selection** — entity type exists, completely disconnected from the builder pipeline.
3. **ASI vs. Feat at level 4/8/12/16/19** — not modeled as an explicit choice type; only generic `optionalFeatureProgression` entries exist, with no dedicated "ability score improvement" choice kind.
4. **Point-buy ability scores** — only standard array / manual exist.
5. **Multiclass entry/level split** — no schema support for a second class at all.
6. **Feat-granted spells/features as sheet effects** — even where a feat is conceptually known (e.g. via `optionalFeature` data), there's no pipeline turning a selected feat into sheet-level proficiency/spell/resource changes.
7. **Class-specific resource pools as a generic "uses per rest" choice** — nothing to bind to (no ki/rage/sorcery point schema), so a frontend can't render "spend a resource" UI beyond spell slots and HP.
8. **Full weapon/spell action coverage** — any UI that lists "things you can do in combat" will under-report for ~35% of weapons and ~98% of spells today.

---

## 4. Fields to treat as stable API contract

Not formally pinned anywhere (no OpenAPI entry), but exercised repeatedly and consistently by `scripts/smoke-api.sh` across many request/response cycles — safe to build a frontend against today:

- **Draft**: `choiceManifest.choices[].{id,scope,category,kind,count,options[].{value,label},hasOptions}`, `spellChoiceManifest.choices[].{id,kind,count,selectedValues}`, `abilityScoreManifest`.
- **Validate request**: `{ race, raceSource, class, classSource?, subclass?, background, backgroundSource, level, locale, partial, choices: {choiceId: value|value[]}, spellChoices: {choiceId: value|value[]}, abilityScores: {method, assignments} }`.
- **Validate response**: `{ valid, errors[].{choiceId, code, message}, warnings[].{choiceId, code, message}, summary.{resolvedChoiceCount, requiredChoiceCount, errorCount, warningCount} }`. Error `code` strings (`CHOICE_REQUIRED`, `INVALID_CHOICE_COUNT`, `INVALID_CHOICE_VALUE`, `UNKNOWN_CHOICE_ID`, `INVALID_EQUIPMENT_OPTION`, `SPELL_CHOICE_REQUIRED`, `INVALID_SPELL_SELECTION`, `MANUAL_ABILITY_SCORE_OUT_OF_RANGE`, etc.) are stable enough to drive UI error messages/i18n keys today.
- **Sheet**: top-level `sheet` keys (`identity, abilities, defenses, proficiencies, equipment, spellcasting, spells, derivedStats, combatStats, weaponAttacks, spellActions, actions, resources, summary`) are consistent and worth typing now.
- **Action entry**: `{ id, sourceType, kind, actionType, activationType, activationLabel, ability, attackBonus, damage, damageType, saveAbility, spellSaveDc, healing, range, concentration, displayLabels:{activation,range,attack,save,damage,healing,resource,condition} }` — the `displayLabels` block (pre-localized strings) is a strong contract: the frontend should consume these directly instead of re-deriving labels.
- **Entity refs embedded in sheet/choices** (items, spells): `{ id, entityType, source, name, originalName, slug, hasTranslation, hasItalian, imageUrl }`, now extended with `tokenImageUrl` per the prior session's change to `entity-dto.mjs` — also stable, also worth pinning.

Recommendation: once the frontend settles on a v1 of these shapes, add `/builds/*` to `docs/openapi.yaml` so drift is caught in review instead of by a frontend break.

---

## 5. Smoke test coverage (what's actually proven to work end-to-end)

`scripts/smoke-api.sh` only exercises: race = **elf** (always), background = **acolyte** (always), classes = **wizard, fighter/battle-master, sorcerer, warlock, cleric, monk/way-of-four-elements**, locale = **it**, max level tested = **7**.

That means: 1 race × 1 background × 6 of 13 classes × levels 1–7 is the only verified-good path. The other 133 races, 100 backgrounds, 7 classes, and levels 8–20 are **exercised by no automated test** — they may work (the logic is generic/data-driven for most domains) but are unverified.

---

## 6. Recommended milestone plan

**MVP — Level 1, single class, single race, no choices beyond the basics**
- Lock: race (no subrace), class (no multiclass), background (no feat-granting backgrounds), standard array only.
- Fix: wire background feats into `choiceManifest` (item 1 above) since several common backgrounds (Tasha-style customization, several setting backgrounds) already have `hasFeat:true` live in the DB.
- Accept the 8-spell/24-weapon action coverage as a known limitation; surface a generic "see spell description" fallback in the UI for unmapped spells instead of hiding them.

**PHB — Level 1, full Player's Handbook ruleset**
- Expand smoke coverage to all 9 PHB races and all 13 PHB classes/subclasses at level 1 (currently only elf + 6 classes are proven).
- Extend `WEAPON_RULES` to the remaining ~13 PHB weapons (battleaxe, halberd, lance, maul, morningstar, pike, trident, war pick, whip, blowgun, hand crossbow, heavy crossbow, net) — closes the PHB weapon-action gap completely.
- Add point-buy as a third ability-score method (frontend convention expects all three).
- Decide and implement an explicit ASI-vs-feat choice kind for level 4 (only level reachable... see next milestone for why this matters more at 5+).

**Levels 1–5**
- Implement explicit ASI/feat choice kind for level 4 across all classes (needed once leveling past 1 is in scope).
- Add subrace selection to the builder pipeline (race-builder, draft, validate, sheet) — half-elf, dragonborn ancestry, dwarf subraces etc. become relevant once players advance past a throwaway level-1 character.
- Expand `SPELL_ACTION_RULES` to cover the common levels 1–3 damage/save/buff spell list per class (a few dozen spells, not all 525) — this is the spell-action gap that will be most visible by level 5.
- Extend smoke tests to levels 1–5 for all classes, not just the 6 currently covered.

**Levels 1–20**
- Add class resource pools (ki, rage charges, sorcery points, superiority dice, channel divinity uses, hit dice) as a generic "resource pool" schema in `build-resource-state-service.mjs` — currently entirely absent, and become load-bearing well before level 20 (rage at 1, ki at 2, sorcery points at 2, superiority dice at 3).
- Add multiclassing support (schema change: `classes[]` instead of `class`), including split spell-slot tables.
- Build out the condition rules engine beyond the current handful of boolean flags (full PHB condition table: speed effects, auto-fail saves, attack advantage/disadvantage matrix per condition).
- Pin the contract: once the above stabilizes, document `/builds/*` in `docs/openapi.yaml`.
