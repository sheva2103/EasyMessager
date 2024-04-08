import { FC, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import styles from './HomePage.module.scss'
import classNames from "classnames";
import ArrowLeftIcon from '../../assets/box-arrow-left.svg'
import { selectChat } from "../../store/slices/appSlice";
import ListMessages from "./ListMessage";
import InputNewMessage from "./InputNewMessage";
import BlockControl from "./BlockControl";
import UserManagementMenu from "./UserManagementMenu";
import Preloader from '../../assets/preloader.svg'


const ChatContent: FC = () => {

    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const isLoadData = useAppSelector(state => state.app.loadChat)
    const dispatch = useAppDispatch()
    const closeChat = () => {
        dispatch(selectChat(null))
    }
    const showCheckbox = useAppSelector(state => state.app.showCheckbox)

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
                    <InputNewMessage chatID={selectedChat.chatID} />
                </main>
            </div>
        </div>
    );
}

export default ChatContent;