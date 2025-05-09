import { FC, useEffect, useMemo, useState } from "react";
import styles from './HomePage.module.scss'
import ChatInfo from "./ChatInfo";
import { searchAPI } from "../../API/api";
import { useAppSelector } from "../../hooks/hook";
import { Chat } from "../../types/types";
import { useDebounce } from "use-debounce";
import InputComponent from "../../InputComponent/InputComponent";


const ChatList: FC = () => {

    const [name, setName] = useState('')
    const [globalSearchUsers, setGlobalSearchUsers] = useState([])
    const myChats = useAppSelector(state => state.app.chatsList)
    const currentUserID = useAppSelector(state => state.app.currentUser.uid)
    //const [debouncedText] = useDebounce(name, 1000);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    // useEffect(() => {
    //     if (debouncedText) {
    //         searchAPI.searchUser(name)
    //             .then(chat => {
    //                 setGlobalSearchUsers([...chat])
    //             })
    //     }
    // }, [debouncedText]);

    useEffect(() => {
        if(name) {
            searchAPI.searchUser(name)
                .then(chat => {
                    const filterChat = chat.filter(item => item.uid !== currentUserID)
                    setGlobalSearchUsers(filterChat)
                })
        }
    }, [name]);

    const filterMyChats = useMemo(() => {
        if(!name) return [...myChats].filter(item => item.displayName?.includes(name))
    }, [name, myChats])

    console.log('rerender !!!!!!!!!!!!!!1')

    return (
        <>
            <div className={styles.item}>
                <InputComponent classes={styles.blockInput} returnValue={setName} inputProps={{maxLength: 16}} isCleanIcon/>
                {/* <div className={styles.blockInput} style={{position: 'relative'}}>
                    <input type="text" value={name} onChange={handleChange} />
                    <div style={{position: 'absolute', right: '10px', top: '10px'}}>x</div>
                </div> */}
            </div>
            <div style={{ height: 'calc(100% - 102px)' }}>
                <ul className={styles.chatList}>
                    {name.length ?
                        globalSearchUsers.map((item: Chat) => (
                                <ChatInfo key={item.uid + 'global'}
                                    {...item}
                                    globalSearch
                                />
                        )
                        )
                        :
                        filterMyChats.map((item) => (
                            <ChatInfo key={item.uid}
                                {...item}
                            />
                        ))
                    }
                    {name && globalSearchUsers.length === 0 &&
                        <li className={styles.chatInfo}>Ничего не найдено</li>
                    }
                </ul>
            </div>
        </>
    );
}

export default ChatList;