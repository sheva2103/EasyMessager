import { FC, useState } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
//import { MyForm } from "./SignUp";
import styles from './Styles.module.scss'
import ShowPassword from '../../assets/eye-fill.svg'
import HidePassword from '../../assets/eye-slash-fill.svg'
import { SignInSignUpForm } from "../../types/types";
import { useTypedTranslation } from "../../hooks/useTypedTranslation";

type Props = {
    register: UseFormRegister<SignInSignUpForm>,
    errors: FieldErrors<SignInSignUpForm>,
    isSubmitting: boolean,
    signIn?: boolean
}

// const PASSWORD_REGEXP = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/
const PASSWORD_REGEXP = /(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z])^[^\s()-]*$.*$/
const TEXT = 'text'
const PASSWORD = 'password'

const PasswordInput: FC<Props> = ({register, errors, isSubmitting, signIn}) => {

    const [typeInput, setTypeInput] = useState<string>(PASSWORD)
    const {t} = useTypedTranslation()

    const handleClick = () => {
        typeInput === PASSWORD ? setTypeInput(TEXT) : setTypeInput(PASSWORD)
    }

    return (
        <div>
            <div className={styles.passwordInput}>
                <input type={typeInput}
                    placeholder={t('form.password')}
                    maxLength={20}
                    disabled={isSubmitting}
                    {...register('password', { required: { value: true, message: t('form.required') }, pattern: signIn ? undefined : PASSWORD_REGEXP})}
                />
                {typeInput === PASSWORD && <ShowPassword onClick={handleClick}/>}
                {typeInput === TEXT && <HidePassword onClick={handleClick}/>}
            </div>
            <div className={styles.error}>
                {errors.password && <span>{errors.password.message || t('form.errorPaswordMessage')}</span>}
            </div>
        </div>
    );
}

export default PasswordInput;