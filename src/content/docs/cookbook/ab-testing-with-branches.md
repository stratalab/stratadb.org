---
title: "A/B Testing with Branches"
section: "cookbook"
description: "Fork one branch per variant, run each strategy in isolation, and compare the results without them touching each other."
source: "strata-core@v1.1.0"
---

Goal: run two agent strategies side by side and compare them, with each variant's
writes fully isolated from the other and from your baseline.

Prerequisites: the `strata` binary on your PATH, and `jq` for the compact fork
output. Commands write to a durable directory (`./ab`) that each invocation
reopens.

## 1. Seed a shared baseline

Anything written before you fork is inherited by every variant.

```bash
strata ./ab kv put prompt:system "You are a helpful assistant."
```

```text
created prompt:system applied=true
```

## 2. Fork one branch per variant

A fork is a cheap copy-on-write branch. Both start from the baseline at the same
version.

```bash
strata ./ab branch fork default variant-a --json | jq -c '{name: .data.name, forked_from: .data.parent.name, at_version: .data.parent.fork_version}'
strata ./ab branch fork default variant-b --json | jq -c '{name: .data.name, forked_from: .data.parent.name, at_version: .data.parent.fork_version}'
```

```text
{"name":"variant-a","forked_from":"default","at_version":3}
{"name":"variant-b","forked_from":"default","at_version":3}
```

## 3. Run each variant on its own branch

Pass `--branch` to target a variant. Here A runs cooler and produces two answers;
B runs hotter and produces three.

```bash
strata ./ab kv put config:temperature 0.2 --branch variant-a
strata ./ab event append answer '{"variant":"a","tokens":180}' --branch variant-a
strata ./ab event append answer '{"variant":"a","tokens":210}' --branch variant-a
strata ./ab kv put score 74 --branch variant-a

strata ./ab kv put config:temperature 0.9 --branch variant-b
strata ./ab event append answer '{"variant":"b","tokens":320}' --branch variant-b
strata ./ab event append answer '{"variant":"b","tokens":295}' --branch variant-b
strata ./ab event append answer '{"variant":"b","tokens":410}' --branch variant-b
strata ./ab kv put score 88 --branch variant-b
```

```text
created config:temperature applied=true
created applied=true
created applied=true
created score applied=true
created config:temperature applied=true
created applied=true
created applied=true
created applied=true
created score applied=true
```

## 4. Compare the branches

Read each variant's score and answer count directly.

```bash
strata ./ab --raw kv get score --branch variant-a
strata ./ab event count --branch variant-a
strata ./ab --raw kv get score --branch variant-b
strata ./ab event count --branch variant-b
```

```text
74
2
88
3
```

## 5. Confirm the baseline is untouched

The per-variant config never leaked back to `default`.

```bash
strata ./ab kv exists config:temperature
```

```text
false
```

## 6. Promote the winner

Variant B scored higher (88 vs 74), so fold it into `default` with `branch merge`.
Promotion carries the variant's KV, JSON, and vector writes onto the target as a
single atomic commit; the source branch is left unchanged.

```bash
strata ./ab branch merge variant-b default
```

The promotion reports the keys it applied — `config:temperature` and `score` —
with no conflicts, because `default` never received any per-variant config
(step 5) and so nothing diverged. Read them back on `default`:

```bash
strata ./ab --raw kv get config:temperature
strata ./ab --raw kv get score
```

```text
0.9
88
```

Had both branches changed the same key differently since the fork, the default
`strict` strategy would refuse with `conflict.engine.promotion` and leave
`default` untouched; `--strategy source-wins` would take the winner's side
instead. The variant's event stream stays on its own branch — events are
compared, never promoted — so `default` keeps an empty log.

## Why this works

Each fork is an isolated [branch](/docs/concepts/branches): writes on `variant-a`
and `variant-b` never see each other, and neither disturbs `default`. Because a
fork shares the parent's history until it diverges, the baseline you seed in step
1 is visible in both variants for free — no cleanup of half-written state on a
shared branch. Promotion with `branch merge` is deliberate and atomic — it folds
the winner's KV, JSON, and vector writes onto `default` in one commit and refuses
divergent conflicts by default, so you decide exactly what graduates. See the
[branch management guide](/docs/guides/branching-workflows) for the full lifecycle,
the [KV store guide](/docs/data/key-value) for value reads, and the
[event log guide](/docs/data/events) for per-branch action counts.
