import { FC } from "react";
import styles from './HomePage.module.scss'
import Avatar from "../Avatar/Avatar";


const ChatInfo: FC = () => {
    return (  
        <li className={styles.chatInfo}>
            <Avatar url={undefined} name="b"/>
            <span className={styles.name}>имя sfsfsfsfs fsfsfsfsf gsgsfzscfwfa adfade</span>
        </li>
    );
}
export default ChatInfo;