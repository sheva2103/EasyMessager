import { FC } from "react";
import CloseMenuIcon from '../../assets/closeDesktop.svg'
import ArrowBackLeft from '../../assets/box-arrow-left.svg'
import styles from './MenuComponent.module.scss'
import { useAppDispatch } from "../../hooks/hook";
import { closeMenu } from "../../store/slices/appSlice";
import classNames from "classnames";

type Props = {
    left?: boolean
}

const CloseMenu: FC<Props> = ({left}) => {

    const dispatch = useAppDispatch()

    return (  
        <div className={styles.close}>
            <div className={classNames(styles.closeMobile, {[styles.closeMenuLeft]: left})}>
                <ArrowBackLeft 
                    fontSize={'1.5rem'}
                    onClick={() => dispatch(closeMenu())}
                />
            </div>
            <div className={styles.closeDesktop}>
                <CloseMenuIcon 
                    fontSize={'1.3rem'} 
                    cursor={'pointer'}
                    onClick={() => dispatch(closeMenu())}
                    />
            </div>
        </div>
    );
}

export default CloseMenu;