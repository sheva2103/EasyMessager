import { FC } from "react";
import styles from './Styles.module.scss'
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { getAuth, updateProfile } from "firebase/auth";
import Preloader from '../../assets/preloader.svg'
import { useAppDispatch } from "../../hooks/hook";
import { setUserData } from "../../store/slices/appSlice";
import { CurrentUserData } from "../../types/types";

type Props = {
    changeInfo: boolean,
    setChangeInfo: (state: boolean) => void,
    displayName: string,
    photoURL: string
}

const LOGIN_REGEXP = /^[a-zA-Z0-9_*-]{6,20}$/;
const URL_REGEXP = /^((ftp|http|https):\/\/)?(www\.)?([A-Za-zА-Яа-я0-9]{1}[A-Za-zА-Яа-я0-9\-]*\.?)*\.{1}[A-Za-zА-Яа-я0-9-]{2,8}(\/([\w#!:.?+=&%@!\-\/])*)?/;

const ChangeUserInfoForm: FC<Props> = ({ changeInfo, setChangeInfo, displayName, photoURL }) => {

    const dispatch = useAppDispatch()
    const { handleSubmit, register, formState: { errors, isSubmitting } } = useForm<CurrentUserData>({
        mode: 'onBlur',
        defaultValues: {
            displayName: displayName,
            photoURL: photoURL
        }
    })

    const submit = async (data: CurrentUserData) => {
        const auth = getAuth();
        await updateProfile(auth.currentUser, {
            displayName: data.displayName, photoURL: data.photoURL
        }).then(() => {
            setChangeInfo(false)
            dispatch(setUserData(data))
        }).catch((error) => {
            console.log('уууупс....')
        });
    }

    return (
        <div className={classNames(styles.changeUserInfo, { [styles.changeUserInfo_show]: changeInfo })}>
            <div className={classNames(styles.changeUserInfo__wrapper, { [styles.changeUserInfo__wrapper_show]: changeInfo })}>
                <form onSubmit={handleSubmit(submit)}>
                    <div className={styles.changeUserInfo__item}>
                        <input type="text"
                            className={classNames({ [styles.error]: errors.displayName })}
                            placeholder="Имя пользователя"
                            {...register('displayName', { maxLength: 20, minLength: 6, pattern: LOGIN_REGEXP })}
                        />
                    </div>
                    <div className={styles.changeUserInfo__item}>
                        <input type="text"
                            className={classNames({ [styles.error]: errors.photoURL })}
                            placeholder="Photo URL"
                            {...register('photoURL', { pattern: URL_REGEXP })}
                        />
                    </div>
                    <div className={styles.changeUserInfo__item}>
                        <button disabled={isSubmitting}>
                            {isSubmitting ? <Preloader /> : 'Сохранить'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChangeUserInfoForm;