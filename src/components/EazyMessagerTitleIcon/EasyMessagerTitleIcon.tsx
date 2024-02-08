import { FC } from "react";
import EazyMessagerIcon from '../../assets/eazy-messager-icon.svg'
import styles from './EasyMessagerTitleIcon.module.scss'

const EazyMessagerTitleIcon: FC = () => {
    return ( 
        <div className={styles.container}>
            <EazyMessagerIcon fontSize={'64px'} color="#8774e1"/>
            <div style={{fontSize: '1.3rem', fontWeight: 'bold', color: "#8774e1", fontStyle: 'italic'}}>
                <span>Easy</span><br /><span>Messager</span>
            </div>
        </div>
    );
}

export default EazyMessagerTitleIcon;