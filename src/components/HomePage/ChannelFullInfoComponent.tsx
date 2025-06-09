import { FC, useState } from "react";
import stylesContacts from '../Contacts/Contacts.module.scss'
import stylesSettings from '../Settings/Settings.module.scss'
import InputComponent from "../../InputComponent/InputComponent";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { setChat } from "../../store/slices/setChatIDSlice";
import { closeMenu } from "../../store/slices/appSlice";
import { Chat } from "../../types/types";
import RemoveFromChannelIcon from '../../assets/person-dash.svg'
import UserInfo from "../MenuComponent/UserInfo";
import { messagesAPI } from "../../API/api";

const ChannelFullInfoComponent: FC = () => {

    const [name, setName] = useState('')
    const [list, setList] = useState([])
    const dispatch = useAppDispatch()
    const channel = useAppSelector(state => state.app.selectedChat.channel)
    const currentUser = useAppSelector(state => state.app.currentUser)
    const isOwner = currentUser.uid === channel.owner.uid

    const handleClickName = (user: Chat) => {
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

    return (
        <>
            <div className={stylesSettings.settings}>
                <UserInfo isSettings />
            </div>
            <hr className={stylesSettings.hr} />
            <div className={stylesContacts.container}>
                <div className={stylesContacts.item}>
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
            </div>
            <hr className={stylesSettings.hr} />
            <div className={stylesContacts.container}>
                <div className={stylesContacts.item}>
                    <span>Учасники</span>
                </div>
                <InputComponent classes={stylesContacts.item} returnValue={setName} />
                <div className={stylesContacts.item}>
                    <ul className={stylesContacts.list}>
                        {!list.length && <span>Учасники не найдены</span>}
                        {list.map((item, index) => (
                            <li key={String(item.uid)} onClick={() => handleClickName(item)}>
                                <span >{item.displayName}</span>
                                {isOwner && <div title="Удалить из канала"
                                    onClick={(e) => removeFromChannel(e, item)}
                                >
                                    <RemoveFromChannelIcon />
                                </div>}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}

export default ChannelFullInfoComponent;