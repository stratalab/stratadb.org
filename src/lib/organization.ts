// The Strata Labs entity, in one place.
//
// Google answers "who built StrataDB" with a stranger, because the only
// authorship claim in the name cluster was someone else's: nevzheng/strata-db
// says "built on my own terms" and links to a homepage, while our repos named
// nobody. The fix is not a louder claim, it is the same claim repeated
// consistently everywhere a crawler looks.
//
// "Consistently" is the whole point, so the entity is defined once. Every page
// emits this object, and /labs renders its prose from the same constants, so a
// page and the structured data behind it cannot describe different orgs.
//
// Deliberately absent: legalName, address, foundingDate, employee counts.
// Strata Labs is an open-source project organization, not a company, and
// inventing corporate facts to fill a schema is how an entity stops being
// trusted.

/** Stable identifier every other node points at. Never change it. */
export const ORGANIZATION_ID = 'https://stratadb.org/#strata-labs';

export const ORG_NAME = 'Strata Labs';
export const ORG_GITHUB = 'https://github.com/stratalab';

/** The sentence that answers "who develops StrataDB". Used verbatim on-page. */
export const ORG_ATTRIBUTION =
  'StrataDB is an open-source database developed and maintained by Strata Labs.';

export const ORG_SUMMARY =
  'Strata Labs is the open-source project organization behind StrataDB and related research projects.';

export const organization = {
  '@type': 'Organization',
  '@id': ORGANIZATION_ID,
  name: ORG_NAME,
  // The handle and the short form people actually type. `alternateName` is
  // what lets a query for "Strata" resolve to this entity rather than compete
  // with it.
  alternateName: ['Strata', 'stratalab'],
  url: 'https://stratadb.org/',
  logo: 'https://stratadb.org/strata-labs-logo.png',
  description: ORG_SUMMARY,
  sameAs: [ORG_GITHUB],
};

/**
 * The product, pointed at the organization by `@id` rather than by repeating
 * it. `maintainer` and `publisher` say stewardship; `author` and `creator` are
 * left off on purpose, because they read as historical individual authorship,
 * which is the exact inference being corrected.
 */
export function softwareApplication(fields: Record<string, unknown>) {
  return {
    '@type': 'SoftwareApplication',
    name: 'StrataDB',
    url: 'https://stratadb.org/',
    applicationCategory: 'DeveloperApplication',
    maintainer: { '@id': ORGANIZATION_ID },
    publisher: { '@id': ORGANIZATION_ID },
    sameAs: ['https://github.com/stratalab/strata-core', 'https://pypi.org/project/stratadb/'],
    ...fields,
  };
}
