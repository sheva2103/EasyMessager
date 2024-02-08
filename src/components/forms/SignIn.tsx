import { FC } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import EazyMessagerTitleIcon from '../EazyMessagerTitleIcon/EasyMessagerTitleIcon';
import PasswordInput from './PasswordInput';
import RememberMeInput from './RememberMeInput';
import LoginInput from './LoginInput';
import { SignInSignUpForm } from '../../types/types';
import ButtonSubmit from './ButtonSubmit';



const SignIn: FC = () => {

    const {register, handleSubmit, formState: {errors, isSubmitting}, reset, setError} = useForm<SignInSignUpForm>({
        mode: 'onSubmit'
    })

    const submit: SubmitHandler<SignInSignUpForm> = (data) => {
        console.log(data)
        reset()
    }

    return (
        <div>
            <EazyMessagerTitleIcon />
            <form onSubmit={handleSubmit(submit)}>
                <LoginInput register={register} isSubmitting={isSubmitting} errors={errors}/>
                <PasswordInput register={register} errors={errors} isSubmitting={isSubmitting} signIn/>
                <RememberMeInput register={register}/>
                <ButtonSubmit isSubmitting={isSubmitting} signIn/>
            </form>
        </div>
    );
}

export default SignIn;