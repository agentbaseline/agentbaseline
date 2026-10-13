// Lighthouse CI: the built site, scored the way a search engine and a browser
// audit would score it. Run after `hugo --gc --minify`:
//
//   npx --yes @lhci/cli@0.15.1 autorun
//
// SEO, accessibility and best practices fail the build below 0.95. Performance
// only warns below 0.85, because a shared CI runner's timings vary from run to
// run and a gate that fails on a slow machine is a gate people learn to rerun.
// The thresholds are the owner's to move, in a change of their own — never to
// get a build green.
//
// staticDistDir serves public/ from a local server with none of vercel.json's
// headers or rewrites, so what is scored is the HTML, not the deployment. Two
// things differ from production because of that, and neither is the page's
// fault: /_vercel/insights/script.js does not exist locally, so best practices
// sees a console error on every page; and the directory forms /controls/ and
// /reference-architecture/ are what this server answers, where Vercel answers
// /controls and /reference-architecture.
module.exports = {
  ci: {
    collect: {
      staticDistDir: './public',
      url: [
        'http://localhost/',
        'http://localhost/controls/',
        'http://localhost/reference-architecture/',
        'http://localhost/404.html',
      ],
      numberOfRuns: 1,
    },
    assert: {
      assertMatrix: [
        {
          // Every page a search engine is meant to index.
          matchingUrlPattern: '^(?!.*/404\\.html$).*$',
          assertions: {
            'categories:seo': ['error', { minScore: 0.95 }],
            'categories:accessibility': ['error', { minScore: 0.95 }],
            'categories:best-practices': ['error', { minScore: 0.95 }],
            'categories:performance': ['warn', { minScore: 0.85 }],
          },
        },
        {
          // The 404 page is held to the same bar on everything but SEO. It is
          // noindex on purpose — bin/check-seo fails the build if it is not —
          // and Lighthouse's SEO category scores that as "blocked from
          // indexing", worth 0.54 on its own. There is no score for it to
          // reach without becoming indexable, which is the one thing it must
          // not be.
          matchingUrlPattern: '/404\\.html$',
          assertions: {
            'categories:accessibility': ['error', { minScore: 0.95 }],
            'categories:best-practices': ['error', { minScore: 0.95 }],
            'categories:performance': ['warn', { minScore: 0.85 }],
          },
        },
      ],
    },
    upload: {
      target: 'filesystem',
      outputDir: './.lighthouseci',
    },
  },
};
