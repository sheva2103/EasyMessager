import { FC, memo, useEffect, useState } from "react";
import styles from './HomePage.module.scss'
import Avatar from "../Avatar/Avatar";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { Chat, Message1, NoReadMessagesType, TypeChannel } from "../../types/types";
import { channelAPI, messagesAPI, profileAPI } from "../../API/api";
import classNames from "classnames";
import { createMessageList, createObjectChannel, getChatType } from "../../utils/utils";
import { doc, DocumentSnapshot, onSnapshot, QuerySnapshot } from "firebase/firestore";
import { setMessages } from "../../store/slices/messagesSlice";
import { Badge } from "@mui/material";
import { setSelectedChannel, updateSelectedChannel } from "../../store/slices/appSlice";
import { db } from "../../firebase";
import { CHANNELS_INFO } from "../../constants/constants";
import ShowNameChat from "./ShowNameChat";
import DialogComponent, { ConfirmComponent, NotFoundChat } from "../Settings/DialogComponent";
import { setChat } from "../../store/slices/setChatIDSlice";
import { useChannelClickHandler } from "../../hooks/useHandleClickToChannel";
import { PreviewLastMessage } from "./ChatInfo";



interface Props extends Chat {
    globalSearch?: boolean
}


const Skeleton: FC = () => {

    return (
        <li className={classNames(styles.chatInfo, styles.skeleton)}>
            <div className={styles.skeleton__Avatar} />
            <div className={styles.skeleton__Name} />
        </li>
    )
}

const ChannelInfo: FC<Props> = (channel) => {

    const [updateChannel, setUpdateChannel] = useState<TypeChannel>({ ...channel.channel })
    const [messages, setMessagesList] = useState<{ messages: Message1[], noRead: NoReadMessagesType }>({ messages: [], noRead: { quantity: 0, targetIndex: 0 } })
    const [notFoundChannel, setNotFoundChannel] = useState(false)
    const [fetchingCurrentInfo, setFetchingCurrentInfo] = useState(true)
    const [isNotAccess, setIsNotAccess] = useState(false)
    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const currentUser = useAppSelector(state => state.app.currentUser)
    const dispatch = useAppDispatch()
    const isSelected = selectedChat?.channel?.channelID === updateChannel.channelID
    const lastMessage = messages.messages[messages.messages.length - 1]
    const { handleClickToChannel } = useChannelClickHandler({ isSelected, channel: channel.channel, currentUserID: currentUser.uid, setIsNotAccess, setNotFoundChannel });

    const unsubscribe = () => {
        messagesAPI.deleteChat(currentUser, createObjectChannel(channel.channel))
            .catch((err) => console.log('Произошла ошибка', err))
            .finally(() => {
                dispatch(setChat(null))
                setNotFoundChannel(false)
            })
    }

    const sendRequest = async () => {
        console.log('send a request')
        await channelAPI.applyForMembership(currentUser, updateChannel.channelID)
        setIsNotAccess(false)
    }

    useEffect(() => {
        const getInfo = async () => {
            try {
                const currentInfo = await channelAPI.getCurrentInfo(channel.channel.channelID)
                if (currentInfo) {
                    setUpdateChannel(currentInfo)
                }
            } catch (error) {
                console.error('Error fetching current info:', error);
            } finally {
                setFetchingCurrentInfo(false);
            }
        }
        getInfo()

    }, [isSelected]);

    useEffect(() => {
        let listenerChannelInfo: () => void
            listenerChannelInfo = onSnapshot(doc(db, CHANNELS_INFO, updateChannel.channelID), async (doc: DocumentSnapshot<TypeChannel>) => {
                if (doc.data()) {
                    const currentInfoChannel = doc.data()
                    const isSubscriber = currentInfoChannel.listOfSubscribers.some(item => item.uid === currentUser.uid)
                    if (isSubscriber && currentInfoChannel.dateOfChange !== channel.dateOfChange) {
                        const toChat = createObjectChannel(currentInfoChannel)
                        await channelAPI.updateChannelInMyChatList(currentUser.email, toChat)
                    }
                    dispatch(updateSelectedChannel({ ...currentInfoChannel, owner: updateChannel.owner }))
                } else (
                    setNotFoundChannel(true)
                )
            })
        return () => {
            if (listenerChannelInfo) listenerChannelInfo()
        }
    }, [isSelected, channel, updateChannel]);

    // useEffect(() => {
    //     const channelObj: Chat = createObjectChannel(updateChannel)
    //     const reference = getChatType(false, channelObj);
    //     const unsubscribe = onSnapshot(reference, (doc: DocumentSnapshot<Message1[]>) => {
    //         const list = createMessageList(doc.data())
    //         setMessagesList({ messages: list, noRead: { quantity: 0, targetIndex: list.length } })
    //     });
    //     return () => unsubscribe();
    // }, [updateChannel])

    useEffect(() => {
        const channelObj: Chat = createObjectChannel(updateChannel);
        const messagesCollectionRef = getChatType(false, channelObj)
        const unsubscribe = onSnapshot(messagesCollectionRef, (querySnapshot: QuerySnapshot<Message1>) => {

            // 3. Итерируем по документам, чтобы собрать список сообщений
            const tempList = querySnapshot.docs.map(doc => doc.data())
                const list = createMessageList(tempList)
            // Примечание: Если вам нужно сохранить старую логику createMessageList
            // const list = createMessageList(querySnapshot.docs.map(doc => doc.data())); 
            // Но это не рекомендуется, так как вы теряете ID документа.

            // 4. Обновляем состояние
            setMessagesList({
                messages: list,
                noRead: { quantity: 0, targetIndex: list.length }
            });
        });

        // 5. Функция очистки
        return () => unsubscribe();

    }, [updateChannel]);

    useEffect(() => {
        if (isSelected) dispatch(setMessages(messages))
    }, [isSelected, messages]);

    if (fetchingCurrentInfo) return <Skeleton />

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
            <NotFoundChat confirmFunc={unsubscribe} />
        </DialogComponent>
    )

    return (
        <li className={styles.chatInfo} onClick={handleClickToChannel}>
            {isSelected &&
                <div className={styles.selected}></div>
            }
            <Avatar url={updateChannel?.photoURL} name={updateChannel.displayName[0]} />
            <div className={styles.nameBlock}>
                <div className={styles.name}>
                    <span className={styles.name}>{isSelected ? <ShowNameChat /> : updateChannel.displayName}</span>
                </div>
                <PreviewLastMessage message={lastMessage} currentUserId={currentUser.uid} />
            </div>
            {/* <span className={styles.name}>{isSelected ? <ShowNameChat /> : updateChannel.displayName}</span> */}
            <div className={styles.chatInfo__noRead}>
                <Badge badgeContent={messages.noRead.quantity} color="primary" />
            </div>

        </li>
    );
}

function checkProps(prevProps: Props, nextProps: Props): boolean {
    return prevProps.displayName === nextProps.displayName && prevProps.photoURL === nextProps.photoURL
}
export default memo(ChannelInfo, checkProps);