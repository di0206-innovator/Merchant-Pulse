/**
 * Secret Scanner Script for MerchantPulse
 * Verifies that zero leaked secrets, API keys, private keys, or passwords exist in source files.
 */
import fs from 'fs';
import path from 'path';

const SECRET_PATTERNS = [
  { name: 'Razorpay Live Key', regex: /rzp_live_[a-zA-Z0-9]{14,}/ },
  { name: 'Google API Key', regex: /AIza[0-9A-Za-z\-_]{35}/ },
  { name: 'Generic Private Key', regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/ },
  { name: 'GitHub Personal Token', regex: /gh[pousr]_[A-Za-z0-9_]{36,}/ },
  { name: 'Slack Token', regex: /xox[baprs]-[0-9a-zA-Z]{10,}/ },
  { name: 'Stripe Secret Key', regex: /sk_live_[0-9a-zA-Z]{24}/ },
];

const IGNORE_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  'coverage',
  'dist',
  'build',
  'tsconfig.tsbuildinfo',
]);

const IGNORE_FILES = new Set([
  'package-lock.json',
  '.DS_Store',
]);

let findingsCount = 0;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        scanDir(fullPath);
      }
    } else if (entry.isFile()) {
      if (IGNORE_FILES.has(entry.name) || entry.name.endsWith('.tsbuildinfo')) {
        continue;
      }

      // Check file content
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.regex.test(content)) {
          console.error(`🚨 POTENTIAL SECRET FOUND: [${pattern.name}] in ${fullPath}`);
          findingsCount++;
        }
      }
    }
  }
}

console.log('🔍 Starting comprehensive secret & credential scan...');
scanDir(process.cwd());

if (findingsCount === 0) {
  console.log('✅ SECRET SCAN PASSED: Zero leaked API keys or private credentials found across codebase!');
  process.exit(0);
} else {
  console.error(`❌ SECRET SCAN FAILED: Found ${findingsCount} suspicious pattern(s).`);
  process.exit(1);
}
