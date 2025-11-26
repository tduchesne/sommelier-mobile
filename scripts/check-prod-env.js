/* Simple CI-friendly check to ensure a secure API URL is configured for production builds. */

const apiUrl = process.env.EXPO_PUBLIC_API_URL;

if (!apiUrl) {
  console.error(
    'ERROR: EXPO_PUBLIC_API_URL is not set. Production builds must define a secure HTTPS API URL.'
  );
  process.exit(1);
}

try {
  const url = new URL(apiUrl);

  if (url.protocol !== 'https:' || !url.hostname) {
    throw new Error('Invalid HTTPS URL');
  }
} catch {
  console.error(
    `ERROR: EXPO_PUBLIC_API_URL must be a valid HTTPS URL (received "${apiUrl}"). Set it to an https:// URL before building for production.`
  );
  process.exit(1);
}

console.log('EXPO_PUBLIC_API_URL is set and uses HTTPS ✔️');


