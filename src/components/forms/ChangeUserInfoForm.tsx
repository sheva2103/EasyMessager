import { FC } from "react";
import styles from './Styles.module.scss'
import classNames from "classnames";

type Props = {
    changeInfo: boolean,
    setChangeInfo: (state: boolean) => void
}

const ChangeUserInfoForm: FC<Props> = ({changeInfo, setChangeInfo}) => {
    return (
        <div className={classNames(styles.changeUserInfo, {[styles.changeUserInfo_show]: changeInfo})}>
            <div className={classNames(styles.changeUserInfo__wrapper, {[styles.changeUserInfo__wrapper_show]: changeInfo})}>
                <div className={styles.changeUserInfo__item}>
                    <input type="text" placeholder="Имя пользователя"/>
                </div>
                <div className={styles.changeUserInfo__item}>
                    <input type="text" placeholder="Photo URL"/>
                </div>
                <div className={styles.changeUserInfo__item}>
                    <button onClick={() => setChangeInfo(false)}>save</button>
                </div>
            </div>
        </div>
    );
}

export default ChangeUserInfoForm;