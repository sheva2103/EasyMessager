import { FC, useEffect, useRef } from "react";
import Preloader from '../../assets/preloader.svg'
import { useAppSelector } from "../../hooks/hook";
import styles from './HomePage.module.scss'



const DownloadMoreMessages: FC = () => {

    const loading = useAppSelector(state => state.app.moreMessages)

    return (
        <div style={{ textAlign: 'center', padding: '4px 0 0 0' }}>
            {/* <Preloader fontSize={'1.8rem'}/> */}
            <div className={styles.loadMoreMessages}></div>
        </div>
    );
}

// const AnimatedComponent = () => {
//     const requestRef = useRef<any>();

//     const animate = () => {
//         // Логика анимации здесь
//         // Например, изменение состояния для анимации
//         requestRef.current = requestAnimationFrame(animate);
//     };

//     useEffect(() => {
//         requestRef.current = requestAnimationFrame(animate);
//         return () => cancelAnimationFrame(requestRef.current);
//     }, []);

//     return (
//         <div>
//             <DownloadMoreMessages />
//         </div>
//     );
// };


export default DownloadMoreMessages;
// export default AnimatedComponent