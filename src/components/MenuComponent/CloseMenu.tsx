import { FC } from "react";
import CloseMenuIcon from '../../assets/closeDesktop.svg'
import ArrowBackLeft from '../../assets/box-arrow-left.svg'
import styles from './MenuComponent.module.scss'
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { clearSelectedMessage, closeMenu } from "../../store/slices/appSlice";
import classNames from "classnames";

type Props = {
    left?: boolean
}

const CloseMenu: FC<Props> = ({left}) => {

    const dispatch = useAppDispatch()
    const isSend = useAppSelector(state => state.app.isSendMessage)

    const handleClick = () => {
        if(isSend) dispatch(clearSelectedMessage())
        dispatch(closeMenu())
    }

    return (  
        <div className={styles.close}>
            <div className={classNames(styles.closeMobile, {[styles.closeMenuLeft]: left})}>
                <ArrowBackLeft 
                    fontSize={'1.5rem'}
                    onClick={handleClick}
                />
            </div>
            <div className={styles.closeDesktop}>
                <CloseMenuIcon 
                    fontSize={'1.3rem'} 
                    cursor={'pointer'}
                    onClick={handleClick}
                    />
            </div>
        </div>
    );
}

export default CloseMenu;