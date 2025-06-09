import { FC, useEffect, useMemo, useState } from "react";
import styles from './HomePage.module.scss'
import ChatInfo from "./ChatInfo";
import { searchAPI } from "../../API/api";
import { useAppSelector } from "../../hooks/hook";
import { Chat, TypeChannel } from "../../types/types";
import InputComponent from "../../InputComponent/InputComponent";
import { globalSearch } from "../../utils/utils";
import ChannelInfo from "./ChannelInfo";

const ListComponent: FC<{ list: Chat[] }> = ({ list }) => {
    return (
        list.map((item: Chat) => {
            if ("channel" in item) {
                return (
                    <ChannelInfo key={item.chatID + 'global'}
                        {...item}
                    />
                );
            } else {
                return (
                    <ChatInfo key={item.uid + 'global'}
                        {...item}
                        globalSearch
                    />
                );
            }
        })
    );
}



const ChatList: FC = () => {

    const [name, setName] = useState('')
    const [globalSearchUsers, setGlobalSearchUsers] = useState([])
    const myChats = useAppSelector(state => state.app.chatsList)
    const currentUserID = useAppSelector(state => state.app.currentUser.uid)


    useEffect(() => {
        if (name) {
            // searchAPI.searchUser(name)
            //     .then(chat => {
            //         const filterChat = chat.filter(item => item.uid !== currentUserID)
            //         setGlobalSearchUsers(filterChat)
            //     })
            // searchAPI.searchChannel(name).then(channels => console.log(channels))
            ///////////////////
            const fetchData = async () => {
                const response = await globalSearch(name, currentUserID)
                setGlobalSearchUsers(response)
            }
            fetchData()


            /////////////////////
        }
    }, [name]);

    const filterMyChats = useMemo(() => {
        if (!name) return [...myChats].filter(item => item.displayName?.includes(name))
    }, [name, myChats])

    return (
        <>
            <div className={styles.item}>
                <InputComponent classes={styles.blockInput} returnValue={setName} inputProps={{ maxLength: 16 }} isCleanIcon />
            </div>
            <div style={{ height: 'calc(100% - 102px)' }}>
                <ul className={styles.chatList}>
                    {name.length ?
                        // globalSearchUsers.map((item: Chat) => (
                        //         <ChatInfo key={item.uid + 'global'}
                        //             {...item}
                        //             globalSearch
                        //         />
                        // )
                        // )
                        <ListComponent list={globalSearchUsers}/>
                        :
                        // filterMyChats.map((item) => (
                        //     <ChatInfo key={item.uid}
                        //         {...item}
                        //     />
                        // ))
                        <ListComponent list={filterMyChats}/>
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