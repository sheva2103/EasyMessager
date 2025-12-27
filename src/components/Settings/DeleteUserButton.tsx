import { FC, useState } from "react";
import styles from './Settings.module.scss'
import BlackListIcon from '../../assets/ban.svg'
import Preloader from '../../assets/preloader.svg'
import { useTypedTranslation } from "../../hooks/useTypedTranslation";
import DialogComponent from "./DialogComponent";
import DeleteUserForm from "../forms/DeleteUser";

const DeleteUserButton: FC = () => {

    const [isOpen, setIsOpen] = useState(false)
    const { t } = useTypedTranslation()

    return (
        <button className={styles.button} >

            <div className={styles.button__content} onClick={() => setIsOpen(true)}>
                <BlackListIcon color="red" />
                <span>{t('deleteAccount')}</span>
            </div>
            <DialogComponent isOpen={isOpen} onClose={() => setIsOpen(false)}>
                <DeleteUserForm />
            </DialogComponent>
        </button>
    );
}

export default DeleteUserButton;