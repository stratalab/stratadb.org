---
title: "Installation"
section: "getting-started"
description: "Install the strata CLI with the installer script, Homebrew, or from source."
source: "strata-core@v1.0.0"
---


## Install the CLI

### Installer script (recommended)

```bash
curl -fsSL https://stratadb.org/install.sh | sh
```

The installer downloads the latest release for your platform, verifies its
SHA-256 checksum against the release manifest, installs the binary to
`~/.strata/bin`, and adds that directory to your shell's PATH.

Two environment variables override the defaults:

```bash
# Pin a specific version instead of latest
curl -fsSL https://stratadb.org/install.sh | STRATA_VERSION=<version> sh

# Install somewhere else
curl -fsSL https://stratadb.org/install.sh | STRATA_INSTALL_DIR=$HOME/bin sh
```

### Homebrew

```bash
brew install stratalab/tap/strata
```

### From source

```bash
git clone https://github.com/stratalab/strata-core.git
cd strata-core
cargo build --release -p strata-cli
```

The binary is located at `target/release/strata`.

### Running Tests (development)

```bash
# All tests across the workspace
cargo test --workspace

# Specific crate
cargo test -p strata-executor

# With output
cargo test --workspace -- --nocapture
```

## Verify Installation

Run a quick command to confirm the CLI is working:

```bash
strata --cache ping
```

Expected output is `pong` followed by the installed version.

You can also try a quick interactive session:

```
$ strata --cache
strata:default/default> kv put hello world
created hello applied=true
strata:default/default> kv get hello
world
strata:default/default> quit
```

If you see the output above, you are ready to go. Continue to [Your First Database](first-database) for a complete tutorial.

## Uninstall

If you installed with the installer script, remove the binary directory and
the PATH line the installer added:

```bash
rm -rf ~/.strata/bin
```

(Use your `STRATA_INSTALL_DIR` if you overrode the default.) Then delete the
`# Strata` block from your shell config — `~/.zshrc`, `~/.bashrc`,
`~/.config/fish/config.fish`, or `~/.profile`.

If you installed with Homebrew:

```bash
brew uninstall strata
```

Uninstalling removes only the binary. Your databases stay wherever you created
them, and the global config remains at `~/.config/strata/config.toml` — delete
those yourself if you want a clean slate.

## Next

- [Your First Database](first-database) — hands-on tutorial
- [Concepts](/docs/concepts) — understand the mental model
