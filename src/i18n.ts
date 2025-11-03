import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import Backend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import ru from '../public/locales/ru.json'
import uk from '../public/locales/uk.json'
import en from '../public/locales/en.json'

const getSupportedLang = () => {
    const supportedLanguages = ['ru', 'uk', 'en']
    const browserLang = navigator.language.split('-')[0]
    return supportedLanguages.find(l => l === browserLang) || 'ru'
}

const currentLang = localStorage.getItem('i18nextLng') || getSupportedLang()


i18n.use(Backend).use(LanguageDetector).use(initReactI18next).init(
        {   
            lng: currentLang,
            resources: {
                ru: {
                    translation: ru
                },
                uk: {
                    translation: uk
                },
                en: {
                    translation: en
                }
            }
        }
    );

export default i18n;
