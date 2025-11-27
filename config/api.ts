const rawBase = process.env.EXPO_PUBLIC_API_URL;
if (!rawBase) {
    throw new Error('Missing EXPO_PUBLIC_API_URL environment variable');
}
const base = rawBase.replace(/\/+$/, '');
export const VINS_ENDPOINT = `${base}/vins`;