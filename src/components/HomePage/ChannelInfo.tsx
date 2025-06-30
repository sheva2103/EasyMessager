import { FC, memo, useEffect, useState } from "react";
import styles from './HomePage.module.scss'
import Avatar from "../Avatar/Avatar";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { Chat, Message1, NoReadMessagesType, TypeChannel } from "../../types/types";
import { channelAPI, messagesAPI, profileAPI } from "../../API/api";
import classNames from "classnames";
import { createMessageList, createObjectChannel, getChatType } from "../../utils/utils";
import { doc, DocumentSnapshot, onSnapshot } from "firebase/firestore";
import { setMessages } from "../../store/slices/messagesSlice";
import { Badge } from "@mui/material";
import { setSelectedChannel, updateSelectedChannel } from "../../store/slices/appSlice";
import { db } from "../../firebase";
import { CHANNELS_INFO } from "../../constants/constants";
import ShowNameChat from "./ShowNameChat";
import DialogComponent, { NotFoundChannel } from "../Settings/DialogComponent";
import { setChat } from "../../store/slices/setChatIDSlice";



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
    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const currentUser = useAppSelector(state => state.app.currentUser)
    const dispatch = useAppDispatch()
    const isSelected = selectedChat?.channel?.channelID === updateChannel.channelID
    const handleClick = () => {
        // const chanelObj: Chat = { uid: updateChannel.channelID, displayName: updateChannel.displayName, email: updateChannel.owner.email, channel: updateChannel }
        if(!isSelected) {
            const chanelObj: Chat = createObjectChannel(updateChannel)
            dispatch(setSelectedChannel(chanelObj))
        }
    }
    const unsubscribe = () => {
        messagesAPI.deleteChat(currentUser, createObjectChannel(channel.channel))
            .catch((err) => console.log('Произошла ошибка', err))
            .finally(() => dispatch(setChat(null)))
    }

    useEffect(() => {
        const getInfo = async () => {
            try {
                const currentInfo = await channelAPI.getCurrentInfo(channel.channel.channelID)
                if (currentInfo) {
                    if('listOfSubscribers' in currentInfo) delete currentInfo.listOfSubscribers
                    setUpdateChannel(currentInfo)
                } else {
                    setNotFoundChannel(true)
                }
            } catch (error) {
                console.error('Error fetching current info:', error);
            } finally {
                setFetchingCurrentInfo(false);
            }
        }
        getInfo()

        // const unsubscribe = onSnapshot(doc(db, CHANNELS_INFO, channel.channel.channelID), async(doc: DocumentSnapshot<TypeChannel>) => {
        //     const data = doc.data()
        //     if (data) {
        //         if (data.dateOfChange !== updateChannel.dateOfChange) {
        //             await channelAPI.addChannelToChatlist(currentUserEmail, data)
        //         }
        //         setUpdateChannel(doc.data())
        //     }
        //     if (fetchingCurrentInfo) setFetchingCurrentInfo(false);
        // });
        // return () => unsubscribe()

    }, []);

    //обновлять информацию после добавления подписчиков

    useEffect(() => {
        let listenerChannelInfo: () => void
        if(isSelected) {
            listenerChannelInfo = onSnapshot(doc(db, CHANNELS_INFO, updateChannel.channelID), (doc: DocumentSnapshot<TypeChannel>) => {
                if(doc.data()) {
                    dispatch(updateSelectedChannel(doc.data()))
                }
            });
        }
        return () => {
            if(listenerChannelInfo) listenerChannelInfo()
        }
    }, [isSelected]);

    useEffect(() => {
        const channelObj: Chat = createObjectChannel(updateChannel)
        const reference = getChatType(false, channelObj);
        const unsubscribe = onSnapshot(reference, (doc: DocumentSnapshot<Message1[]>) => {
            const list = createMessageList(doc.data())
            setMessagesList({ messages: list, noRead: { quantity: 0, targetIndex: 0 } })
        });
        return () => unsubscribe();
    }, [updateChannel])

    useEffect(() => {
        if (isSelected) dispatch(setMessages(messages))
    }, [isSelected, messages]);

    if (fetchingCurrentInfo) return <Skeleton />

    if(notFoundChannel && isSelected) return (
        <DialogComponent isOpen={notFoundChannel} onClose={setNotFoundChannel}>
            <NotFoundChannel confirmFunc={unsubscribe}/>
        </DialogComponent>
    )

    return (
        <li className={styles.chatInfo} onClick={handleClick}>
            {isSelected &&
                <div className={styles.selected}></div>
            }
            {/* {isSelected ?
                <ShowAvatarInfo>
                    <Avatar url={updateChannel?.photoURL} name={updateChannel.displayName[0]} />
                </ShowAvatarInfo>
                :
                <Avatar url={updateChannel?.photoURL} name={updateChannel.displayName[0]} />
            } */}
            <Avatar url={updateChannel?.photoURL} name={updateChannel.displayName[0]} />
            <span className={styles.name}>{isSelected ? <ShowNameChat /> : updateChannel.displayName}</span>
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