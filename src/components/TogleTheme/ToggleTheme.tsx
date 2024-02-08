import styles from './ToggleTheme.module.scss'
import NightModeIcon from '../../assets/night.svg'
import { useTheme } from '../../hooks/useTheme';
import classNames from 'classnames';

const DARK = 'dark'
const LIGHT = 'light'

const ToggleTheme = () => {

    const { theme, setTheme } = useTheme()

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {

        e.stopPropagation()

        if (theme === DARK) setTheme('light')
        if (theme === LIGHT) setTheme('dark')
    }

    return (
        <div className={styles.wrapper}>
            <div><NightModeIcon /></div>
            <div><span>Ночной режим</span></div>
            <div>
                <div className={styles.container} onClick={handleClick}>
                    <div className={classNames(styles.item,
                        { [styles.disabled]: theme === LIGHT },
                        { [styles.active]: theme === DARK })} />
                    </div>
            </div>
        </div>
    );
}
export default ToggleTheme;