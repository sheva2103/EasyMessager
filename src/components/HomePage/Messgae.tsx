import { FC, memo, useEffect, useRef, useState } from "react";
import Avatar from "../Avatar/Avatar";
import classNames from "classnames";
import styles from './HomePage.module.scss'
import ContextMenu from "./ContextMenu";
import SelectMessageInput from "./SelectMessageInput";
import { CallEndStatus, Chat, Message1, StyleContextMenu } from "../../types/types";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { checkMessage, createNewDate, getTimeFromDate } from "../../utils/utils";
import UnreadIcon from '../../assets/check2.svg'
import ReadIcon from '../../assets/check2-all.svg'
import CallIcon from '../../assets/telephone-fill.svg'
import { messagesAPI } from "../../API/api";
import { useInView } from 'react-intersection-observer';
import { setTempChat } from "../../store/slices/appSlice";
import { useTypedTranslation } from "../../hooks/useTypedTranslation";


const HEIGHT_MENU_FOR_OWNER = 220
const HEIGHT_MENU_FOR_GUEST = 168
const HEIGHT_MENU_FOR_GUEST_CHANNEL = 126
const WIDTH_MENU = 200
const HEIGHT_HEADER = 66

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
            <a href={src} target="_blank">
                <img
                    src={src}
                    alt="Загруженное изображение"
                    onLoad={() => setLoaded(true)}
                    onError={() => setLoaded(false)}
                    style={{ display: loaded ? 'block' : 'none' }}
                />
            </a>
        </div>
    );
};

