import { FC, useState } from "react";
import { FieldErrors, UseFormRegister } from "react-hook-form";
import styles from './Styles.module.scss'
import ShowPassword from '../../assets/eye-fill.svg'
import HidePassword from '../../assets/eye-slash-fill.svg'
import { checkConfirmPassword } from "../../utils/validators";
import { SignInSignUpForm } from "../../types/types";

type Props = {
    register: UseFormRegister<SignInSignUpForm>,
    errors: FieldErrors<SignInSignUpForm>,
    password: string,
    isSubmitting: boolean
}

const TEXT = 'text'
const PASSWORD = 'password'

const ConfirmPasswordInput: FC<Props> = ({ register, errors, password, isSubmitting }) => {

    const [typeInput, setTypeInput] = useState<string>(PASSWORD)

    const handleClick = () => {
        typeInput === PASSWORD ? setTypeInput(TEXT) : setTypeInput(PASSWORD)
    }

    return (
        <div>
            <div className={styles.passwordInput}>
                <input type={typeInput}
                    placeholder='Подтвердите пароль'
                    disabled={isSubmitting}
                    maxLength={20}
                    {...register('confirmPassword', {
                        required:
                            { value: true, message: 'обязательное поле' },
                        validate: { comparePasswords: value => checkConfirmPassword(password, value) }
                    })}
                />
                {typeInput === PASSWORD && <ShowPassword onClick={handleClick} />}
                {typeInput === TEXT && <HidePassword onClick={handleClick} />}
            </div>
            <div className={styles.error}>
                {errors.confirmPassword && <span>{errors.confirmPassword.message || 'Введённые значения не совпадают'}</span>}
            </div>
        </div>
    );
}

export default ConfirmPasswordInput;