import classNames from 'classnames';
import styles from './HomePage.module.scss'
import SendMessage from '../../assets/send-fill.svg'
import Copy from '../../assets/copy.svg'
import Delete from '../../assets/delete.svg'
import Select from '../../assets/check-all.svg'
import Change from '../../assets/change.svg'

import { FC } from "react";
import { useAppDispatch, useAppSelector } from '../../hooks/hook';
import { Message1, StyleContextMenu } from '../../types/types';
import { addSelectedMessage, changeMessage, closeBar, isSendMessage, setShowCheckbox } from '../../store/slices/appSlice';
import { messagesAPI } from '../../API/api';
import { useBlacList } from '../../hooks/useBlackList';
import { CONTACTS } from '../../constants/constants';


type Props = {
    isOpen: boolean,
    isOwner: boolean,
    message: Message1
    closeContextMenu: (e: React.MouseEvent) => void,
    positionMenu: StyleContextMenu
}



const ContextMenu: FC<Props> = ({ isOpen, closeContextMenu, isOwner, message, positionMenu }) => {

    const dispatch = useAppDispatch()
    const chatID = useAppSelector(state => state.app.selectedChat.chatID)

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
        messagesAPI.deleteMessage(chatID, message)
    }

    const forwardMessage = () => {
        dispatch(addSelectedMessage(message))
        dispatch(isSendMessage(true))
        dispatch(closeBar(CONTACTS))
    }

    const ban = useBlacList()
    console.log(ban)

    return (
        <div
            className={classNames(styles.cover, { [styles.showContextMenu]: isOpen })}
            onClick={closeContextMenu}
            onContextMenu={closeContextMenu}
        >
            <div style={positionMenu} className={styles.contextMenu}>
                <ul >
                    <li onClick={forwardMessage}><SendMessage /><span>Переслать</span></li>
                    <li onClick={copyMessage}><Copy /><span>Копировать текст</span></li>
                    {isOwner &&
                        <li onClick={change}><Change /><span>Изменить</span></li>
                    }
                    <li onClick={deleteMessage}><Delete /><span>Удалить</span></li>
                    <li
                        onClick={selectSeveral}
                        className={classNames(styles.selectSeveral)}
                    >
                        <Select />
                        <span>Выбрать несколько</span>
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default ContextMenu;