const ViewportContent: FC<IMessagesContent> = ({ onEnterViewport, message }) => {

    const { ref, inView } = useInView({
        threshold: 0.1,
    })
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const checkMessageObj = checkMessage(message.message)
    const {t} = useTypedTranslation()
    const status: CallEndStatus = message.callStatus

    useEffect(() => {
        if (inView) {
            onEnterViewport();
        }
    }, [inView])

    if(message?.callStatus) {
        return (
            <div className={styles.call__info}>
                <div className={styles.call__status} ref={ref}>
                    <CallIcon fontSize={'0.9rem'}/>
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
                className={classNames({ [styles.mobileDevice]: isMobile })}
            >
            </span>
            {checkMessageObj.imgUrl && <ImageLoader src={checkMessageObj.imgUrl} />}
        </>
    )
}

type Offset = {
    top: number,
    left: number
}

type Props = {
    messageInfo: Message1,
}

const ReplyToMessage: FC<Message1> = (props) => {
    const { replyToMessage, sender } = props
    const isMessageCall = replyToMessage?.callStatus
    const {t} = useTypedTranslation()

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

const Message: FC<Props> = ({ messageInfo }) => {

    const owner = useAppSelector(state => state.app.currentUser)
    const isShowCheckbox = useAppSelector(state => state.app.showCheckbox)
    const chat = useAppSelector(state => state.app.selectedChat)
    const [offset, setOffset] = useState<Offset>({ top: 0, left: 0 })
    const [contextMenuIsOpen, setContextMenu] = useState(false)
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    const isOwner = owner.email === messageInfo.sender.email
    const isForwarder = Boolean(messageInfo?.forwardedFrom)
    const isFavorites = messageInfo.hasOwnProperty('read')
    const isGuestMessage = messageInfo.sender.uid !== owner.uid
    const isCallMessage = !!messageInfo?.callStatus
    const isChannel = !!chat?.channel
    const statusCallMessage = (): string => {
        if (messageInfo.callStatus === 'completed') return styles.call_completed
        return styles.call_error
    }
    const positionMenu: StyleContextMenu = {
        position: 'relative',
        top: offset.top + 'px',
        left: offset.left + 'px'
    }
    const virtualizedListElementRef: { current: HTMLDivElement } = useRef(null)
    const messageRef = useRef(null)
    const refSpan = useRef<HTMLDivElement>(null)

    const setPositionMenu = (e: MouseEvent) => {
        const position = { top: 0, left: 0 }
        function getAdjustedTop(clickY: number): number {
            const windowHeight = window.innerHeight
            const spaceBelow = windowHeight - clickY
            if (spaceBelow >= HEIGHT_MENU_FOR_OWNER) {
                return clickY
            } else {
                const offset = HEIGHT_MENU_FOR_OWNER - spaceBelow
                return Math.max(0, clickY - offset)
            }
        }
        const styleContainer: HTMLDivElement = document.querySelector('.ReactVirtualized__Grid')
        const parentContainer: HTMLDivElement = document.querySelector('.ReactVirtualized__Grid__innerScrollContainer')
        virtualizedListElementRef.current = styleContainer
        const parentRect = parentContainer.getBoundingClientRect();
        const clickX = e.clientX - parentRect.left;
        const positionClickTop = e.clientY
        const positionClickLeft = e.clientX
        const topIndent = positionClickTop //- HEIGHT_HEADER
        clickX > WIDTH_MENU ? position.left = positionClickLeft - 168 : position.left = positionClickLeft
        topIndent > HEIGHT_MENU_FOR_OWNER ?
            position.top = positionClickTop - (isOwner && !isForwarder ? 
                HEIGHT_MENU_FOR_OWNER : isChannel ?
                    HEIGHT_MENU_FOR_GUEST_CHANNEL : HEIGHT_MENU_FOR_GUEST)
            :
            position.top = getAdjustedTop(positionClickTop)
        setOffset(position)
    }

    const setPositionMenuForIOS = (e: MouseEvent) => {
        if (isIOS) setPositionMenu(e)
    }

    const ios = ({ target }: React.MouseEvent) => {
        if (!isIOS) return
        const targetElement: HTMLDivElement = target as HTMLDivElement;
        if (targetElement.nodeName !== 'A' && !isShowCheckbox && targetElement.id !== 'forwardedFromName') setContextMenu(true)
    }

    const openContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        if (!isShowCheckbox) setContextMenu(true)
    }
    const closeContextMenu = (e: React.MouseEvent) => {
        setContextMenu(false)
    }

    useEffect(() => {
        if (refSpan.current) {
            refSpan.current.addEventListener('contextmenu', setPositionMenu)
            refSpan.current.addEventListener('click', setPositionMenuForIOS)

            return () => {
                refSpan.current?.removeEventListener('contextmenu', setPositionMenu)
                refSpan.current?.removeEventListener('click', setPositionMenuForIOS)
            }
        }
    }, [])

    useEffect(() => {
        const styleContainer = document.querySelector('.ReactVirtualized__Grid') as HTMLDivElement;
        if (!styleContainer) return;

        if (contextMenuIsOpen) {
            styleContainer.style.overflow = 'hidden';
            styleContainer.style.willChange = 'auto';
        } else {
            styleContainer.style.overflow = 'auto';
            styleContainer.style.willChange = 'transform';
        }
    }, [contextMenuIsOpen]);

    const readMessage = () => {
        if (messageInfo.sender.email !== owner.email && isFavorites && !messageInfo.read) {
            messagesAPI.readMessage(chat.chatID, messageInfo)
        }
    }

    console.log('message render')

    return (
        <li className={classNames({ [styles.selectedMessage]: contextMenuIsOpen }, { [styles.guest]: !isOwner })} ref={messageRef}>
            {contextMenuIsOpen && <div className={styles.selectedMessage__selected} />}
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
                    onClick={ios}
                    ref={refSpan}
                >
                    {messageInfo.forwardedFrom && <ForwardedFrom user={messageInfo.forwardedFrom} />}
                    {messageInfo.replyToMessage && <ReplyToMessage {...messageInfo} />}
                    <ViewportContent onEnterViewport={readMessage} message={messageInfo} />
                    <div className={styles.messageData__info}>
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
                {contextMenuIsOpen &&
                    <ContextMenu
                        isOpen={contextMenuIsOpen}
                        closeContextMenu={closeContextMenu}
                        isOwner={isOwner}
                        message={messageInfo}
                        positionMenu={positionMenu}
                        isForwarder={isForwarder}
                    />}
            </label>
        </li>
    );
}

function checkProps(prevProps: Props, nextProps: Props): boolean {
    return prevProps.messageInfo.message === nextProps.messageInfo.message && prevProps.messageInfo.read === nextProps.messageInfo.read
}

export default memo(Message, checkProps);