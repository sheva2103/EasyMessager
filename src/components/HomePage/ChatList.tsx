import { FC, useEffect, useState } from "react";
import styles from './HomePage.module.scss'
import ChatInfo from "./ChatInfo";
import { searchAPI } from "../../API/api";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { useAppSelector } from "../../hooks/hook";



const chats = [
    { displayName: 'alexdb', photoURL: '' },
    { displayName: 'alexcbc55555555555555', photoURL: '' },
    { displayName: 'alexvbcx', photoURL: '' },
    { displayName: 'alexzzzzc', photoURL: '' },
    { displayName: 'alexfgdh', photoURL: '' },
    { displayName: 'alexds', photoURL: '' },
    { displayName: 'alexvxv', photoURL: '' },
    { displayName: 'alexbbbb', photoURL: '' },
    { displayName: 'alexcvxv', photoURL: '' },
    { displayName: 'alexxv', photoURL: '' },
    { displayName: 'alexzzzzs', photoURL: '' },
    { displayName: 'alexvvcvbbb', photoURL: '' },
    { displayName: 'alexdgsd', photoURL: '' },
    { displayName: 'alexbbb', photoURL: '' },
    { displayName: 'test1', photoURL: '' },
]

const ChatList: FC = () => {

    const [name, setName] = useState('')
    const [users, setUsers] = useState([])
    const currentUser = useAppSelector(state => state.app.currentUser.email)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    useEffect(() => {
        searchAPI.searchUser(name)
            .then(chat => setUsers([...chat]))
    }, [name]);

    useEffect(() => {
        const chatsList = onSnapshot(doc(db, currentUser, 'chatlist'), (doc) => {
            console.log("Current data: ", doc.data());
        });
        return () => chatsList()
    }, []);

    const filterChats = chats.filter(item => item.displayName.includes(name))
    const filter = [...filterChats, ...users]

    return (
        <>
            <div className={styles.item}>
                <div className={styles.blockInput}>
                    <input type="text" value={name} onChange={handleChange} />
                </div>
            </div>
            <div style={{ height: 'calc(100% - 102px)' }}>
                <ul className={styles.chatList}>
                    {filter.map((item, index) => (
                        <ChatInfo key={String(item.displayName + index)}
                            name={item.displayName}
                            url={item.photoURL} />
                    ))}
                    {filter.length === 0 &&
                        <li className={styles.chatInfo}>Ничего не найдено</li>
                    }
                </ul>
            </div>
        </>
    );
}

export default ChatList;