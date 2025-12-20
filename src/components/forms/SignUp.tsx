import { FC } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import PasswordInput from './PasswordInput';
import EazyMessagerTitleIcon from '../EazyMessagerTitleIcon/EasyMessagerTitleIcon';
import ConfirmPasswordInput from './ConfirmPasswordInput';
import { SignInSignUpForm } from '../../types/types';
import RememberMeInput from './RememberMeInput';
import LoginInput from './LoginInput';
import ButtonSubmit from './ButtonSubmit';
import { getAuth, createUserWithEmailAndPassword, setPersistence, browserSessionPersistence } from "firebase/auth";
import EmailInput from './EmailInput';
import { channelAPI, messagesAPI, profileAPI } from '../../API/api';
import { createObjectChannel } from '../../utils/utils';

const ERROR_NEW_EMAIL = 'auth/email-already-in-use'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const SignUp: FC = () => {

    const { register, watch, handleSubmit, formState: { errors, isValid, isSubmitting }, reset, setError } = useForm<SignInSignUpForm>({
        mode: 'onChange'
    })

    const submit: SubmitHandler<SignInSignUpForm> = async (data) => {
        // await sleep(5000).then(data => {
        //     console.log('всё')
        //     setError('email', { message: 'такой уже есть' })
        // })
        // console.log(data)
        //reset()
        //setError('email', {message: 'такой уже есть'})

        const auth = getAuth();
        // await createUserWithEmailAndPassword(auth, data.email, data.password)
        //     .then((userCredential) => {
        //         const user = userCredential.user;
        //         profileAPI.createNewUserInDB(user)
        //         if (!data.rememberMe) {
        //             setPersistence(auth, browserSessionPersistence)
        //         }
        //     })
        //     .catch((error: any) => {
        //         const errorCode = error.code;
        //         //const errorMessage = error.message;
        //         console.log(errorCode)
        //         if (errorCode === ERROR_NEW_EMAIL) setError('email', { message: 'Такой пользователь уже существует' })
        //     });
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password)
            const user = userCredential.user
            const userObj = await profileAPI.createNewUserInDB(user)
            if (!data.rememberMe) {
                await setPersistence(auth, browserSessionPersistence)
            }
            const reservedСhannel = await channelAPI.getCurrentInfo('2c67b2bf-06bb-423b-a26d-041eda2d0ffc')
            await messagesAPI.addChat(userObj, createObjectChannel(reservedСhannel), reservedСhannel.channelID)
        } catch(error: any) {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Ошибка при регистрации:', error);
            console.log(errorCode, '>>>>', errorMessage)
            if (errorCode === ERROR_NEW_EMAIL) setError('email', { message: 'Такой пользователь уже существует' })
        }

    }

    return (
        <div>
            <EazyMessagerTitleIcon />
            <form onSubmit={handleSubmit(submit)}>
                <EmailInput register={register} errors={errors} isSubmitting={isSubmitting} />
                {/* <LoginInput register={register} errors={errors} isSubmitting={isSubmitting} signUp /> */}
                <PasswordInput register={register} errors={errors} isSubmitting={isSubmitting} />
                <ConfirmPasswordInput register={register} errors={errors} password={watch('password')} isSubmitting={isSubmitting} />
                <RememberMeInput register={register} />
                <ButtonSubmit isSubmitting={isSubmitting} signUp />
            </form>
        </div>
    );
}

export default SignUp;