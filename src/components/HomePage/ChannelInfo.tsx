import { FC, memo, useEffect, useState } from "react";
import styles from './HomePage.module.scss'
import Avatar from "../Avatar/Avatar";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { Chat, Message1, NoReadMessagesType, TypeChannel } from "../../types/types";
import { setChat } from "../../store/slices/setChatIDSlice";
import { channelAPI, messagesAPI, profileAPI } from "../../API/api";
import classNames from "classnames";
import { createMessageList, getChatType, getQuantityNoReadMessages } from "../../utils/utils";
import { DocumentSnapshot, onSnapshot } from "firebase/firestore";
import { setMessages } from "../../store/slices/messagesSlice";
import { Badge } from "@mui/material";
import { setSelectedChannel } from "../../store/slices/appSlice";



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
    const [fetchingCurrentInfo, setFetchingCurrentInfo] = useState(true)
    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const dispatch = useAppDispatch()
    const handleClick = () => {
        const chanelObj: Chat = {uid: updateChannel.channelID, displayName: updateChannel.displayName, email: updateChannel.owner.email, channel: updateChannel}
        dispatch(setSelectedChannel(chanelObj))
    }
    const isSelected = selectedChat?.channel?.channelID === updateChannel.channelID

    useEffect(() => {
        //setFetchingCurrentInfo(true);
        const getInfo = async () => {
            try {
                const currentInfo = await channelAPI.getCurrentInfo(channel.channel.channelID)
                if (currentInfo) {
                    if('listOfSubscribers' in currentInfo) delete currentInfo.listOfSubscribers
                    setUpdateChannel(currentInfo)
                }
            } catch (error) {
                console.error('Error fetching current info:', error);
            } finally {
                setFetchingCurrentInfo(false);
            }
        }
        getInfo()
    }, []);

    //обновлять информацию после добавления подписчиков

    useEffect(() => {
        const channelObj: Chat = {uid: updateChannel.channelID, displayName: updateChannel.displayName, email: updateChannel.owner.email, channel: updateChannel} 
        const reference = getChatType(false, channelObj);
        const unsubscribe = onSnapshot(reference, (doc: DocumentSnapshot<Message1[]>) => {
            const list = createMessageList(doc.data())
            //const noRead = getQuantityNoReadMessages(list, currentUser.uid)
            setMessagesList({ messages: list, noRead: { quantity: 0, targetIndex: 0 } })
        });
        return () => unsubscribe();
    }, [updateChannel])

    // useEffect(() => {
    //     if (selectedChat?.uid === updateUser.uid) dispatch(setMessages(messages))
    // }, [messages, selectedChat]);

    useEffect(() => {
        if(isSelected) dispatch(setMessages(messages))
    }, [isSelected, messages]);

    if (fetchingCurrentInfo) return <Skeleton />

    return (
        <li className={styles.chatInfo} onClick={handleClick}>
            {isSelected &&
                <div className={styles.selected}></div>
            }
            <Avatar url={updateChannel?.photoURL} name={updateChannel.displayName[0]} />
            <span className={styles.name}>{updateChannel.displayName}</span>
            <div className={styles.chatInfo__noRead}>
                <Badge badgeContent={messages.noRead.quantity} color="primary" />
            </div>

        </li>
    );
}

function checkProps(prevProps: Props, nextProps: Props): boolean {
    return prevProps.displayName === nextProps.displayName
}
export default memo(ChannelInfo, checkProps);