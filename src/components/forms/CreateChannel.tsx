import { FC } from "react";
import styles from './Styles.module.scss'
import { SubmitHandler, useForm } from "react-hook-form";
import ButtonSubmit from "./ButtonSubmit";
import { channelAPI } from "../../API/api";
import { useAppSelector } from "../../hooks/hook";

type Form = {
    name: string,
    isOpen?: string | null,
}

const OPEN = 'open'
const CLOSED = 'closed'

function defineTypeChannel(data: Form): boolean {
    if (data.isOpen === OPEN) return true
    return false
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const NAME_REGEXP = /^[a-zA-Z0-9_*-@ ]{4,20}$/;

const CreateChannel: FC = () => {

    const currentUser = useAppSelector(state => state.app.currentUser)
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setError } = useForm<Form>({
        mode: 'onSubmit',
        defaultValues: {
            isOpen: OPEN
        }
    })

    const submit: SubmitHandler<Form> = async (data) => {

        // await sleep(500).then(data1 => {
        //     console.log(data)
        //     const submitData = {name: data.name, isOpen: defineTypeChannel(data) }
        //     console.log(submitData)
        //     reset()
        // })
        const isFreeName = await channelAPI.checkName(data.name)
        if (isFreeName) {
            const isOpen = defineTypeChannel(data)
            await channelAPI.createChannel(currentUser, { name: data.name, isOpen })
            
        } else {
            setError('name', {message: 'Такое имя уже существует'})
        }

    }

    return (
        <form className={styles.group} onSubmit={handleSubmit(submit)}>
            <div className={styles.item}>
                <input
                    type="text"
                    placeholder="Введите название"
                    {...register('name',
                        {
                            required: { value: true, message: 'обязательное поле' },
                            minLength: { value: 4, message: 'минимум 4 символа' },
                            maxLength: { value: 20, message: 'максимум 20 символов' },
                            pattern: { value: NAME_REGEXP, message: 'цыфры буквы и символы(_*-@)' }
                        })}
                />
                <div className={styles.error}>
                    {errors.name && <span>{errors.name.message}</span>}
                </div>
            </div>
            <div className={styles.item}>
                <div className={styles.labelGroup}>
                    <label>
                        <input type="radio" name="type" value={OPEN} {...register('isOpen')} />
                        открытый
                    </label>
                    <label>
                        <input type="radio" name="type" value={CLOSED} {...register('isOpen')} />
                        закрытый
                    </label>
                </div>
            </div>
            <div className={styles.item}>
                <ButtonSubmit isSubmitting={isSubmitting} />
            </div>
        </form>
    );
}

export default CreateChannel;