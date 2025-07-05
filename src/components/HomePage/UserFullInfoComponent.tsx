import { FC, useEffect, useLayoutEffect, useState } from "react";
import stylesContacts from '../Contacts/Contacts.module.scss'
import stylesSettings from '../Settings/Settings.module.scss'
import { useAppSelector } from "../../hooks/hook";
import Avatar from "../Avatar/Avatar";
import DialogComponent from "../Settings/DialogComponent";
import { profileAPI } from "../../API/api";

const UserFullInfoComponent: FC = () => {

    const user = useAppSelector(state => state.app.selectedChat)
    const onlineStatus = useAppSelector(state => state.app.onlineStatusSelectedUser)
    const [userInfo, setUserInfo] = useState(user)
    const [zoomAvatar, setZoomAvatar] = useState(false)

    useLayoutEffect(() => {
        profileAPI.getCurrentInfo(user.uid)
            .then(data => setUserInfo(data))
    }, []);

    return (  
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{margin: '0 auto'}}>
                <div onClick={() => setZoomAvatar(true)} style={{ cursor: 'pointer' }}>
                    <Avatar name={user.displayName} url={user?.photoURL} isOnline={onlineStatus.isOnline}/>
                </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }} className={stylesContacts.item}>
                <div style={{ width: '100%', textAlign: 'start', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 500 }}>
                        Имя:   <span style={{ color: '#8774e1' }}>
                                    {user.displayName}
                                </span>
                    </span>
                </div>
                <div style={{ width: '100%', textAlign: 'start', marginBottom: '4px' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 500 }}>
                        email:   <a href={`mailto:${userInfo.email}`}><span style={{ cursor: 'pointer', color: '#8774e1' }}>
                            {user.email}
                        </span></a>
                    </span>
                </div>
                <div style={{ width: '100%', textAlign: 'start' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 500 }}>
                        Дата регистрации:   <span>
                            {userInfo?.registrationDate?.toString()}
                        </span>
                    </span>
                </div>
            </div>
            {/* <hr className={stylesSettings.hr} /> */}
            {zoomAvatar && 
                <DialogComponent isOpen={zoomAvatar} onClose={setZoomAvatar}>
                    <Avatar name={userInfo.displayName} url={userInfo?.photoURL} zoom/>
                </DialogComponent>
            }
        </div>
    );
}

export default UserFullInfoComponent;