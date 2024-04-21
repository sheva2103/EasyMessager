import styles from './HomePage.module.scss'
import { FC, memo, useEffect, useState } from 'react';
import Message from './Messgae';
import { DocumentSnapshot, collection, doc, onSnapshot, query } from "firebase/firestore";
import { db } from '../../firebase';
import { Chat, Message1 } from '../../types/types';
import { createMessageList, getDatefromDate } from '../../utils/utils';
import GetDateMessage from './GetDateMessage';

type Props = {
    selectedChat: Chat
}

const ListMessages: FC<Props> = ({ selectedChat }) => {

    const [list, setList] = useState<Message1[]>([])

    useEffect(() => {
        const messages = onSnapshot(doc(db, "chats", selectedChat.chatID), (doc: DocumentSnapshot<Message1[]>) => {
            setList(createMessageList(doc.data()))
        });
        return () => messages()
    }, [selectedChat.uid]);

    //console.log('list messages render')

    return (
        <div className={styles.listMessages}>
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