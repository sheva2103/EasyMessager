import styles from './ToggleTheme.module.scss'
import NightModeIcon from '../../assets/night.svg'
import ToogleButton from './ToogleButton';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';

const DARK = 'dark'
const LIGHT = 'light'


const ToggleTheme: FC = () => {
    const {t} = useTranslation()
    return (
        <div className={styles.wrapper}>
            <div><NightModeIcon /></div>
            <div><span>{t('darkMode')}</span></div>
            <div>
                <ToogleButton />
            </div>
        </div>
    );
}
export default ToggleTheme;