const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, '..', 'node_modules', 'tw-animate-css', 'package.json');

if (fs.existsSync(pkgPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (pkg.exports && pkg.exports['.']) {
      pkg.exports['.'] = {
        style: './dist/tw-animate.css',
        import: './dist/tw-animate.css',
        default: './dist/tw-animate.css'
      };
      if (pkg.exports['./prefix']) {
        pkg.exports['./prefix'] = {
          style: './dist/tw-animate-prefix.css',
          import: './dist/tw-animate-prefix.css',
          default: './dist/tw-animate-prefix.css'
        };
      }
      pkg.exports['./*'] = './*';
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2), 'utf8');
      console.log('Successfully patched tw-animate-css package.json exports for Turbopack compatibility.');
    }
  } catch (err) {
    console.error('Failed to patch tw-animate-css:', err.message);
  }
}
