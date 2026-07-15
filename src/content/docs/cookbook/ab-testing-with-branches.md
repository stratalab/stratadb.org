---
title: "A/B Testing with Branches"
section: "cookbook"
description: "Fork one branch per variant, run each strategy in isolation, and compare the results without them touching each other."
source: "strata-core@v1.0.0"
---

Goal: run two agent strategies side by side and compare them, with each variant's
writes fully isolated from the other and from your baseline.

Prerequisites: the `strata` binary on your PATH, and `jq` for the compact fork
output. Commands write to a durable directory (`./ab.db`) that each invocation
reopens.

## 1. Seed a shared baseline

Anything written before you fork is inherited by every variant.

```bash
strata ./ab.db kv put prompt:system "You are a helpful assistant."
```

```text
created prompt:system applied=true
```

## 2. Fork one branch per variant

A fork is a cheap copy-on-write branch. Both start from the baseline at the same
version.

```bash
strata ./ab.db branch fork default variant-a --json | jq -c '{name: .data.name, forked_from: .data.parent.name, at_version: .data.parent.fork_version}'
strata ./ab.db branch fork default variant-b --json | jq -c '{name: .data.name, forked_from: .data.parent.name, at_version: .data.parent.fork_version}'
```

```text
{"name":"variant-a","forked_from":"default","at_version":3}
{"name":"variant-b","forked_from":"default","at_version":3}
```

## 3. Run each variant on its own branch

Pass `--branch` to target a variant. Here A runs cooler and produces two answers;
B runs hotter and produces three.

```bash
strata ./ab.db kv put config:temperature 0.2 --branch variant-a
strata ./ab.db event append answer '{"variant":"a","tokens":180}' --branch variant-a
strata ./ab.db event append answer '{"variant":"a","tokens":210}' --branch variant-a
strata ./ab.db kv put score 74 --branch variant-a

strata ./ab.db kv put config:temperature 0.9 --branch variant-b
strata ./ab.db event append answer '{"variant":"b","tokens":320}' --branch variant-b
strata ./ab.db event append answer '{"variant":"b","tokens":295}' --branch variant-b
strata ./ab.db event append answer '{"variant":"b","tokens":410}' --branch variant-b
strata ./ab.db kv put score 88 --branch variant-b
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
strata ./ab.db --raw kv get score --branch variant-a
strata ./ab.db event count --branch variant-a
strata ./ab.db --raw kv get score --branch variant-b
strata ./ab.db event count --branch variant-b
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
strata ./ab.db kv exists config:temperature
```

```text
false
```

## 6. Promote the winner

There is no branch-merge command. To fold the winning variant into `default`, you
replay its writes there — read the winner's values and put them on `default`.
Variant B scored higher (88 vs 74), so promote it.

```bash
strata ./ab.db kv put config:temperature "$(strata ./ab.db --raw kv get config:temperature --branch variant-b)"
strata ./ab.db kv put score "$(strata ./ab.db --raw kv get score --branch variant-b)"
strata ./ab.db --raw kv get config:temperature
strata ./ab.db --raw kv get score
```

```text
created config:temperature applied=true
created score applied=true
0.9
88
```

## Why this works

Each fork is an isolated [branch](/docs/concepts/branches): writes on `variant-a`
and `variant-b` never see each other, and neither disturbs `default`. Because a
fork shares the parent's history until it diverges, the baseline you seed in step
1 is visible in both variants for free — no cleanup of half-written state on a
shared branch. Promotion is a deliberate replay of the winner's writes onto
`default`, not an automatic merge, so you decide exactly what graduates. See the
[branch management guide](/docs/guides/branching-workflows) for the full lifecycle,
the [KV store guide](/docs/data/key-value) for value reads, and the
[event log guide](/docs/data/events) for per-branch action counts.
