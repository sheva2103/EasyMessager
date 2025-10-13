import { doc, DocumentData, onSnapshot } from "firebase/firestore";
import { FC, useEffect, useRef } from "react";
import { db } from "../../firebase";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { closeModalCalls, openModalCalls } from "../../store/slices/callsSlice";
import styles from './Styles.module.scss'
import DialogComponent from "../Settings/DialogComponent";
import CallRoom from "./CallRoom";

const CallsListenerComponent: FC = () => {

    const dispatch = useAppDispatch()
    const isOpen = useAppSelector(state => state.calls.isOpen)
    const myUid = useAppSelector(state => state.app.currentUser.uid)
    const callerUid = useAppSelector(state => state.calls.callerUid)

    const close = (action: boolean) => {
        dispatch(closeModalCalls())
    }

    useEffect(() => {
        const callRef = doc(db, 'calls', myUid);
        return onSnapshot(callRef, snapshot => {
            const data = snapshot.data();
            if (data?.status === 'incoming') {
                dispatch(openModalCalls({
                    mode: 'incoming',
                    callerUid: data.from,
                    roomId: data.roomId,
                }))
            }
        });
    }, [myUid]);

    //if(!isOpen) return null

    return ( 
        <div className={styles.container}>
            <DialogComponent isOpen={isOpen} onClose={close}>
                <CallRoom myUid={myUid} calleeUid={callerUid}/>
            </DialogComponent>
        </div>
    )
}

export default CallsListenerComponent;

// import { doc, onSnapshot } from "firebase/firestore";
// import { FC, useEffect, useRef } from "react";
// import { db } from "../../firebase";
// import { useAppDispatch, useAppSelector } from "../../hooks/hook";
// import { closeModalCalls, openModalCalls } from "../../store/slices/callsSlice";
// import styles from './Styles.module.scss'
// import DialogComponent from "../Settings/DialogComponent";
// import CallRoom from "./CallRoom";

// // Предположим, ваш рингтон лежит в папке assets
// import ringtoneSound from '../../assets/ringtone.mp3'

// const CallsListenerComponent: FC = () => {

//     const dispatch = useAppDispatch();
//     const isOpen = useAppSelector(state => state.calls.isOpen);
//     const myUid = useAppSelector(state => state.app.currentUser.uid);
//     const callerUid = useAppSelector(state => state.calls.callerUid);

//     // Создаем ref для хранения аудио-элемента.
//     // Это не вызовет пересоздание объекта при рендерах.
//     const ringtoneRef = useRef(new Audio(ringtoneSound));

//     useEffect(() => {
//         // Настроим рингтон на зацикливание
//         ringtoneRef.current.loop = true;
//     }, []);

//     const close = () => {
//         // Останавливаем рингтон при закрытии модального окна
//         ringtoneRef.current.pause();
//         ringtoneRef.current.currentTime = 0; // Сбрасываем время
//         dispatch(closeModalCalls());
//     }

//     useEffect(() => {
//         if (!myUid) return;

//         const callRef = doc(db, 'calls', myUid);
//         const unsubscribe = onSnapshot(callRef, snapshot => {
//             const data = snapshot.data();
            
//             if (data?.status === 'incoming') {
//                 // Воспроизводим рингтон
//                 ringtoneRef.current.play().catch(error => {
//                     // Обработка ошибки, если автовоспроизведение все равно не удалось
//                     console.error("Audio autoplay was prevented: ", error);
//                 });

//                 dispatch(openModalCalls({
//                     mode: 'incoming',
//                     callerUid: data.from,
//                     roomId: data.roomId,
//                 }));
//             } else {
//                 // Если статус изменился (звонок принят, отклонен или отменен)
//                 // останавливаем рингтон.
//                 ringtoneRef.current.pause();
//                 ringtoneRef.current.currentTime = 0;
//             }
//         });

//         // Отписываемся от слушателя при размонтировании компонента
//         return () => unsubscribe();
        
//     }, [myUid, dispatch]);

//     if (!isOpen) return null;

//     return ( 
//         <div className={styles.container}>
//             <DialogComponent isOpen={isOpen} onClose={close}>
//                 {/* Убедитесь, что CallRoom больше не управляет рингтоном */}
//                 <CallRoom myUid={myUid} calleeUid={callerUid} />
//             </DialogComponent>
//         </div>
//     )
// }

// export default CallsListenerComponent;