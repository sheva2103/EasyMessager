import { FC } from "react";
import styles from './HomePage.module.scss'
import BlackListIcon from '../../assets/ban.svg'


const MessagesAreProhibited: FC = () => {
    return (  
        
            <div className={styles.unavailable}>
                <span>Недоступно</span>
                <div>
                    <BlackListIcon />
                </div>
            </div>
        
    );
}
 
export default MessagesAreProhibited;