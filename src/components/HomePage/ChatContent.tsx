import { FC } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import styles from './HomePage.module.scss'
import classNames from "classnames";
import ArrowLeftIcon from '../../assets/box-arrow-left.svg'
import { selectChat } from "../../store/slices/appSlice";
import ListMessages from "./ListMessage";
import InputNewMessage from "./InputNewMessage";


const ChatContent: FC = () => {

    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const dispatch = useAppDispatch()
    const closeChat = () => {
        dispatch(selectChat(null))
    }

    if (!selectedChat) {
        return (
            <div className={classNames(styles.contentContainer, { [styles.notSelected]: !selectedChat })}>
                <span>Выберите чат...</span>
            </div>
        )
    }

    return (
        <div className={classNames(styles.contentContainer, { [styles.showContent]: selectedChat })}>
            <div>
                <header>
                    <div className={styles.closeIcon} onClick={closeChat}>
                        <ArrowLeftIcon fontSize={'1.2rem'} />
                    </div>
                    <div className={styles.contentHeader}>
                        <div>{selectedChat}</div>
                        <div>menu</div>
                    </div>
                </header>
            </div>
            <div>
                <main className={styles.contentMain}>
                    <ListMessages />
                    <InputNewMessage />
                </main>
            </div>
        </div>
    );
}

export default ChatContent;