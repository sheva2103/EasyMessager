import { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import styles from './HomePage.module.scss'
import classNames from "classnames";
import ArrowLeftIcon from '../../assets/box-arrow-left.svg'
//import { selectChat } from "../../store/slices/appSlice";
import ListMessages from "./ListMessage";
import InputNewMessage from "./InputNewMessage";
import Preloader from '../../assets/preloader.svg'
import { setChat } from "../../store/slices/setChatIDSlice";
import ChatMenu from "./ChatMenu";
import MessageInputField from "./MessageInputField";


const ChatContent: FC = () => {

    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const isLoadData = useAppSelector(state => state.app.loadChat)
    const dispatch = useAppDispatch()
    const closeChat = () => {
        //dispatch(selectChat(null))
        dispatch(setChat(null))
    }

    // if(isLoadData) {
    //     return (
    //         <div className={classNames(styles.contentContainer, { [styles.notSelected]: isLoadData })}>
    //             <Preloader fontSize={'2rem'}/>
    //         </div>
    //     )
    // }


    if (!selectedChat) {
        return (
            <div className={classNames(styles.contentContainer, { [styles.notSelected]: !selectedChat })}>
                {/* <span>Выберите чат...</span> */}
                {isLoadData ? <Preloader /> : <span>Выберите чат...</span>}
            </div>
        )
    }
    
    //console.log('chat content render')

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
                        <ChatMenu selectedChat={selectedChat}/>
                    </div>
                </header>
            </div>
            <div className={styles.chatWindow}>
                <main>
                    <ListMessages selectedChat={selectedChat}/>
                    {/* <InputNewMessage chatInfo={selectedChat} /> */}
                    <MessageInputField selectedChat={selectedChat} />
                </main>
            </div>
        </div>
    );
}

export default ChatContent;