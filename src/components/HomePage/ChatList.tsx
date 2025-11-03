import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from './HomePage.module.scss'
import ChatInfo from "./ChatInfo";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { Chat } from "../../types/types";
import InputComponent from "../../InputComponent/InputComponent";
import { createObjectChannel, globalSearch } from "../../utils/utils";
import ChannelInfo from "./ChannelInfo";
import { setChat } from "../../store/slices/setChatIDSlice";
import { setTempChat } from "../../store/slices/appSlice";
import { useChannelClickHandler } from "../../hooks/useHandleClickToChannel";
import DialogComponent, { ConfirmComponent, NotFoundChannel } from "../Settings/DialogComponent";
import { channelAPI, messagesAPI } from "../../API/api";
import { useTypedTranslation } from "../../hooks/useTypedTranslation";
import { AutoSizer, CellMeasurer, CellMeasurerCache, List, ListRowRenderer } from "react-virtualized";

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

// const DEFAULT_ROW_HEIGHT = 54;

// type Props = { list: Chat[] };

// const ListComponent: FC<Props> = ({ list }) => {
//     const rowCount = list.length;

//     const cacheRef = useRef(
//         new CellMeasurerCache({
//             fixedWidth: true,
//             defaultHeight: DEFAULT_ROW_HEIGHT,
//             keyMapper: (rowIndex: number) => {
//                 const item = list[rowIndex];
//                 return "channel" in item ? `channel_${item.chatID}` : `chat_${item.uid}`;
//             },
//         })
//     );

//     const listRef = useRef<List | null>(null);

//     useEffect(() => {
//         cacheRef.current = new CellMeasurerCache({
//             fixedWidth: true,
//             defaultHeight: DEFAULT_ROW_HEIGHT,
//             keyMapper: (rowIndex: number) => {
//                 const item = list[rowIndex];
//                 return "channel" in item ? `channel_${item.chatID}` : `chat_${item.uid}`;
//             },
//         });

//         if (listRef.current) {
//             listRef.current.recomputeRowHeights();
//             listRef.current.forceUpdateGrid();
//         }
//     }, [list.length])

//     const rowRenderer: ListRowRenderer = useCallback(
//         ({ index, key, parent, style }) => {
//             const item = list[index];
//             const rowStyle = {
//                 ...style,
//                 minHeight: '58px'
//             }

//             return (
//                 <CellMeasurer
//                     cache={cacheRef.current}
//                     columnIndex={0}
//                     rowIndex={index}
//                     key={key}
//                     parent={parent}
//                 >
//                     {({ measure, registerChild }) => (
//                         <div
//                             ref={registerChild as any}
//                             style={rowStyle}
//                             onLoad={measure}
//                         >
//                             {"channel" in item ? (
//                                 <ChannelInfo {...item} />
//                             ) : (
//                                 <ChatInfo {...item} />
//                             )}
//                         </div>
//                     )}
//                 </CellMeasurer>
//             );
//         },
//         [list]
//     );

//     if (rowCount === 0) {
//         return null;
//     }

//     return (
//         <div style={{ width: "100%", height: "100%" }}>
//             <AutoSizer>
//                 {({ height, width }) => (
//                     <List
//                         ref={(ref) => (listRef.current = ref)}
//                         height={height}
//                         width={width}
//                         rowCount={rowCount}
//                         rowHeight={cacheRef.current.rowHeight}
//                         rowRenderer={rowRenderer}
//                         overscanRowCount={4}
//                         style={{ outline: "none" }}
//                         rowClassName="virtual-row"
//                     />
//                 )}
//             </AutoSizer>
//         </div>
//     );
// };





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
    const { t } = useTypedTranslation()
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
                text={t("notificationClosedCommunity")} />
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
    const { t } = useTypedTranslation()


    useEffect(() => {
        if (name) {
            const fetchData = async () => {
                const response = await globalSearch(name, currentUserID)
                setGlobalSearchUsers(response)
            }
            fetchData()
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
                        <ListComponent list={globalSearchUsers} />
                        :
                        <ListComponent list={filterMyChats} />
                    }
                    {name && globalSearchUsers.length === 0 &&
                        <li className={styles.chatInfo}>{t('nothingFound')}</li>
                    }
                </ul>
            </div>
        </>
    );
}

export default ChatList;