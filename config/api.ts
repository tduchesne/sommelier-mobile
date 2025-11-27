const base = process.env.EXPO_PUBLIC_API_URL;
if (!base) {
  throw new Error('Missing EXPO_PUBLIC_API_URL environment variable');
}
export const VINS_ENDPOINT = `${base}/vins`;