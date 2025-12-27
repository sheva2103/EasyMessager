import { FC } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { SignInSignUpForm } from "../../types/types";
import styles from './Styles.module.scss'

type Props = {
    register: UseFormRegister<SignInSignUpForm>,
    errors: FieldErrors<SignInSignUpForm>,
    isSubmitting: boolean,
    signUp?: boolean
}

const LOGIN_REGEXP = /^[a-zA-Z0-9_*-]{6,16}$/;

const LoginInput: FC<Props> = ({ register, isSubmitting, errors, signUp }) => {
    return (
        <div>
            <input type="text"
                placeholder='Логин'
                disabled={isSubmitting}
                {...register('login', { required: { value: true, message: 'обязательное поле' }, pattern: signUp ? LOGIN_REGEXP : undefined })}
            />
            <div className={styles.error}>
                {errors.login && <span>{errors.login.message || 'Латинские символы, цифры и иметь длину 6-16 символов'}</span>}
            </div>
        </div>
    );
}

export default LoginInput;