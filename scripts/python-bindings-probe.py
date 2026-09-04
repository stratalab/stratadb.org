"""Describe the Python SDK surface by introspecting the installed package.

Run by scripts/fetch-python-bindings.mjs. Prints JSON on stdout, keyed by the
wire type each method sends.

Finding the wire type is the whole job, and there are four shapes to handle:

1. The method calls a client method, and the CLIENT method's body carries the
   wire type as {'type': 'json_create_index'}. The client's method NAME is not
   a reliable key: the SDK calls it json_index_create while the wire type is
   json_create_index.
2. The method builds the command itself, so the wire literal is in its own body
   (db.ai.embed). Docstrings are stripped before matching so prose cannot be
   mistaken for a command.
3. The method delegates through a private helper that does either of the above
   (db.json.get goes through _read).
4. One method can serve SEVERAL commands, choosing by argument
   (db.branches.fork covers branch_fork, branch_fork_at_version and
   branch_fork_at_timestamp). Every wire type it can send gets the binding.

Namespaces also nest: db.graphs.ontology and db.graphs.analytics are objects in
their own right, so one level of sub-namespace is walked too.
"""

import inspect
import json
import re

import stratadb

WIRE = re.compile(r"""['"]type['"]\s*:\s*['"]([a-z0-9_]+)['"]""")
CLIENT_CALL = re.compile(r"self\._c\.([a-z0-9_]+)\(")
HELPER_CALL = re.compile(r"self\.(_[a-z0-9_]+)\(")
DOCSTRING = re.compile(r'("""|\'\'\')(?:.|\n)*?\1')

NAMESPACES = [
    "kv", "json", "vectors", "events", "graphs",
    "branches", "spaces", "admin", "arrow", "ai", "hub",
]


def source(obj):
    try:
        return inspect.getsource(obj)
    except Exception:
        return ""


def body(obj):
    """Source with docstrings removed, so prose cannot look like a command."""
    return DOCSTRING.sub("", source(obj))


def wires_from_client(client, names):
    out = []
    for name in names:
        found = WIRE.search(body(getattr(client, name, None)))
        if found:
            out.append(found.group(1))
    return out


def resolve(ns, client, fn):
    """Every wire type this method can send."""
    src = body(fn)

    direct = CLIENT_CALL.findall(src)
    if direct:
        return wires_from_client(client, direct)

    literal = WIRE.findall(src)
    if literal:
        return literal

    helper = HELPER_CALL.search(src)
    if helper:
        helper_src = body(getattr(ns, helper.group(1), None))
        found = WIRE.findall(helper_src)
        if found:
            return found
        indirect = CLIENT_CALL.findall(helper_src)
        if indirect:
            return wires_from_client(client, indirect)
    return []


def better(candidate, existing):
    """Which of two methods sending the same command should be shown.

    Several methods can send one command: db.kv.keys and db.kv.iter_keys both
    send kv_list. Prefer the plain one over the iterator wrapper, then the
    shorter name, so a page shows db.kv.keys rather than db.kv.iter_keys.
    """
    if existing is None:
        return True
    a, b = candidate.split(".")[-1], existing.split(".")[-1]
    a_iter, b_iter = a.startswith("iter_"), b.startswith("iter_")
    if a_iter != b_iter:
        return b_iter
    return len(a) < len(b)


def collect(ns, client, prefix, out):
    for name in sorted(dir(ns)):
        if name.startswith("_"):
            continue
        attr = getattr(ns, name, None)
        if attr is None:
            continue

        if callable(attr):
            for wire in resolve(ns, client, attr):
                doc = inspect.getdoc(attr) or ""
                try:
                    signature = str(inspect.signature(attr))
                except Exception:
                    signature = "()"
                example = [
                    line.strip()[4:]
                    for line in doc.splitlines()
                    if line.strip().startswith(">>> ")
                ]
                call = "%s.%s" % (prefix, name)
                if better(call, out.get(wire, {}).get("call")):
                    out[wire] = {
                        "call": call,
                        "signature": signature,
                        "summary": doc.split("\n")[0].strip(),
                        "example": example,
                    }
            continue

        # A sub-namespace: db.graphs.ontology, db.graphs.analytics, db.ai.models.
        sub_client = getattr(attr, "_c", client)
        if any(not m.startswith("_") and callable(getattr(attr, m, None)) for m in dir(attr)):
            collect(attr, sub_client, "%s.%s" % (prefix, name), out)


def main():
    db = stratadb.open(cache=True)
    out = {}
    for ns_name in NAMESPACES:
        ns = getattr(db, ns_name, None)
        client = getattr(ns, "_c", None) if ns is not None else None
        if client is None:
            continue
        collect(ns, client, "db.%s" % ns_name, out)
    print(json.dumps(out))


main()
