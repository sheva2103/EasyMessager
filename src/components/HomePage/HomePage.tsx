import styles from './HomePage.module.scss'
import MenuIcon from '../../assets/menu-icon.svg'
import classNames from 'classnames';
import MenuComponent from '../MenuComponent/MenuComponent';
import { useAppDispatch } from '../../hooks/hook';
import { openMenu } from '../../store/slices/appSlice';
import ChatContent from './ChatContent';
import ChatList1 from './ChatList';

const HomaPage = () => {

    const dispatch = useAppDispatch()
    const handleClickMenu = () => {
        dispatch(openMenu())
    }

    return (  
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.chatListContainer}>
                    <div className={classNames(styles.menuIcon, styles.item)}>
                        <MenuIcon 
                            fontSize={'28px'}
                            cursor={'pointer'}
                            onClick={handleClickMenu}
                            />
                    </div>
                    <ChatList1 />
                </div>
                <ChatContent />
                <MenuComponent />
            </div>
        </div>
    );
}

export default HomaPage;