import styles from './HomePage.module.scss'
import { FC, memo, useEffect, useRef, useState } from 'react';
import Message from './Messgae';
import { DocumentSnapshot, doc, onSnapshot } from "firebase/firestore";
import { db } from '../../firebase';
import { Chat, Message1 } from '../../types/types';
import { createMessageList, getDatefromDate } from '../../utils/utils';
import GetDateMessage from './GetDateMessage';
import { useAppDispatch, useAppSelector } from '../../hooks/hook';
import { setLoadChat } from '../../store/slices/appSlice';
import Preloader from '../../assets/preloader.svg'

type Props = {
    selectedChat: Chat
}

const ListMessages: FC<Props> = ({ selectedChat }) => {

    const [list, setList] = useState<Message1[]>([])
    const dispatch = useAppDispatch()
    const isLoadChat = useAppSelector(state => state.app.loadChat)
    const listRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const messages = onSnapshot(doc(db, "chats", selectedChat.chatID), (doc: DocumentSnapshot<Message1[]>) => {
            setList(createMessageList(doc.data()))
            if (isLoadChat) dispatch(setLoadChat())
        });
        return () => messages()
    }, [selectedChat.uid]);

    useEffect(() => {

        listRef.current?.addEventListener('scroll', (e) => {
            const scrollValue = listRef.current.scrollTop
            const listHeight = listRef.current.scrollHeight
            const viewportHeight = listRef.current.clientHeight
            const height = listHeight - viewportHeight
            const scrollPercent = (scrollValue / height) * 100
            console.log(scrollPercent)
        })

    }, [listRef.current]);

    if (isLoadChat) return (
        <div className={styles.contentContainer}>
            <div className={styles.preloaderBlock}>
                <Preloader fontSize={'2.4rem'} />
            </div>
        </div>
    )

    return (
        <div className={styles.listMessages} ref={listRef}>
            <ul>
                {list.map((item, index) => {
                    if (index !== 0 && getDatefromDate(item.date) === getDatefromDate(list[index - 1].date)) {
                        return <Message messageInfo={item} key={item.messageID} />
                    }
                    return <div key={item.messageID}>
                        <GetDateMessage date={item.date} />
                        <Message messageInfo={item} key={item.messageID} />
                    </div>
                })}
            </ul>
        </div>
    );
}

export default memo(ListMessages);