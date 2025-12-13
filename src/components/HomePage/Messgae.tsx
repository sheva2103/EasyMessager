import { CSSProperties, FC, HTMLAttributes, memo, MutableRefObject, RefObject, useCallback, useEffect, useRef, useState } from "react";
import Avatar from "../Avatar/Avatar";
import classNames from "classnames";
import styles from './HomePage.module.scss'
import ContextMenu from "./ContextMenu";
import SelectMessageInput from "./SelectMessageInput";
import { CallEndStatus, Chat, CurrentUser, Message1, Reaction } from "../../types/types";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { aggregateReactions, checkMessage, createNewDate, getTimeFromDate } from "../../utils/utils";
import UnreadIcon from '../../assets/check2.svg'
import ReadIcon from '../../assets/check2-all.svg'
import CallIcon from '../../assets/telephone-fill.svg'
import { messagesAPI } from "../../API/api";
import { useInView } from 'react-intersection-observer';
import { setTempChat } from "../../store/slices/appSlice";
import { useTypedTranslation } from "../../hooks/useTypedTranslation";
import { openModalCalls } from "../../store/slices/callsSlice";


const HEIGHT_MENU_FOR_OWNER = 256
const HEIGHT_MENU_FOR_GUEST = 104
const HEIGHT_MENU_FOR_GUEST_CHANNEL = 162
const WIDTH_MENU = 233
const HEIGHT_ROW = 42

interface IMessagesContent {
    onEnterViewport: () => void,
    message: Message1
}

interface ForwardedFromProps {
    user: Chat
}
const ForwardedFrom: FC<ForwardedFromProps> = ({ user }) => {

    const dispatch = useAppDispatch()
    const currentUser = useAppSelector(state => state.app.currentUser)
    const selectedChat = useAppSelector(state => state.app.selectedChat)
    const { t } = useTypedTranslation()
    const name = user?.channel ? user.channel.displayName : user.displayName

    const handleClick = (event: React.MouseEvent) => {
        if (user.uid !== currentUser.uid && user.uid !== selectedChat.uid) dispatch(setTempChat(user))
    }

    return (
        <div className={styles.messageData__forwardedFrom}>
            <span>{`${t('forwardedFrom')}`}</span>
            <br />
            <span style={{ fontWeight: 500 }} onClick={handleClick} id="forwardedFromName">{name}</span>
        </div>
    );
}

const ImageLoader: FC<{ src: string | null }> = ({ src }) => {
    const [loaded, setLoaded] = useState(false);

    if (!src) return null;

    return (
        <div className={styles.messageData__img}>
            <img
                src={src}
                alt="Загруженное изображение"
                onLoad={() => setLoaded(true)}
                onError={() => setLoaded(false)}
                style={{ display: loaded ? 'block' : 'none' }}
            />
        </div>
    );
};

const YTPlayer: FC<{ src: string }> = ({ src }) => {

    return (
        <div className={styles.messageData_playerConatiner}>
            <iframe
                width="100%"
                height="100%"
                src={src}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Встроенный YouTube-плеер"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    borderRadius: '16px'
                }}
            />
        </div>
    )
}

const ViewportContent: FC<IMessagesContent> = ({ onEnterViewport, message }) => {

    const { ref, inView } = useInView({
        threshold: 0.1,
    })
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const checkMessageObj = checkMessage(message.message)
    const { t } = useTypedTranslation()
    const status: CallEndStatus = message.callStatus

    useEffect(() => {
        if (inView) {
            onEnterViewport();
        }
    }, [inView])

    if (message?.callStatus) {
        return (
            <div className={styles.call__info}>
                <div className={styles.call__status} ref={ref}>
                    <CallIcon fontSize={'0.9rem'} />
                    <h5>{t(`call.${status}`)}</h5>
                </div>
                <span className={styles.call__time}>{message.message}</span>
            </div>
        )
    }

    return (
        <>
            <span
                dangerouslySetInnerHTML={{ __html: checkMessageObj.message }}
                ref={ref}
                className={classNames({ [styles.mobileDevice]: isMobile, [styles.hasLink]: checkMessageObj.hasLink })}
            >
            </span>
            {!!checkMessageObj.imgUrls.length &&
                checkMessageObj.imgUrls.map((item, index) => <ImageLoader src={item} key={index} />)
            }
            {!!checkMessageObj.YTUrls &&
                checkMessageObj.YTUrls.map((item, index) => <YTPlayer src={item} key={index} />)
            }
        </>
    )
}

