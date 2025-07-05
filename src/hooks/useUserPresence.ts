// // hooks/useUserPresence.ts
// import { useEffect } from "react";
// import { getDatabase, ref, onDisconnect, set, onValue } from "firebase/database";
// import { getFirestore, doc, updateDoc } from "firebase/firestore";
// import { getAuth } from "firebase/auth";

// const useUserPresence = () => {
//     useEffect(() => {
//         const auth = getAuth();
//         const user = auth.currentUser;
//         if (!user) return;

//         const uid = user.uid;
//         const db = getDatabase();
//         const firestore = getFirestore();

//         const userStatusDatabaseRef = ref(db, `/status/${uid}`);
//         const userStatusFirestoreRef = doc(firestore, "users", uid);

//         const isOfflineForDatabase = {
//             state: "offline",
//             last_changed: Date.now(),
//         };

//         const isOnlineForDatabase = {
//             state: "online",
//             last_changed: Date.now(),
//         };

//         const isOfflineForFirestore = {
//             online: false,
//             last_changed: Date.now(),
//         };

//         const isOnlineForFirestore = {
//             online: true,
//             last_changed: Date.now(),
//         };

//         const connectedRef = ref(db, ".info/connected");
//         const unsubscribe = onValue(connectedRef, (snapshot) => {
//             if (snapshot.val() === false) {
//                 updateDoc(userStatusFirestoreRef, isOfflineForFirestore);
//                 return;
//             }

//             onDisconnect(userStatusDatabaseRef)
//                 .set(isOfflineForDatabase)
//                 .then(() => {
//                     set(userStatusDatabaseRef, isOnlineForDatabase);
//                     updateDoc(userStatusFirestoreRef, isOnlineForFirestore);
//                 });
//         });

//         return () => unsubscribe();
//     }, []);
// };

// export default useUserPresence;

// hooks/useUserPresence.ts
// import { useEffect } from "react";
// import { getFirestore, doc, updateDoc } from "firebase/firestore";
// import { getAuth, onAuthStateChanged } from "firebase/auth";

// const useUserPresence = () => {
//     useEffect(() => {
//         const auth = getAuth();
//         const unsubscribe = onAuthStateChanged(auth, async (user) => {
//             if (!user) return;

//             const uid = user.uid;
//             const firestore = getFirestore();
//             const userDoc = doc(firestore, "users", uid);

//             await updateDoc(userDoc, {
//                 last_seen: Date.now(),
//             });
//         });

//         return () => unsubscribe();
//     }, []);
// };

// export default useUserPresence;
import { useEffect } from "react";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const useUserPresence = () => {
    useEffect(() => {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const uid = user.uid;
        const firestore = getFirestore();
        const userDoc = doc(firestore, "users", uid);

        const updateLastSeen = async () => {
            await updateDoc(userDoc, {
                last_seen: Date.now(),
            });
        };

        updateLastSeen();

        const interval = setInterval(() => {
            updateLastSeen();
        }, 60000);

        return () => clearInterval(interval);
    }, []);
};

export default useUserPresence;