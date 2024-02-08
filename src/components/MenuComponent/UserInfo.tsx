import { FC } from "react";
import styles from './MenuComponent.module.scss'
import Avatar from "../Avatar/Avatar";

const UserInfo: FC = () => {

    return (
        <>
            <div className={styles.userInfo}>
                <Avatar url={undefined} name="alex"/>
                <div className={styles.nameBlock}>
                    <span className={styles.name}>nameUser</span>
                    <span className={styles.login}>login</span>
                </div>
            </div>
        </>
    );
}

export default UserInfo;