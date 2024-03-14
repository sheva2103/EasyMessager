import { FC, useState } from "react";
import MenuIcon from '../../assets/menu.svg'
import styles from './HomePage.module.scss'
import classNames from "classnames";

const UserManagementMenu: FC = () => {

    const [isOpen, setOpen] = useState(false)

    return (  
        <>
            <div 
                className={classNames(styles.menu__cover, {[styles.menu_show]: isOpen})}
                onClick={() => setOpen(!isOpen)}
                ></div>
            <div className={styles.menu__button}>
                <MenuIcon 
                    cursor={'pointer'} 
                    fontSize={'1.3rem'}
                    onClick={() => setOpen(!isOpen)}
                    />
                <div className={classNames(styles.menu__list, {[styles.menu_show]: isOpen})}>
                    <ul>
                        <li>Добавить в контакты</li>
                        <li>Удалить из контактов</li>
                        <li>Добавить в ЧС</li>
                    </ul>
                </div>
            </div>
        </>
    );
}
 
export default UserManagementMenu;