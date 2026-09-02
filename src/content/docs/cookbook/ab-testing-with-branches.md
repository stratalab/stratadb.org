---
title: "A/B Testing with Branches"
section: "cookbook"
description: "Fork one branch per variant, run each strategy in isolation, and compare the results without them touching each other."
source: "strata-core@v1.1.0"
---

Goal: run two agent strategies side by side and compare them, with each variant's
writes fully isolated from the other and from your baseline.

Prerequisite: the `strata` binary on your PATH. Open a durable database with
`strata ./ab` before step 1.

## 1. Seed a shared baseline

Anything written before you fork is inherited by every variant.

```text
strata:default/default › kv put prompt:system "You are a helpful assistant."
```

```text
created prompt:system applied=true
```

## 2. Fork one branch per variant

A fork is a cheap copy-on-write branch. Both start from the baseline at the same
version.

```text
strata:default/default › branch fork default variant-a
strata:default/default › branch fork default variant-b
```

```text
{ "name": "variant-a", "parent": { "name": "default", "fork_version": 3 }, "status": "active" }
{ "name": "variant-b", "parent": { "name": "default", "fork_version": 3 }, "status": "active" }
```

## 3. Run each variant on its own branch

Switch branches as each variant runs. Here A runs cooler and produces two
answers; B runs hotter and produces three.

```text
strata:default/default › use variant-a
strata:variant-a/default › kv put config:temperature 0.2
strata:variant-a/default › event append answer '{"variant":"a","tokens":180}'
strata:variant-a/default › event append answer '{"variant":"a","tokens":210}'
strata:variant-a/default › kv put score 74

strata:variant-a/default › use variant-b
strata:variant-b/default › kv put config:temperature 0.9
strata:variant-b/default › event append answer '{"variant":"b","tokens":320}'
strata:variant-b/default › event append answer '{"variant":"b","tokens":295}'
strata:variant-b/default › event append answer '{"variant":"b","tokens":410}'
strata:variant-b/default › kv put score 88
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

```text
strata:variant-b/default › use variant-a
strata:variant-a/default › --raw kv get score
strata:variant-a/default › event count
strata:variant-a/default › use variant-b
strata:variant-b/default › --raw kv get score
strata:variant-b/default › event count
```

```text
74
2
88
3
```

## 5. Confirm the baseline is untouched

The per-variant config never leaked back to `default`.

```text
strata:variant-b/default › use default
strata:default/default › kv exists config:temperature
```

```text
false
```

## 6. Promote the winner

Variant B scored higher (88 vs 74), so fold it into `default` with `branch merge`.
Promotion carries the variant's KV, JSON, and vector writes onto the target as a
single atomic commit; the source branch is left unchanged.

```text
strata:default/default › branch merge variant-b default
```

The promotion reports the keys it applied - `config:temperature` and `score` -
with no conflicts, because `default` never received any per-variant config
(step 5) and so nothing diverged. Read them back on `default`:

```text
strata:default/default › --raw kv get config:temperature
strata:default/default › --raw kv get score
```

```text
0.9
88
```

Had both branches changed the same key differently since the fork, the default
`strict` strategy would refuse with `conflict.engine.promotion` and leave
`default` untouched; `--strategy source-wins` would take the winner's side
instead. The variant's event stream stays on its own branch - events are
compared, never promoted - so `default` keeps an empty log.

## Why this works

Each fork is an isolated [branch](/docs/concepts/branches): writes on `variant-a`
and `variant-b` never see each other, and neither disturbs `default`. Because a
fork shares the parent's history until it diverges, the baseline you seed in step
1 is visible in both variants for free - no cleanup of half-written state on a
shared branch. Promotion with `branch merge` is deliberate and atomic - it folds
the winner's KV, JSON, and vector writes onto `default` in one commit and refuses
divergent conflicts by default, so you decide exactly what graduates. See the
[branch management guide](/docs/guides/branching-workflows) for the full lifecycle,
the [KV store guide](/docs/data/key-value) for value reads, and the
[event log guide](/docs/data/events) for per-branch action counts.
