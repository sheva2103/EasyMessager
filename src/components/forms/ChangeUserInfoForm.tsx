import { FC } from "react";
import styles from './Styles.module.scss'
import classNames from "classnames";
import { useForm } from "react-hook-form";
import { getAuth, updateProfile } from "firebase/auth";
import Preloader from '../../assets/preloader.svg'
import { Chat, CurrentUser, CurrentUserData } from "../../types/types";
import { channelAPI, profileAPI } from "../../API/api";

type Props = {
    changeInfo: boolean,
    setChangeInfo: (state: boolean) => void,
    currentUserInfo: Chat
}

const LOGIN_REGEXP = /^[a-zA-Z0-9_*-]{4,20}$/;
const NAME_CHANNEL_REGEXP = /^[a-zA-Z0-9_*\s-]{4,20}$/;
const URL_REGEXP = /^((ftp|http|https):\/\/)?(www\.)?([A-Za-zА-Яа-я0-9]{1}[A-Za-zА-Яа-я0-9\-]*\.?)*\.{1}[A-Za-zА-Яа-я0-9-]{2,8}(\/([\w#!:.?+=&%@!\-\/])*)?/;

const ChangeUserInfoForm: FC<Props> = ({ changeInfo, setChangeInfo, currentUserInfo }) => {

    const isChannel = !!currentUserInfo?.channel
    const displayName = isChannel ? currentUserInfo.channel.displayName : currentUserInfo.displayName
    const photoURL = isChannel ? currentUserInfo.channel?.photoURL : currentUserInfo.photoURL

    const { handleSubmit, register, formState: { errors, isSubmitting } } = useForm<CurrentUserData>({
        mode: 'onBlur',
        defaultValues: {
            displayName: displayName,
            photoURL: photoURL
        }
    })

    const submit = async (data: CurrentUserData) => {
        if (isChannel) {
            channelAPI.changeCannelInfo({...currentUserInfo.channel, displayName: data.displayName, photoURL: data.photoURL})
                .then(() => setChangeInfo(false))
                .catch(err => console.log('ошибка изменения канала', err))
        } else {
            const auth = getAuth();
            await updateProfile(auth.currentUser, {
                displayName: data.displayName, photoURL: data.photoURL
            }).then(() => {
                profileAPI.changeUserInfo({ ...currentUserInfo, photoURL: data.photoURL, displayName: data.displayName })
                setChangeInfo(false)
            }).catch((error) => {
                console.log('уууупс....')
            });
        }
    }

    return (
        <div className={classNames(styles.changeUserInfo, { [styles.changeUserInfo_show]: changeInfo })}>
            <div className={classNames(styles.changeUserInfo__wrapper, { [styles.changeUserInfo__wrapper_show]: changeInfo })}>
                <form onSubmit={handleSubmit(submit)}>
                    <div className={styles.changeUserInfo__item}>
                        <input type="text"
                            className={classNames({ [styles.error]: errors.displayName })}
                            placeholder="Имя пользователя"
                            {...register('displayName', { maxLength: 20, minLength: 4, pattern: isChannel ? NAME_CHANNEL_REGEXP : LOGIN_REGEXP })}
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