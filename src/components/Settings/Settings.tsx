import { FC, useEffect, useState } from "react";
import UserInfo from "../MenuComponent/UserInfo";
import styles from './Settings.module.scss'
import ToggleTheme from "../TogleTheme/ToggleTheme";
import Select from "./Select";
import LangIcon from '../../assets/translate.svg'
import BlackList from "./BlackList";
import SignOutButton from "./SignOutButton";
import { useAppSelector } from "../../hooks/hook";
import { useTranslation } from "react-i18next";
import DeleteUserButton from "./DeleteUserButton";

import React from "react";

const AuthorSignature: React.FC = () => {
    return (
        <div style={{ fontSize: "12px", color: "#666", textAlign: "center", marginTop: "10px" }}>
            © 2025 sheva2103 (EMAIL: 2103sheva@gmail.com)
        </div>
    );
};

const ReloadButton: React.FC = () => {
    const [isPWA, setIsPWA] = useState(false);

    useEffect(() => {
        const isStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone === true;

        setIsPWA(isStandalone);
    }, []);

    const handleReload = () => {
        window.location.reload();
    };

    if (!isPWA) return null

    return (
        <div className={styles.item}>
            <button onClick={handleReload}>Обновить</button>
        </div>
    );
};



const Settings: FC = () => {
    const { t } = useTranslation()
    const currentUser = useAppSelector(state => state.app.currentUser)

    return (
        <div className={styles.settings}>
            <UserInfo isSettings currentInfo={currentUser} />
            <hr className={styles.hr} />
            <div className={styles.group}>
                <div className={styles.item}>
                    <ToggleTheme />
                </div>
                <div className={styles.item}>
                    <div className={styles.container}>
                        <div>
                            <LangIcon fontSize={'1.2rem'} />
                        </div>
                        <div className={styles.containerItem}>
                            <div>
                                <span>{t("language")}</span>
                            </div>
                            <div>
                                <Select />
                            </div>
                        </div>
                    </div>
                </div>
                <ReloadButton />
            </div>
            <hr className={styles.hr} />
            <div className={styles.group}>
                <BlackList />
            </div>
            <hr className={styles.hr} />
            <div className={styles.group} style={{ flexDirection: 'row' }}>
                <SignOutButton />
                <DeleteUserButton />
            </div>
            <AuthorSignature />
        </div>
    );
}

export default Settings;