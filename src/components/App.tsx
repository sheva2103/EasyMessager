import StartPage from './StartPage/StartPage';
import './App.scss'
import LoadingApp from './LoadingApp/LoadingApp';
import HomaPage from './HomePage/HomePage';
import { getAuth, onAuthStateChanged } from "firebase/auth";


export const App = () => {

    // const auth = getAuth();
    // onAuthStateChanged(auth, (user) => {
    //     if (user) {
    //         const uid = user.uid;
    //         console.log(uid)
    //     } else {
    //         console.log('никого нет')
    //     }
    // });

    return (
        <div className='appContainer'>
            <StartPage />
            {/* <LoadingApp /> */}
            {/* <HomaPage /> */}
        </div>
    );
}
