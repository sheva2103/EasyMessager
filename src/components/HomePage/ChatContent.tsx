import { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import styles from './HomePage.module.scss'
import classNames from "classnames";
import ArrowLeftIcon from '../../assets/box-arrow-left.svg'
import ListMessages from "./ListMessage";
import { setChat } from "../../store/slices/setChatIDSlice";
import ChatMenu from "./ChatMenu";
import MessageInputField from "./MessageInputField";
import Preloader from '../../assets/preloader.svg'
import { Chat } from "../../types/types";

const LoadChatComponent: FC = () => {

    const isLoad = useAppSelector(state => state.app.loadChat)

    return (
        <div className={styles.contentContainer} style={{ position: 'absolute', display: isLoad ? 'block' : 'none' }}>
            <div className={styles.preloaderBlock}>
                <Preloader fontSize={'2.4rem'} />
            </div>
        </div>
    )
}

const HeaderChat: FC<{selectedChat: Chat}> = ({selectedChat}) => {

    const isFavorites = useAppSelector(state => state.app.isFavorites)
    const dispatch = useAppDispatch()
    const closeChat = () => {
        dispatch(setChat(null))
    }

    return (
        <header>
            <div className={styles.closeIcon} onClick={closeChat}>
                <ArrowLeftIcon fontSize={'2rem'} />
            </div>
            <div className={styles.contentHeader}>
                <div className={styles.contentHeader__selectedChat}>
                    <span>{!isFavorites ? selectedChat.displayName : 'Избранное'}</span>
                </div>
                <ChatMenu selectedChat={selectedChat} />
            </div>
        </header>
    )
}


const ChatContent: FC = () => {

    const selectedChat = useAppSelector(state => state.app.selectedChat)

    if (!selectedChat) {
        return (
            <div className={classNames(styles.contentContainer, { [styles.notSelected]: !selectedChat })}>
                <span>Выберите чат...</span>
            </div>
        )
    }

    console.log('chat content render')


    return (
        <div className={classNames(styles.contentContainer, { [styles.showContent]: selectedChat })}>
            <LoadChatComponent />
            <div className={styles.header}>
                <HeaderChat selectedChat={selectedChat}/>
            </div>
            <div className={styles.chatWindow}>
                <main>
                    <ListMessages selectedChat={selectedChat} />
                    <MessageInputField selectedChat={selectedChat} />
                </main>
            </div>
        </div>
    );
}

export default ChatContent;