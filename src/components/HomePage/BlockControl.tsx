import { FC } from "react";
import styles from './HomePage.module.scss'
import SendMessage from '../../assets/send-fill.svg'
import Delete from '../../assets/delete.svg'
import Cansel from '../../assets/ban.svg'

type Props = {
    deselect: () => void
}

const BlockControl: FC<Props> = ({deselect}) => {
    return (  
        <div className={styles.blockControl}>
            <div className={styles.blockControl__item}>
                <span onClick={deselect}>отмена</span>
                <div><Cansel onClick={deselect}/></div>
            </div>
            <div className={styles.blockControl__item}>
                <SendMessage cursor={'pointer'} fontSize={'1.3rem'}/>
            </div>
            <div className={styles.blockControl__item}>
                <Delete cursor={'pointer'} fontSize={'1.3rem'}/>
            </div>
        </div>
    );
}
export default BlockControl;