// // hooks/usePresenceStatus.ts
// import { useEffect, useState } from "react";
// import { getFirestore, doc, onSnapshot } from "firebase/firestore";

// type PresenceStatus = {
//     online: boolean;
//     last_changed: number;
// };

// const usePresenceStatus = (uid: string) => {
//     const [status, setStatus] = useState<PresenceStatus | null>(null);

//     useEffect(() => {
//         const firestore = getFirestore();
//         const ref = doc(firestore, "users", uid);

//         const unsubscribe = onSnapshot(ref, (snapshot) => {
//             if (snapshot.exists()) {
//                 const data = snapshot.data();
//                 setStatus({
//                     online: !!data.online,
//                     last_changed: data.last_changed || 0,
//                 });
//             }
//         });

//         return () => unsubscribe();
//     }, [uid]);

//     return status;
// };

// export default usePresenceStatus;

// hooks/usePresenceStatus.ts
// import { useEffect, useState } from "react";
// import { getFirestore, doc, onSnapshot } from "firebase/firestore";

// type PresenceStatus = {
//     last_seen: number;
// };

// const usePresenceStatus = (uid: string) => {
//     const [status, setStatus] = useState<PresenceStatus | null>(null);

//     useEffect(() => {
//         const firestore = getFirestore();
//         const userRef = doc(firestore, "users", uid);

//         const unsubscribe = onSnapshot(userRef, (snapshot) => {
//             if (snapshot.exists()) {
//                 const data = snapshot.data();
//                 setStatus({
//                     last_seen: data.last_seen || 0,
//                 });
//             }
//         });

//         return () => unsubscribe();
//     }, [uid]);

//     return status;
// };

// export default usePresenceStatus;

// import { useState, useEffect } from "react";
// import { getFirestore, doc, onSnapshot } from "firebase/firestore";

// type PresenceStatus = {
//     last_seen: number;
// };

// type UsePresenceReturn = {
//     status: PresenceStatus | null;
//     isOnline: boolean;
// };

// const usePresenceStatus = (uid: string): UsePresenceReturn => {
//     const [status, setStatus] = useState<PresenceStatus | null>(null);
//     const [isOnline, setIsOnline] = useState<boolean>(false);

//     useEffect(() => {
//         const firestore = getFirestore();
//         const userRef = doc(firestore, "users", uid);
//         let lastSeen = 0;
//         let intervalId: any;

//         const updateOnlineStatus = () => {
//             const now = Date.now();
//             setIsOnline(now - lastSeen < 65000); // 65 сек граница
//         };

//         const unsubscribe = onSnapshot(userRef, (snapshot) => {
//             if (snapshot.exists()) {
//                 const data = snapshot.data();
//                 lastSeen = data.last_seen || 0;
//                 setStatus({ last_seen: lastSeen });
//                 updateOnlineStatus(); // сразу обновляем статус
//             }
//         });

//         intervalId = setInterval(updateOnlineStatus, 10000); // каждые 10 сек

//         return () => {
//             unsubscribe();
//             clearInterval(intervalId);
//         };
//     }, [uid]);

//     return { status, isOnline };
// };



import { useState, useEffect } from "react";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { formatStyle } from "../utils/utils";
import { PresenceStatus, UsePresenceReturn } from "../types/types";
import { useTypedTranslation } from "./useTypedTranslation";

export const usePresenceStatus = (uid: string): UsePresenceReturn => {
    const [status, setStatus] = useState<PresenceStatus | null>(null);
    const [isOnline, setIsOnline] = useState<boolean>(false);
    const [formatted, setFormatted] = useState<string>("");
    const {t, i18n} = useTypedTranslation()

    useEffect(() => {
        const firestore = getFirestore();
        const userRef = doc(firestore, "users", uid);
        let lastSeen = 0;
        let intervalId: any;

        const updateOnlineStatus = () => {
            const now = Date.now();
            const isStillOnline = now - lastSeen < 65000;
            setIsOnline(isStillOnline);
            setFormatted(formatStyle(lastSeen, t,i18n));
        };

        const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                lastSeen = data.last_seen || 0;
                setStatus({ last_seen: lastSeen });
                updateOnlineStatus();
            }
        });

        intervalId = setInterval(updateOnlineStatus, 10000);

        return () => {
            unsubscribe();
            clearInterval(intervalId);
        };
    }, [uid]);

    return { status, isOnline, formatted };
};

export default usePresenceStatus;