import { FC } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { SignInSignUpForm } from "../../types/types";
import styles from './Styles.module.scss'

type Props = {
    register: UseFormRegister<SignInSignUpForm>,
    errors: FieldErrors<SignInSignUpForm>,
    isSubmitting: boolean,
}

const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;

const EmailInput: FC<Props> = ({register, isSubmitting, errors}) => {
    return (
        <div>
            <input type="text"
                placeholder='Электронная почта'
                disabled={isSubmitting}
                {...register('email', { required: { value: true, message: 'обязательное поле' }, pattern: EMAIL_REGEXP})}
            />
            <div className={styles.error}>
                {errors.email && <span>{errors.email.message || 'неправильный формат'}</span>}
            </div>
        </div>
    );
}

export default EmailInput;