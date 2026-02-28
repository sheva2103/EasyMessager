import StartPage from './StartPage/StartPage';
import './App.scss'
import LoadingApp from './LoadingApp/LoadingApp';
import HomaPage from './HomePage/HomePage';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useAppDispatch, useAppSelector } from '../hooks/hook';
import { setUser, setUserData } from '../store/slices/appSlice';
import { CurrentUser, CurrentUserData } from '../types/types';
import { useTheme } from '../hooks/useTheme';
import { useEffect, useLayoutEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
console.log("%cEasyMessenger by sheva2103, GitHub: https://github.com/sheva2103/easy-messenger, email: 2103sheva@gmail.com", "color: #8774e1; font-size: 16px;");

import { PWAInstallPrompt } from './PWA/PWAInstall';

export const App = () => {

    const { theme, setTheme } = useTheme()
    const [load, setLoad] = useState(true)

    const currentUser = useAppSelector(state => state.app.currentUser)
    const dispatch = useAppDispatch()

    useLayoutEffect(() => {
        const auth = getAuth();

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                let unsubscribeSnapshot: () => void;

                unsubscribeSnapshot = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
                    if (docSnap.exists()) {
                        const currentInfo = docSnap.data()
                        const userData: CurrentUser = {
                            email: currentInfo.email,
                            photoURL: currentInfo.photoURL,
                            displayName: currentInfo.displayName,
                            uid: currentInfo.uid
                        }

                        dispatch(setUser(userData));
                        setLoad(false);

                        if (unsubscribeSnapshot) {
                            unsubscribeSnapshot()
                        }
                    }
                }, (error) => {
                    console.error("Snapshot error:", error);
                    setLoad(false);
                });

            } else {
                dispatch(setUser(null));
                setLoad(false);
            }
        });

        return () => unsubscribeAuth();
    }, [dispatch]);

    useEffect(() => {
        if (currentUser?.uid) {
            const unsub = onSnapshot(doc(db, "users", currentUser.uid), (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data() as CurrentUserData
                    dispatch(setUserData(data))
                } else {
                    console.log("Документ пользователя создается...")
                }
            });
            return () => unsub()
        }
    }, [currentUser?.uid]);

    return (
        <div className='appContainer'>
            {currentUser ? <HomaPage /> : load ? <LoadingApp /> : <StartPage />}
            <PWAInstallPrompt />
        </div>
    );
}
