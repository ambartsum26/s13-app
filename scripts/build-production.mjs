import { build } from 'esbuild';

const firebaseCdnAliases = new Map([
  ['https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js', 'firebase/app'],
  ['https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js', 'firebase/auth'],
  ['https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js', 'firebase/firestore']
]);

const firebaseCdnPlugin = {
  name: 'firebase-cdn-to-local-package',
  setup(context) {
    context.onResolve({ filter: /^https:\/\/www\.gstatic\.com\/firebasejs\/10\.8\.0\/firebase-(app|auth|firestore)\.js$/ }, async args => {
      const replacement = firebaseCdnAliases.get(args.path);
      if (!replacement) return null;
      return context.resolve(replacement, {
        kind: args.kind,
        importer: args.importer,
        resolveDir: process.cwd()
      });
    });
  }
};

await build({
  entryPoints: ['app.js'],
  outfile: 'app.bundle.js',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: ['es2022'],
  minify: true,
  treeShaking: true,
  charset: 'utf8',
  legalComments: 'none',
  logLevel: 'info',
  plugins: [firebaseCdnPlugin]
});
