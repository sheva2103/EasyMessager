import { FC, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import styles from './HomePage.module.scss'
import classNames from "classnames";
import ArrowLeftIcon from '../../assets/box-arrow-left.svg'
import { selectChat } from "../../store/slices/appSlice";
import ListMessages from "./ListMessage";
import InputNewMessage from "./InputNewMessage";
import BlockControl from "./BlockControl";


const ChatContent: FC = () => {

    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const dispatch = useAppDispatch()
    const closeChat = () => {
        dispatch(selectChat(null))
    }
    const [showCheckbox, setShowCheckbox] = useState(false)
    const selectSeveral = (e: React.MouseEvent<HTMLSpanElement>) => {
        //e.preventDefault()

        setShowCheckbox(true)
    }

    const deselect = () => {
        setShowCheckbox(false)
    }

    useEffect(() => {
        setShowCheckbox(false)
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
                        <ArrowLeftIcon fontSize={'1.2rem'} />
                    </div>
                    <div className={styles.contentHeader}>
                        <div>
                            <span>{selectedChat}</span>
                        </div>
                        <div className={styles.menu}>
                            {showCheckbox &&
                                <BlockControl deselect={deselect}/>
                            }
                            <div>...</div>
                        </div>
                    </div>
                </header>
            </div>
            <div className={styles.chatWindow}>
                <main>
                    <ListMessages selectSeveral={selectSeveral} showCheckbox={showCheckbox} />
                    <InputNewMessage />
                </main>
            </div>
        </div>
    );
}

export default ChatContent;