import { FC, useState } from "react";
import styles from './MenuComponent.module.scss'
import Avatar from "../Avatar/Avatar";
import ChangeIcon from '../../assets/change.svg'
import ChangeUserInfoForm from "../forms/ChangeUserInfoForm";
import { useAppSelector } from "../../hooks/hook";

type Props = {
    isSettings?: boolean
}

const UserInfo: FC<Props> = ({ isSettings }) => {

    const [changeInfo, setChangeInfo] = useState(false)
    const login = useAppSelector(state => state.app.currentUser.email)
    const nameUser = useAppSelector(state => state.app.currentUser.displayName)

    return (
        <div className={styles.userInfoContainer}>
            <div className={styles.userInfo}>
                <Avatar url={undefined} name="alex" />
                <div className={styles.nameBlock}>
                    <span className={styles.name}>{nameUser || 'Имя не указано'}</span>
                    <span className={styles.login}>{login}</span>
                </div>
                {isSettings &&
                    <div className={styles.userInfo__change} title="Изменить">
                        <ChangeIcon fontSize={'1.1rem'} cursor={'pointer'} onClick={() => setChangeInfo((prev) => !prev)} />
                    </div>
                }
            </div>
            {isSettings && <ChangeUserInfoForm changeInfo={changeInfo} setChangeInfo={setChangeInfo} />}
        </div>
    );
}

export default UserInfo;