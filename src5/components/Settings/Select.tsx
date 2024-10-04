import { FC } from "react";
import styles from './Settings.module.scss'


const Select: FC = () => {



    return (  
        <div>
            <select name="lang" id="lang" className={styles.select}>
                <option value="Українська" className={styles.options}>Українська</option>
                <option value="English" className={styles.options}>English</option>
                <option value="Русский" className={styles.options}>Русский</option>
            </select>
        </div>
    );
}
 
export default Select;