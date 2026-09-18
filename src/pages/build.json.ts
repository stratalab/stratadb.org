// What is actually deployed, so a check against the live site can tell whether
// it is looking at the build it means to look at.
//
// The deploy workflow smoke-tests production after publishing. Without a stamp
// it cannot distinguish "the new build is live and healthy" from "the CDN is
// still serving the previous build, which was also healthy" - and a gate that
// can pass by testing the wrong thing is the failure this file exists to stop.
// GitHub Pages is a CDN; deploy-pages returning success does not guarantee the
// edge has caught up yet.
//
// `commit` is empty outside CI, where GITHUB_SHA is unset. That is deliberate:
// a local build should not claim a commit it cannot know.
import type { APIRoute } from 'astro';
import release from '../data/release.json';

export const GET: APIRoute = () =>
  new Response(
    `${JSON.stringify(
      {
        commit: process.env.GITHUB_SHA ?? '',
        ref: process.env.GITHUB_REF_NAME ?? '',
        built_at: new Date().toISOString(),
        strata: release.version,
      },
      null,
      2,
    )}\n`,
    { headers: { 'content-type': 'application/json; charset=utf-8' } },
  );
