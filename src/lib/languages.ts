export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

export function getLanguageByCode(code: string) {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
}

export function getLanguageName(code: string) {
  return getLanguageByCode(code)?.name ?? code;
}

export function getLanguageFlag(code: string) {
  return getLanguageByCode(code)?.flag ?? '';
}
