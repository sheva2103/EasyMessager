import { FC, useState } from "react";
// import styles from './Settings.module.scss'
import Select, { OnChangeValue } from 'react-select'
import style from'./Settings.module.scss'
import { useTranslation } from "react-i18next";

type SelectComponentType = {
    value: string,
    label: string
}

// const Select: FC = () => {

//     return (  
//         <div>
//             <select name="lang" id="lang" className={styles.select}>
//                 <option value="Українська" className={styles.options}>Українська</option>
//                 <option value="English" className={styles.options}>English</option>
//                 <option value="Русский" className={styles.options}>Русский</option>
//             </select>
//         </div>
//     );
// }

const options: SelectComponentType[] = [
    { value: 'uk', label: 'Українська' },
    { value: 'ru', label: 'Русский' },
    { value: 'en', label: 'English' }
]

const SelectComponent: FC = () => {
    const {i18n} = useTranslation()
    const currentLang = i18n.language

    const onChange = (newValue: SelectComponentType) => {
        i18n.changeLanguage(newValue.value)
    }

    const getValue = () => currentLang ? options.find(v => v.value === currentLang) : ''

    return (
        <Select
            value={getValue()}
            onChange={onChange}
            options={options}
            classNamePrefix="custom-select"
        />
    )
}

export default SelectComponent