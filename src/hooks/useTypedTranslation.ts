import { useTranslation } from 'react-i18next';
import type { TranslationKeys } from '../types/locales';

export const useTypedTranslation = () => {
    const { t: rawT, i18n } = useTranslation();

    const t = (key: TranslationKeys, options?: Record<string, unknown>) => {
        return rawT(key, options);
    };

    return { t, i18n };
};
