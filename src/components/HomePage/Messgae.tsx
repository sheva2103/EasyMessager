import { FC, memo, useEffect, useRef, useState } from "react";
import Avatar from "../Avatar/Avatar";
import classNames from "classnames";
import styles from './HomePage.module.scss'
import ContextMenu from "./ContextMenu";
import SelectMessageInput from "./SelectMessageInput";
import { Chat, Message1, StyleContextMenu } from "../../types/types";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { checkMessage, createNewDate, getTimeFromDate } from "../../utils/utils";
import UnreadIcon from '../../assets/check2.svg'
import ReadIcon from '../../assets/check2-all.svg'
import { messagesAPI } from "../../API/api";
import { setChat } from "../../store/slices/setChatIDSlice";
import { useInView } from 'react-intersection-observer';


const HEIGHT_MENU_FOR_OWNER = 220
const HEIGHT_MENU_FOR_GUEST = 168
const WIDTH_MENU = 200
const HEIGHT_HEADER = 66

interface IMessagesContent {
    onEnterViewport: () => void,
    message: string
}

interface ForwardedFromProps {
    user: Chat
}
const ForwardedFrom: FC<ForwardedFromProps> = ({ user }) => {

    const dispatch = useAppDispatch()
    const currentUser = useAppSelector(state => state.app.currentUser)
    const selectedChat = useAppSelector(state => state.app.selectedChat)

    const handleClick = () => {

        if (user.uid !== currentUser.uid && user.uid !== selectedChat.uid) {
            messagesAPI.getChatID(currentUser.email, user.email)
                .then(data => dispatch(setChat({ currentUserEmail: user.email, guestInfo: { ...user, chatID: data } })))
        }
    }

    return (
        <div className={styles.messageData__forwardedFrom} onClick={handleClick}>
            <span>переслано от:</span>
            <br />
            <span style={{ fontWeight: 500 }}>{user.displayName}</span>
        </div>
    );
}

const ImageLoader: FC<{ src: string | null }> = ({ src }) => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const img = new Image(100, 100);
        img.src = src;
        img.onload = () => setLoaded(true)
        img.onerror = () => setLoaded(false);
    }, [src]);

    if (!src) return null

    return (
        <div className={styles.messageData__img}>
            {loaded ? <a href={src} target="blanc"><img src={src} alt="Загруженное изображение" /></a> : null}
        </div>
    );
}

const ViewportContent: FC<IMessagesContent> = ({ onEnterViewport, message }) => {

    const { ref, inView } = useInView({
        threshold: 0.1,
    })
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    const checkMessageObj = checkMessage(message)

    useEffect(() => {
        if (inView) {
            onEnterViewport();
        }
    }, [inView])

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
                <span>{replyToMessage?.sender.displayName}</span>
            </div>
            <div style={{ paddingRight: '2px', fontSize: '0.9rem' }}>
                <span>{getFirst30Chars(replyToMessage?.message)}</span>
            </div>
        </div>
    )
}

const Message: FC<Props> = ({ messageInfo }) => {

    const owner = useAppSelector(state => state.app.currentUser)
    const isShowCheckbox = useAppSelector(state => state.app.showCheckbox)
    const chat = useAppSelector(state => state.app.selectedChat)
    const [offset, setOffset] = useState<Offset>({ top: 0, left: 0 })
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    const isOwner = owner.email === messageInfo.sender.email
    const isForwarder = Boolean(messageInfo?.forwardedFrom)
    const isFavorites = messageInfo.hasOwnProperty('read')
    const positionMenu: StyleContextMenu = {
        position: 'relative',
        top: offset.top + 'px',
        left: offset.left + 'px'
    }
    const virtualizedListElementRef: { current: HTMLDivElement } = useRef(null)

    const messageRef = useRef(null)

    const setPositionMenu = (e: MouseEvent) => {
        const position = { top: 0, left: 0 }
        const styleContainer: HTMLDivElement = document.querySelector('.ReactVirtualized__Grid')
        const parentContainer: HTMLDivElement = document.querySelector('.ReactVirtualized__Grid__innerScrollContainer')
        virtualizedListElementRef.current = styleContainer
        styleContainer.style.willChange = 'auto'
        styleContainer.style.overflow = 'hidden'
        const parentRect = parentContainer.getBoundingClientRect();
        const clickX = e.clientX - parentRect.left;
        const positionClickTop = e.clientY
        const positionClickLeft = e.clientX
        const topIndent = positionClickTop - HEIGHT_HEADER
        topIndent > HEIGHT_MENU_FOR_OWNER ? position.top = positionClickTop - (isOwner && !isForwarder ? HEIGHT_MENU_FOR_OWNER : HEIGHT_MENU_FOR_GUEST) : position.top = positionClickTop
        clickX > WIDTH_MENU ? position.left = positionClickLeft - 168 : position.left = positionClickLeft
        setOffset(position)
    }

    const setPositionMenuForIOS = (e: MouseEvent) => {
        if (isIOS) setPositionMenu(e)
    }

    const ios = ({ target }: React.MouseEvent) => {
        //const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
        if (!isIOS) return
        const targetElement: HTMLDivElement = target as HTMLDivElement;
        if (targetElement.nodeName !== 'A' && !isShowCheckbox) setContextMenu(true)
    }

    // useEffect(() => {
    //     refSpan.current.addEventListener('contextmenu', setPositionMenu)
    //     refSpan.current.addEventListener('click', setPositionMenuForIOS)
    //     if (!refSpan.current) return () => refSpan.current.removeEventListener('contextmenu', setPositionMenu)
    // }, []);

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


    const [contextMenuIsOpen, setContextMenu] = useState(false)
    const openContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        if (!isShowCheckbox) setContextMenu(true)
    }
    const closeContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        virtualizedListElementRef.current.style.willChange = 'transform'
        virtualizedListElementRef.current.style.overflow = 'auto'
        setContextMenu(false)
    }



    const readMessage = () => {
        if (messageInfo.sender.email !== owner.email && isFavorites && !messageInfo.read) {
            messagesAPI.readMessage(chat.chatID, messageInfo)
        }
    }

    const refSpan = useRef<HTMLDivElement>(null)

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
                    className={classNames(styles.messageData, styles.owner, { [styles.guest]: messageInfo.sender.email !== owner.email, [styles.noSelect]: contextMenuIsOpen })}
                    onContextMenu={openContextMenu}
                    onClick={ios}
                    ref={refSpan}
                >
                    {messageInfo.forwardedFrom && <ForwardedFrom user={messageInfo.forwardedFrom} />}
                    {messageInfo.replyToMessage && <ReplyToMessage {...messageInfo} />}
                    <ViewportContent onEnterViewport={readMessage} message={messageInfo.message} />
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