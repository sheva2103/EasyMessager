import styles from './HomePage.module.scss'
import { FC, useEffect, useState } from 'react';
import Message from './Messgae';
import { DocumentSnapshot, collection, doc, onSnapshot, query } from "firebase/firestore";
import { db } from '../../firebase';
import { Chat, Message1 } from '../../types/types';
import { createMessageList, getDatefromDate } from '../../utils/utils';
import GetDateMessage from './GetDateMessage';

const test = [
    { name: 'alex', url: '', id: 42154, message: 'Lorem, ipsum dolor sit amet consectetur adipisicing elit. Cumque fuga quas earum dolorum maxime unde vero dignissimos tenetur molestias sit! ' },
    { name: 'john', url: '', id: 42155, message: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!' },
    { name: 'john', url: '', id: 42156, message: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!' },
    { name: 'john', url: '', id: 42157, message: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae! Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!' },
    { name: 'alex', url: '', id: 421588, message: 'Lorem ipsum dolor sit repudiandae!' },
    { name: 'alex', url: '', id: 421547, message: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!' },
    { name: 'john', url: '', id: 421513, message: 'Lorem ipsum dolor https://reactdev.ru/libs/nextjs/basic/data-fetching/#getstaticprops sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!' },
    { name: 'john', url: '', id: 4215111, message: '45452223' },
    { name: 'john', url: '', id: 4215885, message: 'cv' },
    { name: 'alex', url: '', id: 42154568, message: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!' },
    { name: 'alex', url: '', id: 42156534, message: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae! Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae! Lorem ipsum dolor sit amet consectetur adipisicing elit. Suscipit quo inventore repudiandae!' },
    { name: 'john', url: '', id: 4215886, message: '54678' },
    { name: 'alex', url: '', id: 421554, message: '12154hhd' },
    { name: 'alex', url: '', id: 42153332, message: '45566 https://reactdev.ru/libs/nextjs/basic/data-fetching/#getstaticprops , привет друг ppppoo 45566 http://reactdev.ru/libs/nextjs/basic/data-fetching/#getstaticprops' },
]

type Props = {
    selectedChat: Chat
}

const ListMessages: FC<Props> = ({ selectedChat }) => {

    const [list, setList] = useState<Message1[]>([])

    useEffect(() => {
        const messages = onSnapshot(doc(db, "chats", selectedChat.chatID), (doc: DocumentSnapshot<Message1[]>) => {
            //console.log("Current data: ", doc.data());
            //console.log(createMessageList(doc.data()))
            setList(createMessageList(doc.data()))
        });
        return () => messages()
    }, [selectedChat.uid]);

    return (
        <div className={styles.listMessages}>
            <ul>
                {/* {list.map((item) => (
                    <Message messageInfo={item} key={item.messageID} />
                ))} */}
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

export default ListMessages;