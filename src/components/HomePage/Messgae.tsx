import { FC, memo, useEffect, useRef, useState } from "react";
import Avatar from "../Avatar/Avatar";
import classNames from "classnames";
import styles from './HomePage.module.scss'
import ContextMenu from "./ContextMenu";
import SelectMessageInput from "./SelectMessageInput";
import { Chat, CurrentUser, Message1, StyleContextMenu } from "../../types/types";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { checkMessage, createNewDate, getTimeFromDate } from "../../utils/utils";
import handleViewport, { type InjectedViewportProps } from 'react-in-viewport';
import UnreadIcon from '../../assets/check2.svg'
import ReadIcon from '../../assets/check2-all.svg'
import { messagesAPI } from "../../API/api";
import { setChat } from "../../store/slices/setChatIDSlice";

interface MessageContentProps extends InjectedViewportProps<HTMLDivElement> {
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

const MessagesContent: FC = (props: MessageContentProps) => {

    const { forwardedRef, message } = props
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    return (
        <span
            dangerouslySetInnerHTML={{ __html: checkMessage(message) }}
            ref={forwardedRef}
            className={classNames({ [styles.mobileDevice]: isMobile })}
        >
        </span>
    )
}

const MessagesContentViewport = handleViewport(MessagesContent);

type Offset = {
    top: number,
    left: number
}

type Props = {
    messageInfo: Message1,
}

const Message: FC<Props> = ({ messageInfo }) => {

    const owner = useAppSelector(state => state.app.currentUser)
    const isShowCheckbox = useAppSelector(state => state.app.showCheckbox)
    const chat = useAppSelector(state => state.app.selectedChat)
    const [offset, setOffset] = useState<Offset>({ top: 0, left: 0 })
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    const positionMenu: StyleContextMenu = {
        position: 'relative',
        top: offset.top + 5 + 'px',
        left: offset.left + 5 + 'px'
    }

    const setPositionMenu = (e: MouseEvent) => {
        const position = { top: 0, left: 0 }
        const windowHeight = document.documentElement.clientHeight
        const windowWidth = document.documentElement.clientWidth
        const positionClickTop = e.clientY
        const positionClickLeft = e.clientX
        windowHeight - positionClickTop > 220 ? position.top = positionClickTop : position.top = positionClickTop - 168
        windowWidth - positionClickLeft > 200 ? position.left = positionClickLeft : position.left = positionClickLeft - 168
        setOffset(position)
    }

    const setPositionMenuForIOS = (e: MouseEvent) => {
        //const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
        if(isIOS) setPositionMenu(e)
    }

    const ios = ({ target }: React.MouseEvent) => {
        //const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
        if (!isIOS) return
        const targetElement: HTMLDivElement = target as HTMLDivElement;
        if(targetElement.nodeName !== 'A' && !isShowCheckbox) setContextMenu(true)
    }

    useEffect(() => {
        refSpan.current.addEventListener('contextmenu', setPositionMenu)
        refSpan.current.addEventListener('click', setPositionMenuForIOS)
        if (!refSpan.current) return () => refSpan.current.removeEventListener('contextmenu', setPositionMenu)
    }, []);

    const [contextMenuIsOpen, setContextMenu] = useState(false)
    const openContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        if (!isShowCheckbox) setContextMenu(true)
    }
    const closeContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        setContextMenu(false)
    }



    const readMessage = () => {
        if (messageInfo.sender.email !== owner.email && !messageInfo.read) messagesAPI.readMessage(chat.chatID, messageInfo)
    }

    const refSpan = useRef<HTMLDivElement>(null)

    console.log('message render')
    // сделать затенение для выбраного сообщения
    return (
        <li className={classNames({[styles.selectedMessage]: contextMenuIsOpen})}>
            {contextMenuIsOpen && <div className={styles.selectedMessage__selected}/>}
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
                    <MessagesContentViewport onEnterViewport={readMessage} message={messageInfo.message} />
                    <div className={styles.messageData__info}>
                        <div className={styles.messageData__date}>
                            <span >{messageInfo.changed ? `ред.${getTimeFromDate(createNewDate(messageInfo.changed))}` : getTimeFromDate(createNewDate(messageInfo.date))}</span>
                        </div>
                        {messageInfo.sender.email === owner.email &&
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
                        isOwner={owner.email === messageInfo.sender.email}
                        message={messageInfo}
                        positionMenu={positionMenu}
                        isForwarder={Boolean(messageInfo?.forwardedFrom)}
                    />}
            </label>
        </li>
    );
}

function checkProps(prevProps: Props, nextProps: Props): boolean {
    return prevProps.messageInfo.message === nextProps.messageInfo.message && prevProps.messageInfo.read === nextProps.messageInfo.read
}

export default memo(Message, checkProps);