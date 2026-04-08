import { useSettingsStore } from '../store/settingsStore';
import { AppLanguage, translations } from './translations';

function getValueFromPath(obj: Record<string, unknown>, path: string): string | undefined {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj) as string | undefined;
}

export function getDeviceLanguage(): AppLanguage {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase();
  return locale.startsWith('fr') ? 'fr' : 'en';
}

export function getCurrentLanguage(): AppLanguage {
  const language = useSettingsStore.getState().language;
  return language === 'system' ? getDeviceLanguage() : language;
}

export function getCurrentLocale(): string {
  const language = getCurrentLanguage();
  return language === 'fr' ? 'fr-FR' : 'en-US';
}

export function t(
  key: string,
  params?: Record<string, string | number>,
  language: AppLanguage = getCurrentLanguage(),
): string {
  const template =
    getValueFromPath(translations[language], key) ??
    getValueFromPath(translations.en, key) ??
    key;

  if (!params) {
    return template;
  }

  return Object.entries(params).reduce((result, [paramKey, value]) => {
    return result.replaceAll(`{{${paramKey}}}`, String(value));
  }, template);
}

export function useI18n() {
  const language = useSettingsStore((state) => state.language);
  const resolvedLanguage = language === 'system' ? getDeviceLanguage() : language;
  const locale = resolvedLanguage === 'fr' ? 'fr-FR' : 'en-US';

  return {
    language,
    resolvedLanguage,
    locale,
    t: (key: string, params?: Record<string, string | number>) => t(key, params, resolvedLanguage),
  };
}
