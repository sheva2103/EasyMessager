import { FC } from "react";
import styles from './ToggleTheme.module.scss'
import classNames from 'classnames';
import { useTheme } from '../../hooks/useTheme';

const DARK = 'dark'
const LIGHT = 'light'

const ToogleButton: FC = () => {

    const { theme, setTheme } = useTheme()

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {

        if (theme === DARK) setTheme('light')
        if (theme === LIGHT) setTheme('dark')
    }

    return (
        <div className={styles.container} onClick={handleClick}>
            <div className={classNames(styles.item,
                { [styles.disabled]: theme === LIGHT },
                { [styles.active]: theme === DARK })} />
        </div>
    );
}

export default ToogleButton;