type Props = {
    messageInfo: Message1,
    //scrollerDomRef: MutableRefObject<HTMLDivElement>
}

const ReplyToMessage: FC<Message1> = (props) => {
    const { replyToMessage, sender } = props
    const isMessageCall = replyToMessage?.callStatus
    const { t } = useTypedTranslation()

    function getFirst30Chars(inputString: string) {
        if (!inputString) return ''
        if (inputString.length > 30) {
            return inputString.substring(0, 30) + '...'
        }
        return inputString
    }

    return (
        <div className={styles.messageData__replyToMessage}>
            <div className={classNames(styles.messageData__replyToMessage_name)}>
                <span>{replyToMessage?.forwardedFrom?.displayName || replyToMessage?.sender.displayName}</span>
            </div>
            <div style={{ paddingRight: '2px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isMessageCall ?
                    <>
                        <CallIcon />
                        <span>{t(`call.${replyToMessage.callStatus}`)}</span>
                    </>
                    :
                    <span>{getFirst30Chars(replyToMessage?.message)}</span>
                }
            </div>
        </div>
    )
}

const Reactions: FC<{reactions: Array<Reaction>, currentUser: CurrentUser, chat: Chat, messageID: string}> = ({reactions, currentUser, chat, messageID}) => {

    const res = aggregateReactions(reactions, currentUser)
    
    const setReaction = (reaction: Reaction, e: React.MouseEvent) => {
        e.stopPropagation()
        messagesAPI.setReaction({
            reaction,
            chat,
            isMine: reaction.isMine,
            messageID
        })
    }

    if(!reactions || reactions.length === 0) return null

    return (
        <div className={styles.messageData__reactions}>
            {res.map((r, i) => (
                <div className={classNames(styles.reaction, {[styles.reaction__owner]: r.isMine})} key={i}>
                    <span onClick={(e) => setReaction({reaction: r.reaction, sender: currentUser, isMine: r.isMine}, e)}>{r.reaction}</span>
                    {r.count > 1 && <span className={styles.reaction__count}>{r.count}</span>}
                </div>
            ))}
        </div>
    )
}

const Message: FC<Props> = ({ messageInfo }) => {

    const owner = useAppSelector(state => state.app.currentUser)
    const isShowCheckbox = useAppSelector(state => state.app.showCheckbox)
    const chat = useAppSelector(state => state.app.selectedChat)
    const dispatch = useAppDispatch()
    const [contextMenuIsOpen, setContextMenu] = useState(false)
    //const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const isOwner = owner.email === messageInfo.sender.email
    const isForwarder = Boolean(messageInfo?.forwardedFrom)
    const isFavorites = messageInfo.hasOwnProperty('read')
    const isGuestMessage = messageInfo.sender.uid !== owner.uid
    const isCallMessage = !!messageInfo?.callStatus
    const statusCallMessage = (): string => {
        if (messageInfo.callStatus === 'completed') return styles.call_completed
        return styles.call_error
    }
    const messageRef = useRef(null)
    const refSpan = useRef<HTMLDivElement>(null)

    const [positionClick, setPositionClick] = useState({ top: 0, left: 0 })

    const setPositionMenu = useCallback((e: MouseEvent) => {
        if (!isShowCheckbox) {
            const top = e.clientY
            const left = e.clientX
            setPositionClick({ top, left })
        }
    }, [isShowCheckbox])

    const mobileHandleClick = (e: React.MouseEvent) => {
        const targetElement: HTMLDivElement = e.target as HTMLDivElement;

        if (isShowCheckbox && targetElement.tagName === 'A') {
            e.preventDefault();
        }

        if (!isMobile) {
            if (messageInfo?.callStatus && !isShowCheckbox) {
                dispatch(openModalCalls({
                    mode: null,
                    callerUid: chat.uid,
                    roomId: null,
                    callInfo: { caller: owner, callee: chat }
                }))
            }
            return
        }
        if (targetElement.nodeName !== 'A' && !isShowCheckbox && targetElement.id !== 'forwardedFromName') setContextMenu(true)
    }

    const openContextMenu = (e: React.MouseEvent) => {
        if (isMobile) return
        e.preventDefault()
        if (!isShowCheckbox) setContextMenu(true)
    }
    const closeContextMenu = (e: React.MouseEvent) => {
        setContextMenu(false)
    }

    useEffect(() => {
        if (refSpan.current) {
            // refSpan.current.addEventListener('contextmenu', setPositionMenu)
            // refSpan.current.addEventListener('click', setPositionMenuForIOS)
            refSpan.current.addEventListener('contextmenu', setPositionMenu)
            refSpan.current.addEventListener('click', setPositionMenu)

            return () => {
                // refSpan.current?.removeEventListener('contextmenu', setPositionMenu)
                // refSpan.current?.removeEventListener('click', setPositionMenuForIOS)
                refSpan.current?.removeEventListener('contextmenu', setPositionMenu)
                refSpan.current?.removeEventListener('click', setPositionMenu)
            }
        }
    }, [isShowCheckbox])

    const readMessage = () => {
        if (messageInfo.sender.email !== owner.email && isFavorites && !messageInfo.read) {
            messagesAPI.readMessage(chat.chatID, messageInfo)
        }
    }

    console.log('message render')

    return (
        <li className={classNames({ [styles.selectedMessage]: contextMenuIsOpen })} ref={messageRef}>
            <label data-id={messageInfo.messageID}>
                {isShowCheckbox && <SelectMessageInput messageInfo={messageInfo} />}
                <div className={styles.avatar}>
                    {messageInfo.sender.email === owner.email ?
                        <Avatar url={owner?.photoURL} name={owner.displayName} />
                        :
                        <Avatar url={chat?.photoURL} name={chat.displayName} />
                    }
                </div>
                <div
                    className={classNames(styles.messageData,
                        {
                            [styles.owner]: !isGuestMessage,
                            [styles.guest]: isGuestMessage,
                            [styles.noSelect]: contextMenuIsOpen,
                            [statusCallMessage()]: isCallMessage,
                            [styles.call]: isCallMessage
                        })
                    }
                    onContextMenu={openContextMenu}
                    onClick={mobileHandleClick}
                    ref={refSpan}
                >
                    {messageInfo.forwardedFrom && <ForwardedFrom user={messageInfo.forwardedFrom} />}
                    {messageInfo.replyToMessage && <ReplyToMessage {...messageInfo} />}
                    <ViewportContent onEnterViewport={readMessage} message={messageInfo} />
                    <div className={styles.messageData__info}>
                        <Reactions reactions={messageInfo?.reactions} currentUser={owner} chat={chat} messageID={messageInfo.messageID}/>
                        <div className={styles.infoWrapper}>
                            <div className={styles.messageData__date} style={{ paddingBottom: !isFavorites ? '4px' : '0' }}>
                                <span >{messageInfo.changed ? `ред.${getTimeFromDate(createNewDate(messageInfo.changed))}` : getTimeFromDate(createNewDate(messageInfo.date))}</span>
                            </div>
                            {messageInfo.sender.email === owner.email && isFavorites &&
                                <div className={styles.messageData__status}>
                                    {messageInfo.read ? <ReadIcon /> : <UnreadIcon />}
                                </div>
                            }
                        </div>
                    </div>
                </div>
                {contextMenuIsOpen &&
                    <ContextMenu
                        isOpen={contextMenuIsOpen}
                        closeContextMenu={closeContextMenu}
                        isOwner={isOwner}
                        message={messageInfo}
                        isForwarder={isForwarder}
                        currentUser={owner}
                        positionClick={positionClick}
                    />}
            </label>
        </li>
    );
}

function checkProps(prevProps: Props, nextProps: Props): boolean {
    return prevProps.messageInfo.message === nextProps.messageInfo.message
            &&
            prevProps.messageInfo.read === nextProps.messageInfo.read
            &&
            prevProps.messageInfo?.reactions === nextProps.messageInfo?.reactions
}

export default memo(Message, checkProps);