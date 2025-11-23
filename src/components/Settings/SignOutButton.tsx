import { FC, useState } from "react";
import styles from './Settings.module.scss'
import { getAuth, signOut } from "firebase/auth";
import ArrowLeft from '../../assets/box-arrow-left.svg'
import Preloader from '../../assets/preloader.svg'
import { useTypedTranslation } from "../../hooks/useTypedTranslation";

const SignOutButton: FC = () => {

    const [load, setLoad] = useState(false)
    const {t} = useTypedTranslation()

    const handleClick = async () => {
        setLoad(true)
        const auth = getAuth();
        setTimeout(() => {
            signOut(auth).then(() => {
                console.log('signout')
            }).catch((error) => {
                console.log(error.code)
            }).finally(() => setLoad(false))
        }, 1500)
    }

    return (
            <button className={styles.button} onClick={handleClick}>
                {!load ?
                    <div className={styles.button__content}>
                        <ArrowLeft />
                        <span>{t('logOut')}</span>
                    </div>
                    :
                    <Preloader />
                }
            </button>
    );
}

export default SignOutButton;