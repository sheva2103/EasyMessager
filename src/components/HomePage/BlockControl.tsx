import { FC, useState } from "react";
import styles from './HomePage.module.scss'
import SendMessage from '../../assets/send-fill.svg'
import Delete from '../../assets/delete.svg'
import Cansel from '../../assets/ban.svg'
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { clearSelectedMessage, closeBar, isSendMessage, setShowCheckbox } from "../../store/slices/appSlice";
import { CONTACTS } from "../../constants/constants";
import { messagesAPI } from "../../API/api";
import Preloader from '../../assets/preloader.svg'
import { useTypedTranslation } from "../../hooks/useTypedTranslation";

const BlockControl: FC = () => {

    const [deleting, setDeleting] = useState(false)
    const dispatch = useAppDispatch()
    const {t} = useTypedTranslation()
    const selectedMessage = useAppSelector(state => state.app.selectedMessages)
    const chat = useAppSelector(state => state.app.selectedChat)
    const isFavorites = useAppSelector(state => state.app.isFavorites)

    const handleClickSendMessages = () => {
        if(!selectedMessage.length) return
        dispatch(isSendMessage(true))
        dispatch(closeBar(CONTACTS))
        console.log('send')
    }

    const handleClickDeleteMessages = () => {
        if(!selectedMessage.length) return
        setDeleting(true)
        const messages: Promise<void>[] = []
        selectedMessage.forEach(item => messages.push(messagesAPI.deleteMessage(chat, item, isFavorites)))
        Promise.all(messages)
            .then(() => dispatch(clearSelectedMessage()))
            .catch(() => console.log('error deleting selected messages'))
            .finally(() => setDeleting(false))
    }

    const canselSelected = () => {
        dispatch(clearSelectedMessage())
    }

    return (  
        <div className={styles.blockControl}>
            <div className={styles.blockControl__item} onClick={canselSelected}>
                <span>{t('cancel')}</span>
                <div><Cansel /></div>
            </div>
            <div className={styles.blockControl__item} onClick={handleClickSendMessages} title={t("forward")}>
                <SendMessage 
                    cursor={'pointer'} 
                    fontSize={'1.4rem'}
                />
            </div>
            <div className={styles.blockControl__item} onClick={handleClickDeleteMessages} title={t('deleteSelected')}>
                {!deleting ? 
                    <Delete cursor={'pointer'} fontSize={'1.4rem'}/>
                    :
                    <Preloader fontSize={'1.4rem'}/>
                }
            </div>
            <div className={styles.blockControl__item}>
                <span>{selectedMessage.length}</span>
            </div>
        </div>
    );
}
export default BlockControl;