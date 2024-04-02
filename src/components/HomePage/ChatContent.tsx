import { FC, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import styles from './HomePage.module.scss'
import classNames from "classnames";
import ArrowLeftIcon from '../../assets/box-arrow-left.svg'
import { selectChat, setShowCheckbox } from "../../store/slices/appSlice";
import ListMessages from "./ListMessage";
import InputNewMessage from "./InputNewMessage";
import BlockControl from "./BlockControl";
import UserManagementMenu from "./UserManagementMenu";

//showcheckbox перенести в редакс и решить проблемму с отображениеи чекбоксов после пересылки сообщения


const ChatContent: FC = () => {

    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const dispatch = useAppDispatch()
    const closeChat = () => {
        dispatch(selectChat(null))
    }
    //const [showCheckbox, setShowCheckbox] = useState(false)
    const showCheckbox = useAppSelector(state => state.app.showCheckbox)
    const selectSeveral = (e: React.MouseEvent<HTMLSpanElement>) => {
        //e.preventDefault()

        setShowCheckbox(true)
    }

    const deselect = () => {
        setShowCheckbox(false)
    }

    useEffect(() => {
        //setShowCheckbox(false)
        dispatch(setShowCheckbox(false))
    },[selectedChat])

    if (!selectedChat) {
        return (
            <div className={classNames(styles.contentContainer, { [styles.notSelected]: !selectedChat })}>
                <span>Выберите чат...</span>
            </div>
        )
    }

    return (
        <div className={classNames(styles.contentContainer, { [styles.showContent]: selectedChat })}>
            <div className={styles.header}>
                <header>
                    <div className={styles.closeIcon} onClick={closeChat}>
                        <ArrowLeftIcon fontSize={'2rem'} />
                    </div>
                    <div className={styles.contentHeader}>
                        <div className={styles.contentHeader__selectedChat}>
                            <span>{selectedChat.displayName}</span>
                        </div>
                        <div className={styles.menu}>
                            {showCheckbox &&
                                <BlockControl />
                            }
                            <UserManagementMenu />
                        </div>
                    </div>
                </header>
            </div>
            <div className={styles.chatWindow}>
                <main>
                    <ListMessages />
                    <InputNewMessage />
                </main>
            </div>
        </div>
    );
}

export default ChatContent;