import { FC } from "react";
import Icon from '../../assets/eazy-messager-icon.svg'
import styles from './LoadingApp.module.scss'


const LoadingApp: FC = () => {
    return (  
        <div className={styles.container}>
            <Icon className={styles.item}/>
        </div>
    );
}

export default LoadingApp;