import { FC } from "react";
import ChatInfo from "./ChatInfo";
import styles from './HomePage.module.scss'

const chats = [
    {name: 'alexdb', url: ''},
    {name: 'alexcbc', url: ''},
    {name: 'alexvbcx', url: ''},
    {name: 'alexzzzzc', url: ''},
    {name: 'alexfgdh', url: ''},
    {name: 'alexds', url: ''},
    {name: 'alexvxv', url: ''},
    {name: 'alexbbbb', url: ''},
    {name: 'alexcvxv', url: ''},
    {name: 'alexxv', url: ''},
    {name: 'alexzzzzs', url: ''},
    {name: 'alexvvcvbbb', url: ''},
    {name: 'alexdgsd', url: ''},
    {name: 'alexbbb', url: ''},
]


const ChatList: FC = () => {
    return (  
        <ul className={styles.chatList}>
            {chats.map((item, index) => (
                <ChatInfo key={String(item.name + index)}
                            name={item.name} 
                            url={item.url}/>
            ))}
        </ul>
    );
}

export default ChatList;