import { FC } from "react";
import styles from './MenuComponent.module.scss'
import classNames from "classnames";
import CreateChannelIcon from '../../assets/chat.svg'
import SettingsIcon from '../../assets/settings.svg'
import ContactsIcon from '../../assets/contacts.svg'
import FavoritesIcon from '../../assets/favorites.svg'
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { closeBar, closeMenu } from "../../store/slices/appSlice";
import { CONTACTS, CREATE_CHANNEL, SETTINGS } from "../../constants/constants";
import MenuChild from "./MenuChild";
import UserInfo from "./UserInfo";
import CloseMenu from "./CloseMenu";

const MenuComponent: FC = () => {

    const isOpen = useAppSelector(state => state.app.menu)
    const dispatch = useAppDispatch()

    const stopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation()
    }

    return (
        <div>
            <div 
                className={classNames(styles.cover, { [styles.coverShow]: isOpen.cover })}
                onClick={() => dispatch(closeMenu())}>
            </div>
            <nav className={classNames(styles.appBar, { [styles.showAppBar]: isOpen.bar })}>
                <CloseMenu />
                <UserInfo />
                <div>
                    <ul className={styles.list}>
                        <li onClick={() => dispatch(closeBar(CREATE_CHANNEL))}>
                            <CreateChannelIcon /><span>Создать канал</span>
                        </li>
                        <li onClick={() => dispatch(closeBar(SETTINGS))}>
                            <SettingsIcon /><span>Настройки</span>
                        </li>
                        <li onClick={() => dispatch(closeBar(CONTACTS))}>
                            <ContactsIcon /><span>Контакты</span>
                        </li>
                        <li><FavoritesIcon /><span>Избранное</span></li>
                    </ul>
                </div>
            </nav>
            <div className={classNames(styles.barChild, { [styles.showBarChild]: Boolean(isOpen.menuChild) })}>
                <MenuChild />
            </div>
        </div>
    );
}

export default MenuComponent;