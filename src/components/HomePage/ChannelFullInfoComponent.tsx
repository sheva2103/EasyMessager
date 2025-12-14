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
import { channelAPI, messagesAPI, profileAPI } from "../../API/api";
import { createObjectChannel } from "../../utils/utils";
import DialogComponent, { ConfirmComponent } from "../Settings/DialogComponent";
import DescriptionComponent from "../Settings/DescriptionComponent";
import { useTypedTranslation } from "../../hooks/useTypedTranslation";
import { Virtuoso } from "react-virtuoso";
import Preloader from '../../assets/preloader.svg'

// const test: CurrentUser[] = [
//     { displayName: 'alexdb', photoURL: '', email: 'test1rt@test.com', uid: 'uhrtugjfghdhc' },
//     { displayName: 'alexcbc55555555555555', photoURL: '', email: 'test1fg@test.com', uid: 'uhugjfgfghdhc' },
//     { displayName: 'alexvbcx', photoURL: '', email: 'test1cv@test.com', uid: 'uhugjfgcvhdhc' },
//     { displayName: 'alexfgdh', photoURL: '', email: 'test1nb@test.com', uid: 'uhugjfgbnhdhc' },
//     { displayName: 'alexzzzzc', photoURL: '', email: 'test1sd@test.com', uid: 'usdhugjfghdhc' },
//     { displayName: 'alexds', photoURL: '', email: 'test1io@test.com', uid: 'uhugjfghiodhc' },
//     { displayName: 'alexvxv', photoURL: '', email: 'test1ti@test.com', uid: 'uhugjfghdtihc' },
//     { displayName: 'alexbbbb', photoURL: '', email: 'test1hh@test.com', uid: 'uhugjfghdhhhc' },
//     { displayName: 'alexcvxv', photoURL: '', email: 'test1ddg@test.com', uid: 'uhudgdgjfghdhc' },
//     { displayName: 'alexxv', photoURL: '', email: 'test1jr@test.com', uid: 'uhugjfghdgdhjdhc' },
//     { displayName: 'alexzzzzs', photoURL: '', email: 'test1rw@test.com', uid: 'uhugjwqqfghdhc' },
//     { displayName: 'alexvvcvbbb', photoURL: '', email: 'test1dhhj@test.com', uid: 'uhugjddghfghdhc' },
//     { displayName: 'alexdgsd', photoURL: '', email: 'test1qqq@test.com', uid: 'uhuqqqgjfghdhc' },
//     { displayName: 'alexbbb', photoURL: '', email: 'test1fhfr@test.com', uid: 'uhugjfgjfghdhc' },
//     { displayName: 'test1', photoURL: '', email: 'test1dete@test.com', uid: 'uhuhjhggjfghdhc' },
//     { displayName: 'alexzzzzc', photoURL: '', email: 'test1sd@test.com', uid: 'usdhugjfghdhc' },
//     { displayName: 'alexds', photoURL: '', email: 'test1io@test.com', uid: 'uhugjfghiodhc' },
//     { displayName: 'alexvxv', photoURL: '', email: 'test1ti@test.com', uid: 'uhugjfghdtihc' },
//     { displayName: 'alexbbbb', photoURL: '', email: 'test1hh@test.com', uid: 'uhugjfghdhhhc' },
//     { displayName: 'alexcvxv', photoURL: '', email: 'test1ddg@test.com', uid: 'uhudgdgjfghdhc' },
//     { displayName: 'alexxv', photoURL: '', email: 'test1jr@test.com', uid: 'uhugjfghdgdhjdhc' },
//     { displayName: 'alexzzzzs', photoURL: '', email: 'test1rw@test.com', uid: 'uhugjwqqfghdhc' },
//     { displayName: 'alexvvcvbbb', photoURL: '', email: 'test1dhhj@test.com', uid: 'uhugjddghfghdhc' },
//     { displayName: 'alexdgsd', photoURL: '', email: 'test1qqq@test.com', uid: 'uhuqqqgjfghdhc' },
//     { displayName: 'alexbbb', photoURL: '', email: 'test1fhfr@test.com', uid: 'uhugjfgjfghdhc' },
//     { displayName: 'test1', photoURL: '', email: 'test1dete@test.com', uid: 'uhuhjhggjfghdhc' },
// ]

enum ModalAction {
    DELETE_CHANNEL = 'DELETE_CHANNEL',
    AVAILABILITY_CHANNEL = 'AVAILABILITY_CHANNEL',
    SHOW_SUBSCRIBERS_LIST = 'SHOW_SUBSCRIBERS_LIST',
    CLEAR_MESSAGES = 'CLEAR_MESSAGES'
}

