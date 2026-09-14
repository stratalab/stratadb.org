// Words readers arrive with, mapped to the page that answers them.
//
// Strata introduces vocabulary. Someone looking for the thing they know types
// "transaction", "rollback" or "table", and Pagefind matches text, so today
// they get nothing for a product that has a good answer to all three.
//
// Two of these matter more than search convenience. `transaction` and
// `state cell` are concepts Strata used to have and removed in V1. Someone
// searching for them is carrying stale knowledge from an older version, an old
// blog post, or v0.x code, and the right result is the page explaining what
// replaced it rather than an empty list. The SDK already does this well: db.state
// raises an error naming db.kv and db.json as its replacements. This is the same
// courtesy, in search.
//
// The rule for adding one: only a genuine synonym for something the page
// actually covers. This exists so a reader finds the page that answers them, not
// to make pages match words they do not address. If a term has no good answer
// anywhere, the honest result is still nothing.
export const searchAliases: Record<string, string[]> = {
  '/docs/learn/commits-and-versions': [
    'transaction',
    'transactions',
    'begin commit rollback',
    'autocommit',
    'checkpoint',
    'acid',
  ],
  '/docs/learn/time-travel': [
    'rollback',
    'undo',
    'revert',
    'point in time recovery',
    'snapshot isolation',
    'as of query',
  ],
  '/docs/learn/branches': ['git branch', 'checkout', 'copy on write', 'zero copy clone'],
  '/docs/learn/working-with-data': [
    'state cell',
    'table',
    'tables',
    'rows',
    'columns',
    'schema',
    'collections',
  ],
  '/docs/learn/databases-and-storage': [
    'data directory',
    'files on disk',
    'copy the database',
    'nfs',
    'network filesystem',
    'disk usage',
    'vacuum',
    'compaction',
  ],
  '/docs/learn/durability': ['fsync', 'wal', 'write ahead log', 'crash safety', 'acid durability'],
  '/docs/learn/embedded-databases': [
    'connection string',
    'connection pool',
    'server',
    'daemon',
    'sqlite alternative',
    'duckdb',
  ],
  '/docs/learn/vectors': ['vector database', 'embeddings search', 'similarity search', 'ann index'],
  '/docs/learn/events': ['append only log', 'audit log', 'event sourcing', 'kafka'],
  '/docs/learn/graph': ['graph database', 'neo4j', 'cypher', 'traversal'],
  '/docs/learn/should-i-use-strata': [
    'sql',
    'joins',
    'postgres alternative',
    'is it production ready',
    'limitations',
    'when not to use',
  ],
  '/docs/guides/data/migrate-from-sqlite': ['sqlite', 'migration', 'import from sql', 'etl'],
  '/docs/guides/operations/back-up-a-database': ['backup', 'restore', 'pg_dump', 'snapshot'],
  '/docs/guides/operations/troubleshoot-failures': [
    'data missing',
    'cannot open database',
    'database locked',
    'corrupt',
  ],
  '/docs/reference/errors': ['error handling', 'exception', 'retry', 'idempotency'],
  '/docs/reference/compatibility': ['upgrade', 'downgrade', 'breaking change', 'version support'],
  '/docs/develop/python/opening-databases': [
    'thread safe',
    'connection',
    'multiprocessing',
    'asyncio',
  ],
};
