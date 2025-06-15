import { FC, useEffect, useState } from "react";
import stylesContacts from '../Contacts/Contacts.module.scss'
import stylesSettings from '../Settings/Settings.module.scss'
import InputComponent from "../../InputComponent/InputComponent";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { setChat } from "../../store/slices/setChatIDSlice";
import { closeMenu } from "../../store/slices/appSlice";
import { Chat, CurrentUser, TypeChannel } from "../../types/types";
import RemoveFromChannelIcon from '../../assets/person-dash.svg'
import UserInfo from "../MenuComponent/UserInfo";
import { CHANNELS_INFO, messagesAPI } from "../../API/api";
import { doc, DocumentSnapshot, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase";

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

const ChannelFullInfoComponent: FC = () => {

    const [name, setName] = useState('')
    const [list, setList] = useState([])
    const dispatch = useAppDispatch()
    const channel = useAppSelector(state => state.app.selectedChat.channel)
    const currentUser = useAppSelector(state => state.app.currentUser)
    const isOwner = currentUser.uid === channel.owner.uid

    const handleClickName = (user: Chat) => {
        if(user.uid === currentUser.uid) return
        dispatch(setChat({ currentUserEmail: user.email, guestInfo: user }))
        dispatch(closeMenu())
    }

    const removeFromChannel = (e: React.MouseEvent, contact: Chat) => {
        e.stopPropagation()
        //contactsAPI.removeFromContacts(currentUser.email, contact)
        console.log('удалить из канала')
    }

    const handleClick = () => {
        if (channel.owner.uid !== currentUser.uid) {
            messagesAPI.getChatID(currentUser.email, channel.owner.email)
                .then(data => {
                    dispatch(closeMenu(null))
                    dispatch(setChat({ currentUserEmail: currentUser.email, guestInfo: { ...channel.owner, chatID: data } }))
                })
        }
    }
    
    const filter = list.filter(item => item.displayName.includes(name))

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, CHANNELS_INFO, channel.channelID), (doc: DocumentSnapshot<TypeChannel>) => {
            if (doc.data()) setList(doc.data().listOfSubscribers)
        });
        return () => unsubscribe()
    }, [])

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div>
                {currentUser.uid === channel.owner.uid &&
                    <div className={stylesSettings.settings}>
                        <UserInfo isSettings currentInfo={{...currentUser, channel}}/>
                    </div>
                }
            </div>
            <hr className={stylesSettings.hr} />
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
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div className={stylesContacts.item}>
                    <span>Учасники</span>
                </div>
                <InputComponent classes={stylesContacts.item} returnValue={setName} />
                <ul className={stylesContacts.list} style={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
                    {!list.length && <span>Учасники не найдены</span>}
                    {filter.map((item, index) => (
                        <li style={{ margin: '2px 8px' }} key={String(item.uid)} onClick={() => handleClickName(item)}>
                            <span >{item.displayName}</span>
                            {isOwner && <div title="Удалить из канала"
                                onClick={(e) => removeFromChannel(e, item)}
                                        >
                                            <RemoveFromChannelIcon />
                                        </div>}
                        </li>
                    ))}
                    {/* </ul> */}
                </ul>
            </div>
        </div>
    );
}

export default ChannelFullInfoComponent;