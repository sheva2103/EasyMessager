import { FC, memo, useEffect, useState } from "react";
import styles from './HomePage.module.scss'
import Avatar from "../Avatar/Avatar";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { Chat, MessageType, TypeChannel, TypeChannelBackend } from "../../types/types";
import { channelAPI, messagesAPI } from "../../API/api";
import classNames from "classnames";
import { convertBackChannelToClient, createObjectChannel, getChatType } from "../../utils/utils";
import { doc, DocumentSnapshot, onSnapshot, orderBy, query, QuerySnapshot } from "firebase/firestore";
import { setMessages } from "../../store/slices/messagesSlice";
import { Alert, Snackbar } from "@mui/material";
import { updateSelectedChannel } from "../../store/slices/appSlice";
import { db } from "../../firebase";
import ShowNameChat from "./ShowNameChat";
import DialogComponent, { ConfirmComponent, NotFoundChat } from "../Settings/DialogComponent";
import { outChat, setChat } from "../../store/slices/setChatIDSlice";
import { useChannelClickHandler } from "../../hooks/useHandleClickToChannel";
import { PreviewLastMessage } from "./ChatInfo";
import { useTypedTranslation } from "../../hooks/useTypedTranslation";
import { firebasePath } from "../../constants/constants";



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
    const [notFoundChannel, setNotFoundChannel] = useState(false)
    const [fetchingCurrentInfo, setFetchingCurrentInfo] = useState(true)
    const [isNotAccess, setIsNotAccess] = useState(false)
    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const currentUser = useAppSelector(state => state.app.currentUser)
    const { t } = useTypedTranslation()
    const dispatch = useAppDispatch()
    const isSelected = selectedChat?.channel?.channelID === updateChannel.channelID
    const { handleClickToChannel } = useChannelClickHandler({ isSelected, channel: updateChannel, currentUserID: currentUser.uid, setIsNotAccess, setNotFoundChannel });

    const unsubscribe = () => {
        messagesAPI.deleteChat(currentUser, createObjectChannel(channel.channel))
            .catch((err) => console.log('Произошла ошибка', err))
            .finally(() => {
                dispatch(setChat(null))
                setNotFoundChannel(false)
            })
    }

    const sendRequest = async () => {
        await channelAPI.applyForMembership(currentUser, updateChannel.channelID)
        setIsNotAccess(false)
    }

    useEffect(() => {
        let listenerChannelInfo = onSnapshot(doc(db, firebasePath.CHANNELS_INFO, channel.channel.channelID), async (doc: DocumentSnapshot<TypeChannelBackend>) => {
            if (doc.data()) {
                const currentInfoChannel = convertBackChannelToClient(doc.data())
                const isSubscriber = currentInfoChannel.listOfSubscribers.some(item => item.uid === currentUser.uid)

                if (!isSubscriber && !currentInfoChannel.isOpen && isSelected) {
                    dispatch(outChat())
                    return
                }
                if (isSubscriber && currentInfoChannel.dateOfChange !== channel.dateOfChange) {
                    const toChat = createObjectChannel(currentInfoChannel)
                    await channelAPI.updateChannelInMyChatList(currentUser.email, toChat)
                }
                if (isSelected) dispatch(updateSelectedChannel({ ...currentInfoChannel, owner: updateChannel.owner }))
                setUpdateChannel(currentInfoChannel)
            }
            if (fetchingCurrentInfo) setFetchingCurrentInfo(false)
        })

        return () => listenerChannelInfo()
    }, [isSelected, channel]);


    if (fetchingCurrentInfo) return <Skeleton />

    if (isNotAccess) return (
        <DialogComponent onClose={setIsNotAccess} isOpen={isNotAccess}>
            <ConfirmComponent
                confirmFunc={sendRequest}
                handleClose={() => setIsNotAccess(false)}
                text={t('closedCommunityMessage')} />
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
                <PreviewLastMessage message={updateChannel?.lastMessage} currentUserId={currentUser.uid} />
            </div>
            {/* <div className={styles.chatInfo__noRead}>
                <Badge badgeContent={messages.noRead.quantity} color="primary" />
            </div> */}
        </li>
    );
}

function checkProps(prevProps: Props, nextProps: Props): boolean {
    return prevProps.displayName === nextProps.displayName && prevProps.photoURL === nextProps.photoURL
}
export default memo(ChannelInfo, checkProps);