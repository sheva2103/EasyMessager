import { FC } from "react";
import styles from './HomePage.module.scss'

const SearchChatInput: FC = () => {
    return (  
        <div className={styles.blockInput}>
            <input type="text"/>
        </div>
    );
}
 
export default SearchChatInput;