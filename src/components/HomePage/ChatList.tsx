import { FC, useEffect, useState } from "react";
import styles from './HomePage.module.scss'
import ChatInfo from "./ChatInfo";
import { searchAPI } from "../../API/api";
import { useAppSelector } from "../../hooks/hook";
import { Chat } from "../../types/types";


const ChatList: FC = () => {

    const [name, setName] = useState('')
    const [globalSearchUsers, setGlobalSearchUsers] = useState([])
    const myChats = useAppSelector(state => state.app.chatsList)
    const currentUserEmail = useAppSelector(state => state.app.currentUser.email)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    useEffect(() => {
        searchAPI.searchUser(name)
            .then(chat => {
                setGlobalSearchUsers([...chat])
            })
    }, [name]);
    
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
                                globalSearch
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