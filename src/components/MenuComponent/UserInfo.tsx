import { FC, useState } from "react";
import styles from './MenuComponent.module.scss'
import Avatar from "../Avatar/Avatar";
import ChangeIcon from '../../assets/change.svg'
import ChangeUserInfoForm from "../forms/ChangeUserInfoForm";
import { useAppSelector } from "../../hooks/hook";
import { Chat } from "../../types/types";
import DialogComponent from "../Settings/DialogComponent";

type Props = {
    isSettings?: boolean,
    currentInfo: Chat
}

const UserInfo: FC<Props> = ({ isSettings, currentInfo }) => {

    const [changeInfo, setChangeInfo] = useState(false)
    const currentUserInfo = useAppSelector(state => state.app.currentUser)
    const avatarUrl = currentInfo?.channel ? currentInfo.channel.photoURL : currentInfo.photoURL
    const displayName = currentInfo?.channel ? currentInfo.channel.displayName : currentInfo.displayName
    const [zoomAvatar, setZoomAvatar] = useState(false)

    return (
        <div className={styles.userInfoContainer}>
            <div className={styles.userInfo}>
                <div onClick={() => setZoomAvatar(true)} style={{ cursor: 'pointer' }}>
                    <Avatar url={avatarUrl} name={displayName} />
                </div>
                <div className={styles.nameBlock}>
                    <span className={styles.name}>{displayName}</span>
                    {!currentInfo?.channel && <span className={styles.login}>{currentUserInfo.email}</span>}
                </div>
                {isSettings &&
                    <div className={styles.userInfo__change} title="Изменить">
                        <ChangeIcon fontSize={'1.1rem'} cursor={'pointer'} onClick={() => setChangeInfo((prev) => !prev)} />
                    </div>
                }
            </div>
            {isSettings && <ChangeUserInfoForm 
                                changeInfo={changeInfo} 
                                setChangeInfo={setChangeInfo} 
                                currentUserInfo={currentInfo}/>
            }
            {zoomAvatar && 
                <DialogComponent isOpen={zoomAvatar} onClose={setZoomAvatar}>
                    <Avatar url={avatarUrl} name={displayName} zoom/>
                </DialogComponent>
            }
        </div>
    );
}

export default UserInfo;