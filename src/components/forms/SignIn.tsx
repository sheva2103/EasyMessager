import { FC } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import EazyMessagerTitleIcon from '../EazyMessagerTitleIcon/EasyMessagerTitleIcon';
import PasswordInput from './PasswordInput';
import RememberMeInput from './RememberMeInput';
import LoginInput from './LoginInput';
import { CurrentUser, SignInSignUpForm } from '../../types/types';
import ButtonSubmit from './ButtonSubmit';
import { browserSessionPersistence, getAuth, setPersistence, signInWithEmailAndPassword } from "firebase/auth";
import EmailInput from './EmailInput';
import styles from './Styles.module.scss'
import { useAppDispatch } from '../../hooks/hook';
import { setUser } from '../../store/slices/appSlice';
import { useTypedTranslation } from '../../hooks/useTypedTranslation';

const ERROR_DATA = 'auth/invalid-credential'
const TOO_MANY_REQUESTS = 'too-many-requests'
const AUTH_TOO_MANY_REQUESTS = 'auth/too-many-requests'


const SignIn: FC = () => {

    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setError, clearErrors } = useForm<SignInSignUpForm>({
        mode: 'onChange'
    })

    const dispatch = useAppDispatch()
    const {t} = useTypedTranslation()

    const submit: SubmitHandler<SignInSignUpForm> = async (data) => {

        console.log(data)
        const auth = getAuth();
        await signInWithEmailAndPassword(auth, data.email, data.password)
            .then((userCredential) => {
                const user = userCredential.user;
                const userInfo: CurrentUser = {email: user.email, displayName: user.displayName, photoURL: user.photoURL, uid: user.uid}
                if(!data.rememberMe) {
                    setPersistence(auth, browserSessionPersistence)
                }
            })
            .catch((error: any) => {
                const errorCode = error.code;
                //const errorMessage = error.message;
                if(errorCode === ERROR_DATA) setError('dataError', { message: t('form.errorSignIn') })
                if(errorCode === TOO_MANY_REQUESTS || errorCode === AUTH_TOO_MANY_REQUESTS) setError('dataError', { message: t('form.errorServer') })
                console.log(errorCode)
            })
    }

    return (
        <div>
            <EazyMessagerTitleIcon />
            <form onSubmit={handleSubmit(submit)}>
                {/* <LoginInput register={register} isSubmitting={isSubmitting} errors={errors} /> */}
                <EmailInput register={register} isSubmitting={isSubmitting} errors={errors}/>
                <PasswordInput register={register} errors={errors} isSubmitting={isSubmitting} signIn />
                <div className={styles.error}>
                    {errors.dataError && <span>{errors.dataError.message}</span>}
                </div>
                <RememberMeInput register={register} />
                <ButtonSubmit isSubmitting={isSubmitting} signIn clearErrors={clearErrors}/>
            </form>
        </div>
    );
}

export default SignIn;