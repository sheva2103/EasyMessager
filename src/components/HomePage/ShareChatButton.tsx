import { FC } from "react";
import ShareIcon from '../../assets/box-arrow-left.svg'
import styles from './HomePage.module.scss'
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { addSelectedMessage, closeBar, isSendMessage } from "../../store/slices/appSlice";
import { createShareChatObj } from "../../utils/utils";
import { Chat } from "../../types/types";
import { CONTACTS } from "../../constants/constants";
import { useTypedTranslation } from "../../hooks/useTypedTranslation";

const ShareChatButton: FC<{chat: Chat}> = ({chat}) => {

    const currentUser = useAppSelector(state => state.app.currentUser)
    const dispatch = useAppDispatch()
    const message = createShareChatObj({sender: currentUser, shareChat: chat})
    const { t } = useTypedTranslation()
    const clickHandler = () => {
        console.log(message)
        dispatch(addSelectedMessage(message))
        dispatch(isSendMessage(true))
        dispatch(closeBar(CONTACTS))
    }

    return ( 
        <div className={styles.shareChatButton}>
            <button onClick={clickHandler}>
                <div className={styles.shareChatButton__container}>
                    <div className={styles.shareChatButton__icon}><ShareIcon /></div>
                    <div>{t('share')}</div>
                </div>
            </button>
        </div>
    );
}

export default ShareChatButton;