import classNames from 'classnames';
import styles from './HomePage.module.scss'
import SendMessage from '../../assets/send-fill.svg'
import Copy from '../../assets/copy.svg'
import Delete from '../../assets/delete.svg'
import Select from '../../assets/check-all.svg'
import Change from '../../assets/change.svg'
import Reply from '../../assets/reply-fill.svg'

import { FC, memo, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from '../../hooks/hook';
import { Message1, StyleContextMenu } from '../../types/types';
import { addSelectedMessage, changeMessage, closeBar, isSendMessage, setReplyToMessage, setShowCheckbox } from '../../store/slices/appSlice';
import { messagesAPI } from '../../API/api';
import { CONTACTS } from '../../constants/constants';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';

const ANIMATION_DURATION = 190

type Props = {
    isOpen: boolean,
    isOwner: boolean,
    message: Message1
    closeContextMenu: (e: React.MouseEvent) => void,
    positionMenu: StyleContextMenu,
    isForwarder: boolean
}



const ContextMenu: FC<Props> = ({ closeContextMenu, isOwner, message, positionMenu, isForwarder }) => {

    const dispatch = useAppDispatch()
    const chat = useAppSelector(state => state.app.selectedChat)
    const isFavorites = useAppSelector(state => state.app.isFavorites)
    const isCallMessage = !!message?.callStatus
    const [animationOpen, setAnimationOpen] = useState(false)
    //const {t} = useTranslation()
    const {t} = useTypedTranslation()

    useEffect(() => {
        setAnimationOpen(true)
        return () => setAnimationOpen(false)
    }, []);

    const copyMessage = () => {
        navigator.clipboard.writeText(message.message);
    }

    const change = () => {
        dispatch(changeMessage(message))
    }

    const selectSeveral = () => {
        dispatch(setShowCheckbox(true))
    }

    const deleteMessage = () => {
        messagesAPI.deleteMessage(chat, message, isFavorites)
            .catch((error) => console.error("Ошибка при удалении сообщения:", error))
    }

    const forwardMessage = () => {
        dispatch(addSelectedMessage(message))
        dispatch(isSendMessage(true))
        dispatch(closeBar(CONTACTS))
    }

    const close = (e: React.MouseEvent) => {
        setAnimationOpen(false)
        setTimeout(() => closeContextMenu(e), ANIMATION_DURATION)
    }

    const replyToMessage = () => {
        dispatch(setReplyToMessage(message))
    }

    console.log('render contextmenu')

    return (
        <div
            className={classNames(styles.cover, { [styles.showContextMenu]: animationOpen })}
            onClick={close}
            onContextMenu={close}
        >
            <div style={positionMenu} 
                //className={styles.contextMenu}
                className={classNames(styles.contextMenu, { [styles.contextMenu_open]: animationOpen })}
                >
                <ul>
                    {chat?.channel ? 
                        isOwner ? <li onClick={replyToMessage}><Reply /><span>{t('answer')}</span></li> : null
                        :
                        <li onClick={replyToMessage}><Reply /><span>{t('answer')}</span></li>
                    }
                    {/* <li onClick={replyToMessage}><Reply /><span>{t('answer')}</span></li> */}
                    <li onClick={forwardMessage}><SendMessage /><span>{t('forward')}</span></li>
                    <li onClick={copyMessage}><Copy /><span>{t('copyText')}</span></li>
                    {isOwner && !isForwarder && !isCallMessage &&
                        <li onClick={change}><Change /><span>{t('change')}</span></li>
                    }
                    {/* <li onClick={deleteMessage}><Delete /><span>{t('delete')}</span></li> */}
                    {chat?.channel ? 
                        isOwner ? <li onClick={deleteMessage}><Delete /><span>{t('delete')}</span></li> : null
                        :
                        <li onClick={deleteMessage}><Delete /><span>{t('delete')}</span></li>
                    }
                    <li
                        onClick={selectSeveral}
                        className={classNames(styles.selectSeveral)}
                    >
                        <Select />
                        <span>{t('selectSeveral')}</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default ContextMenu