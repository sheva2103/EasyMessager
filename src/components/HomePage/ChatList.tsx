import { FC, useEffect, useMemo, useState } from "react";
import styles from './HomePage.module.scss'
import ChatInfo from "./ChatInfo";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { Chat } from "../../types/types";
import InputComponent from "../../InputComponent/InputComponent";
import { createObjectChannel, globalSearch } from "../../utils/utils";
import ChannelInfo from "./ChannelInfo";
import { setChat } from "../../store/slices/setChatIDSlice";
import { setSelectedChannel, setTempChat } from "../../store/slices/appSlice";
import { useChannelClickHandler } from "../../hooks/useHandleClickToChannel";
import DialogComponent, { ConfirmComponent, NotFoundChannel } from "../Settings/DialogComponent";
import { channelAPI, messagesAPI } from "../../API/api";

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
                    />
                );
            }
        })
    );
}

const TempChatComponent: FC = () => {
    const tempChat = useAppSelector(state => state.app.tempChat)
    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const dispatch = useAppDispatch()

    useEffect(() => {
        if (tempChat && selectedChat?.uid !== tempChat.uid) dispatch(setTempChat(null))
    }, [selectedChat]);

    return (
        <>{tempChat && <TempChat tempChat={tempChat} />}</>
    )
}

const TempChat: FC<{ tempChat: Chat | null }> = ({ tempChat }) => {
    const chatList = useAppSelector(state => state.app.chatsList)
    const dispatch = useAppDispatch()
    const currentUser = useAppSelector(state => state.app.currentUser)
    const [isNotAccess, setIsNotAccess] = useState(false)
    const [notFoundChannel, setNotFoundChannel] = useState(false)
    const isChannel = tempChat?.channel ? true : false
    const currentComponent = isChannel ? <ChannelInfo {...tempChat} /> : <ChatInfo {...tempChat} />
    const { handleClickToChannel } = useChannelClickHandler()

    const sendRequest = async () => {
        console.log('send a request')
        await channelAPI.applyForMembership(currentUser, tempChat.channel?.channelID)
        setIsNotAccess(false)
    }

    const unsubscribe = () => {
        messagesAPI.deleteChat(currentUser, createObjectChannel(tempChat.channel))
            .catch((err) => {
                console.log('Канал удалён', err)
                dispatch(setTempChat(null))
            })
            .finally(() => setNotFoundChannel(false))
    }

    useEffect(() => {
        if (tempChat) {
            console.log(tempChat)
            const isChatList = chatList.some((item) => item.uid === (isChannel ? tempChat.channel.channelID : tempChat.uid))
            isChannel ?
                // dispatch(setSelectedChannel(createObjectChannel(tempChat.channel)))
                handleClickToChannel({ isSelected: false, channel: tempChat.channel, currentUserID: currentUser.uid, setIsNotAccess })
                    .catch(() => setNotFoundChannel(true))
                :
                dispatch(setChat({ currentUserEmail: currentUser.email, guestInfo: tempChat }))
            if (isChatList) dispatch(setTempChat(null))
        }
    }, [tempChat, chatList]);

    if (isNotAccess) return (
        <DialogComponent onClose={setIsNotAccess} isOpen={isNotAccess}>
            <ConfirmComponent
                confirmFunc={sendRequest}
                handleClose={() => setIsNotAccess(false)}
                text="Это закрытое сообщество. Хотите подать заявку ?" />
        </DialogComponent>
    )

    if (notFoundChannel) return (
        <DialogComponent isOpen={notFoundChannel} onClose={unsubscribe}>
            <NotFoundChannel confirmFunc={unsubscribe} />
        </DialogComponent>
    )

    return (
        <>{currentComponent}</>
    )
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
                    <TempChatComponent />
                    {name.length ?
                        // globalSearchUsers.map((item: Chat) => (
                        //         <ChatInfo key={item.uid + 'global'}
                        //             {...item}
                        //             globalSearch
                        //         />
                        // )
                        // )
                        <ListComponent list={globalSearchUsers} />
                        :
                        // filterMyChats.map((item) => (
                        //     <ChatInfo key={item.uid}
                        //         {...item}
                        //     />
                        // ))
                        <ListComponent list={filterMyChats} />
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