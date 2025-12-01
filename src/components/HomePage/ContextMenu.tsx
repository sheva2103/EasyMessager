import classNames from 'classnames';
import styles from './HomePage.module.scss'
import SendMessage from '../../assets/send-fill.svg'
import Copy from '../../assets/copy.svg'
import Delete from '../../assets/delete.svg'
import Select from '../../assets/check-all.svg'
import Change from '../../assets/change.svg'
import Reply from '../../assets/reply-fill.svg'
import CallIcon from '../../assets/telephone-fill.svg'

import { CSSProperties, FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from '../../hooks/hook';
import { CurrentUser, Message1 } from '../../types/types';
import { addSelectedMessage, changeMessage, closeBar, isSendMessage, setReplyToMessage, setShowCheckbox } from '../../store/slices/appSlice';
import { messagesAPI } from '../../API/api';
import { CONTACTS } from '../../constants/constants';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';
import { createPortal } from 'react-dom';
import { openModalCalls } from '../../store/slices/callsSlice';
import { getContextMenuPosition } from '../../utils/utils';

const ANIMATION_DURATION = 190

type Props = {
    isOpen: boolean,
    isOwner: boolean,
    message: Message1
    closeContextMenu: (e: React.MouseEvent) => void,
    isForwarder: boolean,
    curentUser: CurrentUser,
    positionClick: { top: number, left: number }
}

// const reactions = ['🤡', '👍', '👎', '👋', '🙏', '😄', '😡'];
const reactions = ['🤡', '👍', '👎', '👋', '🙏', '😄'];


// const ContextMenu: FC<Props> = ({ closeContextMenu, isOwner, message, positionMenu, isForwarder, curentUser }) => {

//     const dispatch = useAppDispatch()
//     const chat = useAppSelector(state => state.app.selectedChat)
//     const isFavorites = useAppSelector(state => state.app.isFavorites)
//     const isCallMessage = !!message?.callStatus
//     const [animationOpen, setAnimationOpen] = useState(false)
//     const { t } = useTypedTranslation()
//     const portalRootRef = useRef<HTMLElement | null>(typeof document !== "undefined" ? document.body : null);


//     useEffect(() => {
//         setAnimationOpen(true)
//         return () => setAnimationOpen(false)
//     }, []);

//     const copyMessage = () => {
//         navigator.clipboard.writeText(message.message);
//     }

//     const change = () => {
//         dispatch(changeMessage(message))
//     }

//     const selectSeveral = () => {
//         dispatch(setShowCheckbox(true))
//     }

//     const deleteMessage = () => {
//         messagesAPI.deleteMessage(chat, message, isFavorites)
//             .catch((error) => console.error("Ошибка при удалении сообщения:", error))
//     }

//     const forwardMessage = () => {
//         dispatch(addSelectedMessage(message))
//         dispatch(isSendMessage(true))
//         dispatch(closeBar(CONTACTS))
//     }

//     const close = (e: React.MouseEvent) => {
//         setAnimationOpen(false)
//         setTimeout(() => closeContextMenu(e), ANIMATION_DURATION)
//     }

//     const replyToMessage = () => {
//         dispatch(setReplyToMessage(message))
//     }

//     const callBack = () => {
//         dispatch(openModalCalls({
//             mode: null,
//             callerUid: chat.uid,
//             roomId: null,
//             callInfo: { caller: curentUser, callee: chat }
//         }))
//     }

//     const reactionsNode = (
//         <div className={styles.reactions}>
//             {reactions.map((emoji, idx) => (
//                 <span
//                     key={idx}
//                     className={styles.reactionItem}
//                     onClick={() => console.log('Reaction clicked:', emoji)}
//                 >
//                     {emoji}
//                 </span>
//             ))}
//         </div>
//     )

//     const menu = (
//         <div
//             className={classNames(styles.cover, { [styles.showContextMenu]: animationOpen })}
//             onClick={close}
//             onContextMenu={close}
//         >
//             <div style={positionMenu} className={classNames(styles.contextMenu, { [styles.contextMenu_open]: animationOpen })}>
//                 <ul>
//                     {message?.callStatus &&
//                         <li onClick={callBack}><CallIcon /><span>{t('call.callback')}</span></li>
//                     }
//                     {chat?.channel ?
//                         isOwner ? <li onClick={replyToMessage}><Reply /><span>{t('answer')}</span></li> : null
//                         :
//                         <li onClick={replyToMessage}><Reply /><span>{t('answer')}</span></li>
//                     }
//                     {
//                         !message?.callStatus && <li onClick={forwardMessage}><SendMessage /><span>{t('forward')}</span></li>
//                     }
//                     <li onClick={copyMessage}><Copy /><span>{t('copyText')}</span></li>
//                     {isOwner && !isForwarder && !isCallMessage &&
//                         <li onClick={change}><Change /><span>{t('change')}</span></li>
//                     }

//                     {chat?.channel ?
//                         isOwner ? <li onClick={deleteMessage}><Delete /><span>{t('delete')}</span></li> : null
//                         :
//                         <li onClick={deleteMessage}><Delete /><span>{t('delete')}</span></li>
//                     }
//                     <li
//                         onClick={selectSeveral}
//                         className={classNames(styles.selectSeveral)}
//                     >
//                         <Select />
//                         <span>{t('selectSeveral')}</span>
//                     </li>
//                 </ul>
//             </div>
//         </div>
//     )

//     console.log('render contextmenu')

//     return (
//         createPortal(menu, portalRootRef.current)
//     );
// }

const ContextMenu: FC<Props> = ({ closeContextMenu, isOwner, message, isForwarder, curentUser, positionClick }) => {

    const dispatch = useAppDispatch()
    const chat = useAppSelector(state => state.app.selectedChat)
    const isFavorites = useAppSelector(state => state.app.isFavorites)
    const isCallMessage = !!message?.callStatus
    const { t } = useTypedTranslation()
    const portalRootRef = useRef<HTMLElement | null>(typeof document !== "undefined" ? document.body : null);
    const [menuState, setMenuState] = useState<{ offset: { top: number, left: number }, open: boolean }>({
        offset: { top: 0, left: 0 },
        open: false
    });
    const positionMenu: CSSProperties = {
        position: 'relative',
        top: menuState.offset.top + 'px',
        left: menuState.offset.left + 'px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        width: 'fit-content'
    }

    const copyMessage = () => {
        navigator.clipboard.writeText(message.message);
    }

    const change = () => {
        dispatch(changeMessage(message))
    }

    const selectSeveral = () => {
        dispatch(setShowCheckbox(true))
    }

    const deleteMessage = () => {
        messagesAPI.deleteMessage(chat, message, isFavorites)
            .catch((error) => console.error("Ошибка при удалении сообщения:", error))
    }

    const forwardMessage = () => {
        dispatch(addSelectedMessage(message))
        dispatch(isSendMessage(true))
        dispatch(closeBar(CONTACTS))
    }

    const close = (e: React.MouseEvent) => {
        setMenuState(prev => ({ ...prev, open: false }));
        menuRef.current?.addEventListener("transitionend", () => closeContextMenu(e), { once: true });
    };

    const replyToMessage = () => {
        dispatch(setReplyToMessage(message))
    }

    const callBack = () => {
        dispatch(openModalCalls({
            mode: null,
            callerUid: chat.uid,
            roomId: null,
            callInfo: { caller: curentUser, callee: chat }
        }))
    }

    const setReactions = (reaction: string) => {
        messagesAPI.setReaction({
            message,
            chat,
            reaction: {reaction, sender: curentUser}
        })
    }

    const reactionsNode = (
        <div className={classNames(styles.reactions, { [styles.reactions_open]: menuState.open })}>
            {reactions.map((emoji, idx) => (
                <span
                    key={idx}
                    className={styles.reactionItem}
                    onClick={() => setReactions(emoji)}
                >
                    {emoji}
                </span>
            ))}
        </div>
    )

    const menuRef = useRef<HTMLDivElement>(null)
    useLayoutEffect(() => {
        if (menuRef.current) {
            const offset = getContextMenuPosition({
                clickX :positionClick.left,
                clickY :positionClick.top,
                menuWidth :menuRef.current.clientWidth, 
                menuHeight :menuRef.current.clientHeight
            })
            setMenuState({ offset, open: true })
        }
    }, []);

    const menu = (
        <div
            className={classNames(styles.cover, { [styles.showContextMenu]: menuState.open })}
            onClick={close}
            onContextMenu={close}
        >
            <div style={positionMenu} ref={menuRef}>
                {reactionsNode}
                <div className={classNames(styles.contextMenu, { [styles.contextMenu_open]: menuState.open })}>
                    <ul>
                        {message?.callStatus &&
                            <li onClick={callBack}><CallIcon /><span>{t('call.callback')}</span></li>
                        }
                        {chat?.channel ?
                            isOwner ? <li onClick={replyToMessage}><Reply /><span>{t('answer')}</span></li> : null
                            :
                            <li onClick={replyToMessage}><Reply /><span>{t('answer')}</span></li>
                        }
                        {
                            !message?.callStatus && <li onClick={forwardMessage}><SendMessage /><span>{t('forward')}</span></li>
                        }
                        {!message?.callStatus && <li onClick={copyMessage}><Copy /><span>{t('copyText')}</span></li>}
                        {isOwner && !isForwarder && !isCallMessage &&
                            <li onClick={change}><Change /><span>{t('change')}</span></li>
                        }

                        {chat?.channel ?
                            isOwner ? <li onClick={deleteMessage}><Delete /><span>{t('delete')}</span></li> : null
                            :
                            <li onClick={deleteMessage}><Delete /><span>{t('delete')}</span></li>
                        }
                        <li
                            onClick={selectSeveral}
                            className={classNames(styles.selectSeveral)}
                        >
                            <Select />
                            <span>{t('selectSeveral')}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )

    console.log('render contextmenu')

    return (
        createPortal(menu, portalRootRef.current)
    );
}

export default ContextMenu