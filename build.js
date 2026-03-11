const esbuild = require('esbuild');
const fs = require('fs');

const pkg = require('./package.json');
const VERSION = pkg.version;
const WATCH = process.argv.includes('--watch');

// Version replacement plugin
const versionPlugin = {
  name: 'version-replace',
  setup(build) {
    build.onLoad({ filter: /\.js$/ }, async (args) => {
      let contents = fs.readFileSync(args.path, 'utf8');
      contents = contents.replace(/\{version\}/g, VERSION);
      return { contents, loader: 'js' };
    });
  },
};

// Shared build options
const shared = {
  entryPoints: ['src/index.js'],
  bundle: true,
  sourcemap: false,
  plugins: [versionPlugin],
};

async function build() {
  const builds = [
    // ESM build (for npm/webpack users)
    {
      ...shared,
      outfile: 'dist/index.mjs',
      format: 'esm',
      minify: false,
      target: 'es2020',
    },
    // CJS build (for require())
    {
      ...shared,
      outfile: 'dist/index.js',
      format: 'cjs',
      minify: false,
      target: 'es2020',
    },
    // UMD/CDN build (minified, for script tags)
    {
      ...shared,
      outfile: 'dist/chatsy.min.js',
      format: 'iife',
      globalName: 'Chatsy',
      minify: true,
      target: ['es2015'],
      // Unwrap the default export so `window.Chatsy` is the class, not { default, Chatsy }
      footer: { js: 'Chatsy=Chatsy.default||Chatsy.Chatsy||Chatsy;' },
    },
  ];

  if (WATCH) {
    // Use esbuild's watch mode via context API
    const contexts = await Promise.all(
      builds.map(config => esbuild.context(config)),
    );

    await Promise.all(contexts.map(ctx => ctx.watch()));
    console.log(`Watching chatsy v${VERSION} for changes...`);
  } else {
    await Promise.all(builds.map(config => esbuild.build(config)));
    console.log(`Built chatsy v${VERSION} (ESM, CJS, UMD)`);
  }
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
