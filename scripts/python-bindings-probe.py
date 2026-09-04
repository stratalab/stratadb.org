"""Describe the Python SDK surface by introspecting the installed package.

Run by scripts/fetch-python-bindings.mjs. Prints JSON on stdout, keyed by the
wire type each method sends.

The join is two hops, and both matter. A namespace method (db.json.create_index)
calls a client method, and the CLIENT method carries the authoritative wire type
in its body as {'type': 'json_create_index'}. The client's method NAME is not
the wire type: the SDK calls it json_index_create while the wire type is
json_create_index, so joining on the name silently drops those commands.

Some namespace methods also delegate through a private helper instead of calling
the client directly (db.json.get goes through self._read), so follow one hop
before giving up.
"""

import inspect
import json
import re

import stratadb

WIRE = re.compile(r"""['"]type['"]\s*:\s*['"]([a-z0-9_]+)['"]""")
CLIENT_CALL = re.compile(r"self\._c\.([a-z0-9_]+)\(")
HELPER_CALL = re.compile(r"self\.(_[a-z0-9_]+)\(")

NAMESPACES = [
    "kv", "json", "vectors", "events", "graphs",
    "branches", "spaces", "admin", "arrow", "ai", "hub",
]


def source(obj):
    try:
        return inspect.getsource(obj)
    except Exception:
        return ""


def wire_of_client(client, name):
    found = WIRE.search(source(getattr(client, name, None)))
    return found.group(1) if found else None


def resolve(ns, client, fn):
    src = source(fn)
    direct = CLIENT_CALL.search(src)
    if direct:
        return wire_of_client(client, direct.group(1))

    helper = HELPER_CALL.search(src)
    if helper:
        helper_src = source(getattr(ns, helper.group(1), None))
        # A helper may build the command itself rather than call the client,
        # which is what db.json.get does through _read.
        literal = WIRE.search(helper_src)
        if literal:
            return literal.group(1)
        indirect = CLIENT_CALL.search(helper_src)
        if indirect:
            return wire_of_client(client, indirect.group(1))
    return None


def main():
    db = stratadb.open(cache=True)
    out = {}
    for ns_name in NAMESPACES:
        ns = getattr(db, ns_name, None)
        client = getattr(ns, "_c", None) if ns is not None else None
        if client is None:
            continue
        for name in sorted(dir(ns)):
            if name.startswith("_"):
                continue
            fn = getattr(ns, name, None)
            if not callable(fn):
                continue
            wire = resolve(ns, client, fn)
            if not wire:
                continue
            doc = inspect.getdoc(fn) or ""
            try:
                signature = str(inspect.signature(fn))
            except Exception:
                signature = "()"
            example = [
                line.strip()[4:]
                for line in doc.splitlines()
                if line.strip().startswith(">>> ")
            ]
            out.setdefault(wire, {
                "call": "db.%s.%s" % (ns_name, name),
                "signature": signature,
                "summary": doc.split("\n")[0].strip(),
                "example": example,
            })
    print(json.dumps(out))


main()
