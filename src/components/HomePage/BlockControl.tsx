import { FC } from "react";
import styles from './HomePage.module.scss'
import SendMessage from '../../assets/send-fill.svg'
import Delete from '../../assets/delete.svg'

type Props = {
    deselect: () => void
}

const BlockControl: FC<Props> = ({deselect}) => {
    return (  
        <div className={styles.blockControl}>
            <div className={styles.blockControl__item}>
                <span onClick={deselect}>отмена</span>
            </div>
            <div className={styles.blockControl__item}>
                <SendMessage cursor={'pointer'}/>
            </div>
            <div className={styles.blockControl__item}>
                <Delete cursor={'pointer'}/>
            </div>
        </div>
    );
}
export default BlockControl;