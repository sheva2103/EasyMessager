import { FC } from "react";
import UserInfo from "../MenuComponent/UserInfo";
import styles from './Settings.module.scss'
import ToggleTheme from "../TogleTheme/ToggleTheme";
import Select from "./Select";
import LangIcon from '../../assets/translate.svg'
import BlackList from "./BlackList";
import ArrowLeft from '../../assets/box-arrow-left.svg'


const Settings: FC = () => {
    return (  
        <div>
            <UserInfo />
            <hr className={styles.hr}/>
            <div className={styles.group}>
                <div className={styles.item}>
                    <ToggleTheme />
                </div>
                <div className={styles.item}>
                    <div className={styles.container}>
                        <div>
                            <LangIcon fontSize={'1.2rem'}/>
                        </div>
                        <div className={styles.containerItem}>
                            <div>
                                <span>Язык</span>
                            </div>
                            <div>
                                <Select />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <hr className={styles.hr}/>
            <div className={styles.group}>
                <BlackList />
            </div>
            <hr className={styles.hr}/>
            <div className={styles.group}>
                <button>
                    <ArrowLeft />
                    <span>выйти</span>
                </button>
            </div>
        </div>
    );
}
 
export default Settings;