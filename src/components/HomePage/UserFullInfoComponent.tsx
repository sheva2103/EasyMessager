import { FC, useEffect, useLayoutEffect, useState } from "react";
import stylesContacts from '../Contacts/Contacts.module.scss'
import stylesSettings from '../Settings/Settings.module.scss'
import { useAppSelector } from "../../hooks/hook";
import Avatar from "../Avatar/Avatar";
import DialogComponent from "../Settings/DialogComponent";
import { profileAPI } from "../../API/api";
import DescriptionComponent from "../Settings/DescriptionComponent";
import { useTypedTranslation } from "../../hooks/useTypedTranslation";

const UserFullInfoComponent: FC = () => {

    const user = useAppSelector(state => state.app.selectedChat)
    const onlineStatus = useAppSelector(state => state.app.onlineStatusSelectedUser)
    const [userInfo, setUserInfo] = useState(user)
    const [zoomAvatar, setZoomAvatar] = useState(false)
    const {t} = useTypedTranslation()
    const description = [
        {title: t('name'), description: userInfo.displayName},
        {title: 'email', description: userInfo.email},
        {title: t("dateOfRegistration"), description: userInfo?.registrationDate?.toString()}
    ]

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
            <div className={stylesContacts.item}>
                <DescriptionComponent items={description}/>
            </div>
            {zoomAvatar && 
                <DialogComponent isOpen={zoomAvatar} onClose={setZoomAvatar}>
                    <Avatar name={userInfo.displayName} url={userInfo?.photoURL} zoom/>
                </DialogComponent>
            }
        </div>
    );
}

export default UserFullInfoComponent;