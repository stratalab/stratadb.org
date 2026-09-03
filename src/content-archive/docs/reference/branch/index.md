---
title: "branch commands"
description: "Command reference for the branch family."
source: strata-core@1.1.1
section: branch
---

# `branch` - command reference

| Command | Summary |
|---|---|
| [Create empty branch](/docs/reference/branch/create) | Create a new empty root branch. |
| [Delete branch](/docs/reference/branch/delete) | Delete an active branch and release its storage claims. |
| [Compare branches](/docs/reference/branch/diff) | Compare two branches and report the entities that differ across every primitive. |
| [Fork branch from current head](/docs/reference/branch/fork) | Fork a new branch from the current head of a source branch. |
| [Fork branch at timestamp](/docs/reference/branch/fork_at_timestamp) | Fork a new branch from a retained source timestamp. |
| [Fork branch at version](/docs/reference/branch/fork_at_version) | Fork a new branch from a retained source commit version. |
| [Read one branch](/docs/reference/branch/get) | Read one branch summary by name. |
| [List branches](/docs/reference/branch/list) | List active branches with their lineage facts. |
| [Promote branch](/docs/reference/branch/merge) | Promote one branch's changes into another as a single atomic commit. |
| [Preview branch promotion](/docs/reference/branch/preview) | Preview promoting one branch into another, reporting conflicts without mutating either branch. |
