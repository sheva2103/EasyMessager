import { FC, useEffect, useState } from "react";
import styles from './HomePage.module.scss'
import ChatInfo from "./ChatInfo";
import { searchAPI } from "../../API/api";
import { DocumentSnapshot, doc, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { useAppSelector } from "../../hooks/hook";
import { Chat, CurrentUser } from "../../types/types";
import { createChatList } from "../../utils/utils";



// const chats: CurrentUser[] = [
//     { displayName: 'alexdb', photoURL: '', email: 'test@test.com', uid: 'uhrtugjfghdhc' },
//     { displayName: 'alexcbc55555555555555', photoURL: '', email: 'test1fg@test.com', uid: 'uhugjfgfghdhc' },
//     { displayName: 'alexvbcx', photoURL: '', email: 'test1cv@test.com', uid: 'uhugjfgcvhdhc' },
//     { displayName: 'alexfgdh', photoURL: '', email: 'test1nb@test.com', uid: 'uhugjfgbnhdhc' },
//     { displayName: 'alexzzzzc', photoURL: '', email: 'test1sd@test.com', uid: 'usdhugjfghdhc' },
//     { displayName: 'alexds', photoURL: '', email: 'test1io@test.com', uid: 'uhugjfghiodhc' },
//     { displayName: 'alexvxv', photoURL: '', email: 'test1ti@test.com', uid: 'uhugjfghdtihc' },
//     { displayName: 'alexbbbb', photoURL: '', email: 'test1hh@test.com', uid: 'uhugjfghdhhhc' },
//     { displayName: 'alexcvxv', photoURL: '', email: 'test1ddg@test.com', uid: 'uhudgdgjfghdhc' },
//     { displayName: 'alexxv', photoURL: '', email: 'test1jr@test.com', uid: 'uhugjfghdgdhjdhc' },
//     { displayName: 'alexzzzzs', photoURL: '', email: 'test1rw@test.com', uid: 'uhugjwqqfghdhc' },
//     { displayName: 'alexvvcvbbb', photoURL: '', email: 'test1dhhj@test.com', uid: 'uhugjddghfghdhc' },
//     { displayName: 'alexdgsd', photoURL: '', email: 'test1qqq@test.com', uid: 'uhuqqqgjfghdhc' },
//     { displayName: 'alexbbb', photoURL: '', email: 'test1fhfr@test.com', uid: 'uhugjfgjfghdhc' },
//     { displayName: 'test1', photoURL: '', email: 'test1dete@test.com', uid: 'uhuhjhggjfghdhc' },
// ]

const ChatList: FC = () => {

    const [name, setName] = useState('')
    const [globalSearchUsers, setGlobalSearchUsers] = useState([])
    //const [chats, setChats] = useState<Chat[]>([])
    const myChats = useAppSelector(state => state.app.chatsList)
    const currentUserEmail = useAppSelector(state => state.app.currentUser.email)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    useEffect(() => {
        searchAPI.searchUser(name)
            .then(chat => setGlobalSearchUsers([...chat]))
    }, [name]);

    // убрать этот uef. в апп уже добавляются чатлисты 
    // useEffect(() => {
    //     const chatsList = onSnapshot(doc(db, currentUser, 'chatList'), (doc: DocumentSnapshot<Chat[]>) => {
    //         //console.log("Current data: ", doc.data());
    //         const data = doc.data()
    //         if(data) {
    //             setChats(createChatList(data))
    //         }
    //     });
    //     return () => chatsList()
    // }, []);
    
    const filterMyChats = [...myChats].filter(item => item.displayName?.includes(name))

    return (
        <>
            <div className={styles.item}>
                <div className={styles.blockInput}>
                    <input type="text" value={name} onChange={handleChange} />
                </div>
            </div>
            <div style={{ height: 'calc(100% - 102px)' }}>
                <ul className={styles.chatList}>
                    {filterMyChats.map((item) => (
                        <ChatInfo key={item.uid}
                            {...item}
                        />
                    ))}
                    {Boolean(name.length) && <div className={styles.hr}/>}
                    {globalSearchUsers.map((item: Chat) => {
                        if(currentUserEmail !== item.email) return (
                            <ChatInfo key={item.uid + 'global'}
                                {...item}
                            />
                        )
                    })}
                    {filterMyChats.length === 0 && globalSearchUsers.length === 0 &&
                        <li className={styles.chatInfo}>Ничего не найдено</li>
                    }
                </ul>
            </div>
        </>
    );
}

export default ChatList;