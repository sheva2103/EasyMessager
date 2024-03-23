import StartPage from './StartPage/StartPage';
import './App.scss'
import LoadingApp from './LoadingApp/LoadingApp';
import HomaPage from './HomePage/HomePage';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useAppDispatch, useAppSelector } from '../hooks/hook';
import { setUser } from '../store/slices/appSlice';
import { CurrentUser } from '../types/types';
import { useTheme } from '../hooks/useTheme';
import { useLayoutEffect, useState } from 'react';


export const App = () => {

    const { theme, setTheme } = useTheme()
    const [load, setLoad] = useState(false)

    const currentUser = useAppSelector(state => state.app.currentUser)
    const dispatch = useAppDispatch()
    useLayoutEffect(() => {
        setLoad(true)
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
            if (user) {
                //const uid = user.uid;
                const userData: CurrentUser = { email: user.email, photoURL: user.photoURL, displayName: user.displayName, uid: user.uid }
                dispatch(setUser(userData))
                setLoad(false)
            } else {
                console.log('никого нет')
                dispatch(setUser(null))
                setLoad(false)
            }
        });
    }, []);

    return (
        <div className='appContainer'>
            {/* <StartPage /> */}
            {/* <LoadingApp /> */}
            {/* <HomaPage /> */}
            {currentUser ? <HomaPage /> : load ? <LoadingApp /> : <StartPage />}
        </div>
    );
}
