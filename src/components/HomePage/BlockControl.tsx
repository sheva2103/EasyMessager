import { FC } from "react";
import styles from './HomePage.module.scss'
import SendMessage from '../../assets/send-fill.svg'
import Delete from '../../assets/delete.svg'
import Cansel from '../../assets/ban.svg'
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { clearSelectedMessage, closeBar, isSendMessage } from "../../store/slices/appSlice";
import { CONTACTS } from "../../constants/constants";

type Props = {
    deselect: () => void
}

const BlockControl: FC<Props> = ({deselect}) => {

    const dispatch = useAppDispatch()
    const selectedMessage = useAppSelector(state => state.app.selectedMessages)

    const handleClickSendMessages = () => {
        if(!selectedMessage.length) return
        dispatch(isSendMessage(true))
        dispatch(closeBar(CONTACTS))
        console.log('send')
    }

    const handleClickDeleteMessages = () => {
        if(!selectedMessage.length) return
        console.log('delete')
    }

    const canselSelected = () => {
        deselect()
        if(selectedMessage.length) dispatch(clearSelectedMessage())
    }

    return (  
        <div className={styles.blockControl}>
            <div className={styles.blockControl__item} onClick={canselSelected}>
                <span>отмена</span>
                <div><Cansel /></div>
            </div>
            <div className={styles.blockControl__item} onClick={handleClickSendMessages}>
                <SendMessage 
                    cursor={'pointer'} 
                    fontSize={'1.3rem'}
                />
            </div>
            <div className={styles.blockControl__item} onClick={handleClickDeleteMessages}>
                <Delete cursor={'pointer'} fontSize={'1.3rem'}/>
            </div>
        </div>
    );
}
export default BlockControl;