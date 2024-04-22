import { FC, memo, useEffect, useRef, useState } from "react";
import Avatar from "../Avatar/Avatar";
import classNames from "classnames";
import styles from './HomePage.module.scss'
import ContextMenu from "./ContextMenu";
import SelectMessageInput from "./SelectMessageInput";
import { Message1, StyleContextMenu } from "../../types/types";
import { useAppSelector } from "../../hooks/hook";
import { checkMessage, getTimeFromDate } from "../../utils/utils";
import handleViewport, { type InjectedViewportProps } from 'react-in-viewport';
import UnreadIcon from '../../assets/check2.svg'
import ReadIcon from '../../assets/check2-all.svg'
import { messagesAPI } from "../../API/api";

interface MessageContentProps extends InjectedViewportProps<HTMLDivElement> {
    message: string
}

const MessagesContent: FC = (props: MessageContentProps) => {

    const { forwardedRef, message } = props

    return (
        <span
            dangerouslySetInnerHTML={{ __html: checkMessage(message) }}
            ref={forwardedRef}
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

    const owner = useAppSelector(state => state.app.currentUser.email)
    const isShowCheckbox = useAppSelector(state => state.app.showCheckbox)
    const chatID = useAppSelector(state => state.app.selectedChat.chatID)
    const [offset, setOffset] = useState<Offset>({ top: 0, left: 0 })
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
        windowHeight - positionClickTop > 200 ? position.top = positionClickTop : position.top = positionClickTop - 168
        windowWidth - positionClickLeft > 200 ? position.left = positionClickLeft : position.left = positionClickLeft - 168
        setOffset(position)
    }

    useEffect(() => {
        refSpan.current.addEventListener('contextmenu', setPositionMenu)
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
        if (messageInfo.sender.email !== owner) messagesAPI.readMessage(chatID, messageInfo)
    }

    const refSpan = useRef<HTMLDivElement>(null)

    console.log('message render')

    return (
        <li>
            <label>
                {isShowCheckbox && <SelectMessageInput messageInfo={messageInfo} />}
                <div className={styles.avatar}>
                    <Avatar url={messageInfo.sender.photoURL} name={messageInfo.sender.displayName} />
                </div>
                <div
                    className={classNames(styles.messageData, styles.owner, { [styles.guest]: messageInfo.sender.email !== owner, [styles.noSelect]: contextMenuIsOpen })}
                    onContextMenu={openContextMenu}
                    ref={refSpan}
                >
                    {/* <span
                    dangerouslySetInnerHTML={{ __html: checkMessage(messageInfo.message) }}
                >
                </span> */}
                    <MessagesContentViewport onEnterViewport={readMessage} message={messageInfo.message} />
                    {/* <span className={styles.date}>{messageInfo.changed ? `ред.${getTimeFromDate(messageInfo.changed)}` : getTimeFromDate(messageInfo.date)}</span> */}
                    <div className={styles.messageData__info}>
                        <div className={styles.messageData__date}>
                            <span >{messageInfo.changed ? `ред.${getTimeFromDate(messageInfo.changed)}` : getTimeFromDate(messageInfo.date)}</span>
                        </div>
                        {messageInfo.sender.email === owner &&
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

                        isOwner={owner === messageInfo.sender.email}
                        message={messageInfo}
                        positionMenu={positionMenu}
                    />}
            </label>
        </li>
    );
}

function checkProps(prevProps: Props, nextProps: Props): boolean {
    return prevProps.messageInfo.message === nextProps.messageInfo.message && prevProps.messageInfo.read === nextProps.messageInfo.read
}

export default memo(Message, checkProps);