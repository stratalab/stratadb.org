---
title: "Installation"
section: "getting-started"
description: "Install the strata CLI and verify the binary with a cache-mode ping."
source: "strata-core@v1.1.0"
---

Install the `strata` CLI, then run one command to prove the binary works.

## Installer Script

```bash
curl -fsSL https://stratadb.org/install.sh | sh
```

The installer downloads the release for your platform, verifies the SHA-256
checksum from the release manifest, installs into `~/.strata/bin`, and updates
your shell path.

Pin a version or change the install directory when you need repeatable setup:

```bash
curl -fsSL https://stratadb.org/install.sh | STRATA_VERSION=1.1.0 sh
curl -fsSL https://stratadb.org/install.sh | STRATA_INSTALL_DIR=$HOME/bin sh
```

## Homebrew

```bash
brew install stratalab/tap/strata
```

## From Source

Use this path when you are developing StrataDB itself or need a custom build.
It requires Rust 1.91 or newer.

```bash
git clone https://github.com/stratalab/strata-core.git
cd strata-core
cargo build --release -p strata-cli
```

The binary is `target/release/strata`.

## Verify

```bash
strata --cache ping
```

```text
pong 1.1.0
```

`--cache` opens an in-memory database for this one process, so the check leaves
no database directory behind.

If the command is not found, open a new shell or add the install directory to
`PATH`. If the binary runs but the environment looks wrong, use:

```bash
strata doctor
```

`doctor` reports the binary version, platform, Strata home, path visibility, and
database health when you give it a path.

## Uninstall

Installer-script install:

```bash
rm -r ~/.strata/bin
```

Then remove the `# Strata` path block from your shell config. If you changed
`STRATA_INSTALL_DIR`, remove that directory instead.

Homebrew install:

```bash
brew uninstall strata
```

Uninstalling the binary does not delete databases you created. It also leaves
global config at `~/.config/strata/config.toml`.

## Next

Continue with [Your first database](/docs/getting-started/first-database).
