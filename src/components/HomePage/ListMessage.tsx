import styles from './HomePage.module.scss'
import { FC, memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Message from './Messgae';
import { DocumentSnapshot, doc, onSnapshot } from "firebase/firestore";
import { db } from '../../firebase';
import { Chat, Message1 } from '../../types/types';
import { createMessageList, createNewDate, getDatefromDate } from '../../utils/utils';
import GetDateMessage from './GetDateMessage';
import { useAppDispatch, useAppSelector } from '../../hooks/hook';
import { setLoadChat } from '../../store/slices/appSlice';
import Preloader from '../../assets/preloader.svg'

type Props = {
    selectedChat: Chat
}

type List = {
    all: Message1[],
    limit: Message1[]
}

const ListMessages: FC<Props> = ({ selectedChat }) => {

    const [list, setList] = useState<List>({all: [], limit: []})
    const dispatch = useAppDispatch()
    const isLoadChat = useAppSelector(state => state.app.loadChat)
    const listRef = useRef<HTMLDivElement>(null)
    const [firstRender, setFirstRender] = useState(true)
    const moreMessage = list.all.length && list.limit.length && list.all[list.all.length - 1].messageID !== list.limit[list.limit.length - 1].messageID

    //сделать чтоб не показывалось загрузка после добавления сообщения

    const scrollListener = () => {
        const scrollValue = listRef.current.scrollTop
        const listHeight = listRef.current.scrollHeight
        const viewportHeight = listRef.current.clientHeight
        const height = listHeight - viewportHeight
        const scrollPercent = (scrollValue / height) * 100
        if(Math.ceil(scrollPercent) === 100) {
            if(moreMessage) {
                setList(prev => {
                    const lastIndex = prev.all.findIndex(item => item.messageID === prev.limit[prev.limit.length - 1].messageID)
                    const newLimit = prev.all.slice(lastIndex + 1, lastIndex + 50)
                    return {all: prev.all, limit: [...prev.limit, ...newLimit]}
                })
            }
        }
    }

    useEffect(() => {
        if (list.all.length) setList({all: [], limit: []})
        if(!firstRender) setFirstRender(true)
        const messages = onSnapshot(doc(db, "chats", selectedChat.chatID), (doc: DocumentSnapshot<Message1[]>) => {
            //setList(createMessageList(doc.data()))
            setList((prev) => {
                const all = createMessageList(doc.data())
                return {all, limit: prev.limit}
            })
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
    }, [list]);

    ///////////////////////////для авто прокрутки

    useEffect(() => {
        if(firstRender && list.all.length) {
            setList((prev) => ({all: prev.all, limit: prev.all.slice(0, 50)}))
            setFirstRender(false)
        }
    }, [list.all]);

    //////////////////////////////
    console.log('render list messages')

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
                    {list.limit.map((item, index) => {
                        if (index !== 0 && getDatefromDate(createNewDate(item.date)) === getDatefromDate(createNewDate(list.limit[index - 1].date))) {
                            return <Message messageInfo={item} key={item.messageID} />
                        }
                        return <div key={item.messageID}>
                            <GetDateMessage date={item.date} />
                            <Message messageInfo={item} key={item.messageID} />
                        </div>
                    })}
                </ul>}
                {moreMessage && 
                    <div style={{textAlign: 'center'}}>
                        <span>Загружаю...</span>
                    </div>
                }
        </div>
    );
}



export default memo(ListMessages);