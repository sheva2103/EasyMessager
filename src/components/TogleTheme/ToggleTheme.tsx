import styles from './ToggleTheme.module.scss'
import NightModeIcon from '../../assets/night.svg'
import { useTheme } from '../../hooks/useTheme';
import classNames from 'classnames';
import ToogleButton from './ToogleButton';
import { FC } from 'react';

const DARK = 'dark'
const LIGHT = 'light'


const ToggleTheme: FC = () => {

    return (
        <div className={styles.wrapper}>
            <div><NightModeIcon /></div>
            <div><span>Ночной режим</span></div>
            <div>
                {/* <div className={styles.container} onClick={handleClick}>
                    <div className={classNames(styles.item,
                        { [styles.disabled]: theme === LIGHT },
                        { [styles.active]: theme === DARK })} />
                </div> */}
                <ToogleButton />
            </div>
        </div>
    );
}
export default ToggleTheme;