import { FC } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import { SignInSignUpForm } from "../../types/types";
import styles from './Styles.module.scss'
import { useTypedTranslation } from "../../hooks/useTypedTranslation";

type Props = {
    register: UseFormRegister<SignInSignUpForm>,
    errors: FieldErrors<SignInSignUpForm>,
    isSubmitting: boolean,
}

const EMAIL_REGEXP = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;

const EmailInput: FC<Props> = ({register, isSubmitting, errors}) => {
    const {t} = useTypedTranslation()
    return (
        <div style={{display: 'flex', flexDirection: 'column'}}>
            <input type="text"
                placeholder='Email'
                disabled={isSubmitting}
                {...register('email', { required: { value: true, message: t('form.required') }, pattern: EMAIL_REGEXP})}
            />
            <div className={styles.error}>
                {errors.email && <span>{errors.email.message || t('form.errorEmailInput')}</span>}
            </div>
        </div>
    );
}

export default EmailInput;