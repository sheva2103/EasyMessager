import { FC } from "react";
import styles from './Styles.module.scss'
import { SubmitHandler, useForm } from "react-hook-form";
import ButtonSubmit from "./ButtonSubmit";
import { channelAPI } from "../../API/api";
import { useAppDispatch, useAppSelector } from "../../hooks/hook";
import { closeMenu, setSelectedChannel } from "../../store/slices/appSlice";
import { createObjectChannel } from "../../utils/utils";
import { Chat } from "../../types/types";
import { useTypedTranslation } from "../../hooks/useTypedTranslation";

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

const NAME_REGEXP = /^[\p{L}0-9_*\s-]{4,20}$/u;

const CreateChannel: FC = () => {

    const currentUser = useAppSelector(state => state.app.currentUser)
    const dispatch = useAppDispatch()
    const {t} = useTypedTranslation()
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset, setError } = useForm<Form>({
        mode: 'onSubmit',
        defaultValues: {
            isOpen: OPEN
        }
    })

    const submit: SubmitHandler<Form> = async (data) => {

        const isFreeName = await channelAPI.checkName(data.name)
        if (isFreeName) {
            const isOpen = defineTypeChannel(data)
            await channelAPI.createChannel(currentUser, { displayName: data.name, isOpen })
                .then(((info) => {
                    const chanelObj: Chat = createObjectChannel(info)
                    dispatch(closeMenu())
                    dispatch(setSelectedChannel(chanelObj))
                }))
        } else {
            setError('name', {message: t('errorRegName')})
        }

    }

    return (
        <form className={styles.group} onSubmit={handleSubmit(submit)}>
            <div className={styles.item}>
                <input
                    type="text"
                    placeholder={t('enterTheName')}
                    {...register('name',
                        {
                            required: { value: true, message: t("form.required") },
                            minLength: { value: 4, message: t('form.min') },
                            maxLength: { value: 20, message: t('form.max') },
                            pattern: { value: NAME_REGEXP, message: t('form.chars') }
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
                        {t('open')}
                    </label>
                    <label>
                        <input type="radio" name="type" value={CLOSED} {...register('isOpen')} />
                        {t('closed')}
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