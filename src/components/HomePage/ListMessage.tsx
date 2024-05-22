import styles from './HomePage.module.scss'
import { FC, memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
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

    const scrollListener = () => {
        const scrollValue = listRef.current.scrollTop
        const listHeight = listRef.current.scrollHeight
        const viewportHeight = listRef.current.clientHeight
        const height = listHeight - viewportHeight
        const scrollPercent = (scrollValue / height) * 100
        console.log(Math.ceil(scrollPercent))
    }

    useEffect(() => {
        if (list.length) setList([])
        const messages = onSnapshot(doc(db, "chats", selectedChat.chatID), (doc: DocumentSnapshot<Message1[]>) => {
            setList(createMessageList(doc.data()))
            if (isLoadChat) dispatch(setLoadChat(false))
        });
        return () => messages()
    }, [selectedChat.uid]);

    useLayoutEffect(() => {
        listRef.current?.addEventListener('scroll', scrollListener)
        return () => {
            console.log('снимаю слушатель с >', listRef.current)
            listRef.current.removeEventListener('scroll', scrollListener)
        }
    }, []);

    // if (isLoadChat) return (
    //     <div className={styles.contentContainer}>
    //         <div className={styles.preloaderBlock}>
    //             <Preloader fontSize={'2.4rem'} />
    //         </div>
    //     </div>
    // )

    //console.log('render list messages')

    return (
        <div className={styles.listMessages} ref={listRef}>
            {isLoadChat ?
                <div className={styles.contentContainer}>
                    <div className={styles.preloaderBlock}>
                        <Preloader fontSize={'2.4rem'} />
                    </div>
                </div>
                :
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
                </ul>}
        </div>
    );
}

export default memo(ListMessages);