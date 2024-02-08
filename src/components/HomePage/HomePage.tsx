import styles from './HomePage.module.scss'
import SearchChatInput from './SearchChatInput';
import MenuIcon from '../../assets/menu-icon.svg'
import classNames from 'classnames';
import ChatList from './ChatList';
import MenuComponent from '../MenuComponent/MenuComponent';
import { useAppDispatch, useAppSelector } from '../../hooks/hook';
import { openMenu } from '../../store/slices/appSlice';

const HomaPage = () => {

    const dispatch = useAppDispatch()
    const menuState = useAppSelector(state => state.app.menu)
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
                <div className={styles.contentContainer}>content</div>
                <MenuComponent />
            </div>
        </div>
    );
}

export default HomaPage;