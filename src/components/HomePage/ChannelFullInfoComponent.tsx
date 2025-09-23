import { FC, useEffect, useMemo, useState } from "react";
import stylesContacts from '../Contacts/Contacts.module.scss'
import stylesSettings from '../Settings/Settings.module.scss'
import InputComponent from "../../InputComponent/InputComponent";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { setChat } from "../../store/slices/setChatIDSlice";
import { closeMenu, setClearGlobalSearchUser, setTempChat } from "../../store/slices/appSlice";
import { Chat, CurrentUser, TypeChannel } from "../../types/types";
import RemoveFromChannelIcon from '../../assets/person-dash.svg'
import UserInfo from "../MenuComponent/UserInfo";
import { channelAPI, messagesAPI } from "../../API/api";
import { doc, DocumentSnapshot, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";
import { CHANNELS_INFO } from "../../constants/constants";
import { createObjectChannel } from "../../utils/utils";
import DialogComponent, { ConfirmComponent } from "../Settings/DialogComponent";

const test: CurrentUser[] = [
    { displayName: 'alexdb', photoURL: '', email: 'test1rt@test.com', uid: 'uhrtugjfghdhc' },
    { displayName: 'alexcbc55555555555555', photoURL: '', email: 'test1fg@test.com', uid: 'uhugjfgfghdhc' },
    { displayName: 'alexvbcx', photoURL: '', email: 'test1cv@test.com', uid: 'uhugjfgcvhdhc' },
    { displayName: 'alexfgdh', photoURL: '', email: 'test1nb@test.com', uid: 'uhugjfgbnhdhc' },
    { displayName: 'alexzzzzc', photoURL: '', email: 'test1sd@test.com', uid: 'usdhugjfghdhc' },
    { displayName: 'alexds', photoURL: '', email: 'test1io@test.com', uid: 'uhugjfghiodhc' },
    { displayName: 'alexvxv', photoURL: '', email: 'test1ti@test.com', uid: 'uhugjfghdtihc' },
    { displayName: 'alexbbbb', photoURL: '', email: 'test1hh@test.com', uid: 'uhugjfghdhhhc' },
    { displayName: 'alexcvxv', photoURL: '', email: 'test1ddg@test.com', uid: 'uhudgdgjfghdhc' },
    { displayName: 'alexxv', photoURL: '', email: 'test1jr@test.com', uid: 'uhugjfghdgdhjdhc' },
    { displayName: 'alexzzzzs', photoURL: '', email: 'test1rw@test.com', uid: 'uhugjwqqfghdhc' },
    { displayName: 'alexvvcvbbb', photoURL: '', email: 'test1dhhj@test.com', uid: 'uhugjddghfghdhc' },
    { displayName: 'alexdgsd', photoURL: '', email: 'test1qqq@test.com', uid: 'uhuqqqgjfghdhc' },
    { displayName: 'alexbbb', photoURL: '', email: 'test1fhfr@test.com', uid: 'uhugjfgjfghdhc' },
    { displayName: 'test1', photoURL: '', email: 'test1dete@test.com', uid: 'uhuhjhggjfghdhc' },
]

enum ModalAction {
    DELETE_CHANNEL = 'DELETE_CHANNEL',
    AVAILABILITY_CHANNEL = 'AVAILABILITY_CHANNEL',
    SHOW_SUBSCRIBERS_LIST = 'SHOW_SUBSCRIBERS_LIST',
}


const ListSubscribers: FC<{ channel: TypeChannel, currentUser: CurrentUser, isOwner: boolean }> = ({ channel, currentUser, isOwner }) => {
    const [name, setName] = useState('')
    const dispatch = useAppDispatch()
    const filter = useMemo(() => {
        return channel.listOfSubscribers?.filter(item => item.displayName.includes(name)) ?? []
    }, [channel.listOfSubscribers, name])


    const handleClickName = (user: Chat) => {
        if (user.uid === currentUser.uid) return

        messagesAPI.getChatID(currentUser.email, user.email)
            .then(data => {
                dispatch(closeMenu(null))
                dispatch(setChat({ currentUserEmail: currentUser.email, guestInfo: { ...user, chatID: data } }))
            })
    }

    const removeFromChannel = (e: React.MouseEvent, contact: CurrentUser) => {
        e.stopPropagation()
        messagesAPI.deleteChat(contact, createObjectChannel(channel))
    }

    return (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', marginBottom: '4px' }}>
            <InputComponent classes={stylesContacts.item} returnValue={setName} />
            <ul className={stylesContacts.list} style={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
                {!channel.listOfSubscribers?.length && <span>Учасники не найдены</span>}
                {filter.map((item, index) => (
                    <li style={{ margin: '2px 8px' }} key={String(item.uid)} onClick={() => handleClickName(item)}>
                        <span >{item.displayName}</span>
                        {isOwner && item.uid !== currentUser.uid && <div title="Удалить из канала"
                            onClick={(e) => removeFromChannel(e, item)}
                        >
                            <RemoveFromChannelIcon />
                        </div>}
                    </li>
                ))}
            </ul>
        </div>
    )
}

const ChannelFullInfoComponent: FC = () => {

    const [modalState, setModalState] = useState({ isOpen: false, value: null })
    const dispatch = useAppDispatch()
    const channel = useAppSelector(state => state.app.selectedChannel || state.app.selectedChat.channel)
    const currentUser = useAppSelector(state => state.app.currentUser)
    const isOwner = currentUser.uid === channel.owner.uid
    const textAccessButoon = channel.isOpen ? 'Закрыть канал ?' : 'Открыть канал ?'

    const changeStateModal = (state: boolean) => {
        setModalState(prev => ({ ...prev, isOpen: state }))
    }

    const handleClick = () => {
        if (channel.owner.uid !== currentUser.uid) {
            dispatch(setClearGlobalSearchUser(true))
            dispatch(closeMenu(null))
            dispatch(setTempChat(channel.owner))
        }
    }

    const deleteChannel = () => {
        channelAPI.deleteChannel(channel.channelID)
            .then(() => {
                //setIsOpenDialog(false)
                changeStateModal(false)
                dispatch(closeMenu())
                dispatch(setChat(null))
            })
    }

    const changeAccessChannel = async() => {
        await channelAPI.changeAccessChannel(channel.channelID, !channel.isOpen)
        changeStateModal(false)
    }

    const targetComponent = (): JSX.Element => {
        if (modalState.value === ModalAction.DELETE_CHANNEL) return <ConfirmComponent confirmFunc={deleteChannel} text="Вы уверены ?" />
        if(modalState.value === ModalAction.AVAILABILITY_CHANNEL) return <ConfirmComponent confirmFunc={changeAccessChannel} text={textAccessButoon}/>
        if (modalState.value === ModalAction.SHOW_SUBSCRIBERS_LIST) return <ListSubscribers channel={channel} currentUser={currentUser} isOwner={isOwner} />
        return null
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ overflow: 'auto' }} >
                <div>
                    {isOwner &&
                        <div className={stylesSettings.settings}>
                            <UserInfo isSettings currentInfo={{ ...currentUser, channel }} />
                            <hr className={stylesSettings.hr} />
                        </div>
                    }
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }} className={stylesContacts.item}>
                    <div style={{ width: '100%', textAlign: 'start', marginBottom: '4px' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 500 }}>
                            Владелец:   <span style={{ cursor: 'pointer', color: '#8774e1' }} onClick={handleClick}>
                                {channel.owner.displayName}
                            </span>
                        </span>
                    </div>
                    <div style={{ width: '100%', textAlign: 'start' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 500 }}>
                            Создан:   <span>
                                {channel.registrationDate.toString()}
                            </span>
                        </span>
                    </div>
                </div>
                <hr className={stylesSettings.hr} />
                {isOwner &&
                    <>
                        <div className={stylesContacts.item}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                <button onClick={() => setModalState({ isOpen: true, value: ModalAction.AVAILABILITY_CHANNEL })}>{textAccessButoon}</button>
                                <button onClick={() => setModalState({ isOpen: true, value: ModalAction.DELETE_CHANNEL })}>Удалить канал</button>
                            </div>
                        </div>
                        <hr className={stylesSettings.hr} />
                    </>
                }
                <div className={stylesContacts.item}>
                    <button onClick={() => setModalState({ isOpen: true, value: ModalAction.SHOW_SUBSCRIBERS_LIST })}>Показать учасников</button>
                </div>
                {modalState.isOpen &&
                    <DialogComponent isOpen={modalState.isOpen} onClose={changeStateModal}>
                        {targetComponent()}
                    </DialogComponent>
                }
            </div>
        </div>
    );
}

export default ChannelFullInfoComponent;