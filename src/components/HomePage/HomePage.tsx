import styles from './HomePage.module.scss'
import SearchChatInput from './SearchChatInput';
import MenuIcon from '../../assets/menu-icon.svg'
import classNames from 'classnames';
import ChatList from './ChatList';
import MenuComponent from '../MenuComponent/MenuComponent';
import { useAppDispatch, useAppSelector } from '../../hooks/hook';
import { openMenu } from '../../store/slices/appSlice';
import ChatContent from './ChatContent';

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
                    <div className={styles.item}><SearchChatInput /></div>
                    <div  style={{height: 'calc(100% - 134px)'}}><ChatList /></div>
                </div>
                <ChatContent />
                <MenuComponent />
            </div>
        </div>
    );
}

export default HomaPage;