const SubscriberItem: FC<{
    initialUser: CurrentUser;
    currentUser: CurrentUser;
    ownerUid: string;
    handleClickName: (user: Chat) => void;
    removeFromChannel: (e: React.MouseEvent, contact: CurrentUser) => void;
}> = ({ initialUser, currentUser, ownerUid, handleClickName, removeFromChannel }) => {

    const [userData, setUserData] = useState(initialUser);
    const isOwner = ownerUid === initialUser.uid

    useEffect(() => {
        let isMounted = true;
        const fetchFreshData = async () => {
            try {
                const userInfo = await profileAPI.getCurrentInfo(initialUser.uid);
                if (isMounted && userInfo) {
                    console.log('Получены обновлённые данные')
                    setUserData({ ...userInfo });
                }
            } catch (error) {
                console.error(`Не удалось получить данные пользователя ${initialUser.uid}`, error);
            }
        };

        fetchFreshData();

        return () => { isMounted = false; };
    }, [initialUser.uid]);

    return (
        <li style={{ margin: '4px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            onClick={() => handleClickName(userData)}>
            <span style={{ fontSize: '1.1rem', margin: '2px 0px' }}>{userData.displayName}</span>

            <div style={{ display: 'flex', alignItems: 'center' }}>
                {isOwner && (
                    <span className={stylesContacts.indicationAdmin}>admin</span>
                )}

                {!isOwner && currentUser.uid === ownerUid && (
                    <div
                        title="Удалить из канала"
                        style={{ cursor: 'pointer', marginLeft: '8px' }}
                        onClick={(e) => removeFromChannel(e, userData)}
                    >
                        <RemoveFromChannelIcon fontSize={'1.2rem'} />
                    </div>
                )}
            </div>
        </li>
    );
};

const ListSubscribers: FC<{ channel: TypeChannel, currentUser: CurrentUser, isOwner: boolean }> = ({ channel, currentUser, isOwner }) => {
    const [name, setName] = useState('')
    const dispatch = useAppDispatch()

    const filteredList = useMemo(() => {
        return channel.listOfSubscribers?.filter(item =>
            item.displayName.toLowerCase().includes(name.toLowerCase())
        ) ?? []
    }, [channel.listOfSubscribers, name])

    const handleClickName = (user: Chat) => {
        if (user.uid === currentUser.uid) return
        dispatch(closeMenu(null))
        dispatch(setTempChat(user))
    }

    const removeFromChannel = (e: React.MouseEvent, contact: CurrentUser) => {
        e.stopPropagation()
        messagesAPI.deleteChat(contact, createObjectChannel(channel))
    }

    return (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', marginBottom: '4px', height: '100%' }}>
            <InputComponent classes={stylesContacts.item} returnValue={setName} />
            <ul className={stylesContacts.list} style={{ display: 'flex', flexDirection: 'column', overflow: 'auto', marginBottom: '4px' }}>
                {!channel.listOfSubscribers?.length ? (
                    <span>Учасники не найдены</span>
                ) : (
                    <Virtuoso
                        style={{ height: '100%' }}
                        data={filteredList}
                        totalCount={filteredList.length}
                        itemContent={(index, item) => (
                            <SubscriberItem
                                key={item.uid}
                                initialUser={item}
                                currentUser={currentUser}
                                ownerUid={channel.owner.uid}
                                handleClickName={handleClickName}
                                removeFromChannel={removeFromChannel}
                            />
                        )}
                    />
                )}
            </ul>
        </div>
    )
}

const ChannelFullInfoComponent: FC = () => {

    const [modalState, setModalState] = useState({ isOpen: false, value: null })
    const [deletingMessages, setDeletingMessages] = useState(false)
    const dispatch = useAppDispatch()
    const channel = useAppSelector(state => state.app.selectedChannel || state.app.selectedChat.channel)
    const currentUser = useAppSelector(state => state.app.currentUser)
    const { t } = useTypedTranslation()
    const isOwner = currentUser.uid === channel.owner.uid
    const textAccessButoon = channel.isOpen ? `${t('closeСhannel')}` : `${t('openChannel')}`

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

    const clearAllMessages = () => {
        setDeletingMessages(true)
        const toChat = createObjectChannel(channel)
        messagesAPI.clearChat(toChat, false)
            .then(() => changeStateModal(false))
            .finally(() => setDeletingMessages(false))
    }

    const changeAccessChannel = async () => {
        await channelAPI.changeAccessChannel(channel.channelID, !channel.isOpen)
        changeStateModal(false)
    }

    const targetComponent = (): JSX.Element => {
        if (modalState.value === ModalAction.DELETE_CHANNEL) return <ConfirmComponent confirmFunc={deleteChannel} text={t('areYouSure?')} />
        if (modalState.value === ModalAction.AVAILABILITY_CHANNEL) return <ConfirmComponent confirmFunc={changeAccessChannel} text={textAccessButoon} />
        if (modalState.value === ModalAction.SHOW_SUBSCRIBERS_LIST) return <ListSubscribers channel={channel} currentUser={currentUser} isOwner={isOwner} />
        if (modalState.value === ModalAction.CLEAR_MESSAGES) return <ConfirmComponent confirmFunc={clearAllMessages} text={'Удалить все сообщения ?'} />
        return null
    }

    const description = [
        { title: t('owner'), description: channel.owner.displayName, onClick: handleClick },
        { title: t('created'), description: channel.registrationDate.toString() },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ overflow: 'auto' }} >
                <div>
                    <div className={stylesSettings.settings}>
                        <UserInfo isSettings={isOwner} currentInfo={{ ...currentUser, channel }} />
                        <hr className={stylesSettings.hr} />
                    </div>
                </div>
                <div className={stylesContacts.item}>
                    <DescriptionComponent items={description} />
                </div>
                <hr className={stylesSettings.hr} />
                {isOwner &&
                    <>
                        <div className={stylesContacts.item}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                <button onClick={() => setModalState({ isOpen: true, value: ModalAction.AVAILABILITY_CHANNEL })}>{textAccessButoon}</button>
                                <button onClick={() => setModalState({ isOpen: true, value: ModalAction.DELETE_CHANNEL })}>{t('removeChannel')}</button>
                                <button
                                    onClick={() => setModalState({ isOpen: true, value: ModalAction.CLEAR_MESSAGES })}
                                    style={{ minWidth: 100 }}
                                >
                                    {deletingMessages ? <Preloader /> : 'Очистить сообщения'}
                                </button>
                            </div>
                        </div>
                        <hr className={stylesSettings.hr} />
                    </>
                }
                <div className={stylesContacts.item}>
                    <button onClick={() => setModalState({ isOpen: true, value: ModalAction.SHOW_SUBSCRIBERS_LIST })}>{t('showSubscribers')}</button>
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