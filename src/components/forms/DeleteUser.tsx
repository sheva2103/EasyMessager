import { FC, useState } from "react";
import styles from './Styles.module.scss'
import ShowPassword from '../../assets/eye-fill.svg'
import HidePassword from '../../assets/eye-slash-fill.svg'
import { SignInSignUpForm } from "../../types/types";
import { SubmitHandler, useForm } from "react-hook-form";
import { profileAPI } from "../../API/api";
import Preloader from '../../assets/preloader.svg'
import { useTypedTranslation } from "../../hooks/useTypedTranslation";

const TEXT = 'text'
const PASSWORD = 'password'

const DeleteUserForm: FC = ({ }) => {

    const [typeInput, setTypeInput] = useState<string>(PASSWORD)
    const {t} = useTypedTranslation()
    const { register, handleSubmit, formState: { errors, isSubmitting }, setError } = useForm<{ password: string }>({
        mode: 'onSubmit'
    })

    const handleClick = () => {
        typeInput === PASSWORD ? setTypeInput(TEXT) : setTypeInput(PASSWORD)
    }

    const submit: SubmitHandler<{ password: string }> = async (data) => {
        profileAPI.deleteUserAndData(data.password)
            .catch(err => {
                console.log(err)
                setError('password', { message: 'Неправильный пароль' })
            })
    }

    return (
        <div className={styles.group} style={{padding: '16px 8px'}}>
            <form onSubmit={handleSubmit(submit)}>
                <div className={styles.passwordInput}>
                    <input type={typeInput}
                        placeholder='Пароль'
                        maxLength={20}
                        {...register('password', { required: { value: true, message: 'обязательное поле' } })}
                    />
                    {typeInput === PASSWORD && <ShowPassword onClick={handleClick} />}
                    {typeInput === TEXT && <HidePassword onClick={handleClick} />}
                </div>
                <div className={styles.error}>
                    {errors.password && <span>{errors.password.message}</span>}
                </div>
                <button disabled={isSubmitting}>
                    {!isSubmitting ? 'Удалить аккаунт' : <Preloader />}
                </button>
            </form>
        </div>
    );
}

export default DeleteUserForm;