import { FC, useState } from "react";
// import styles from './Settings.module.scss'
import Select, { OnChangeValue } from 'react-select'
import style from'./Settings.module.scss'

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
    { value: 'ukraine', label: 'Українська' },
    { value: 'russian', label: 'Русский' },
    { value: 'english', label: 'English' }
]

const SelectComponent: FC = () => {
    const [selectedOption, setSelectedOption] = useState('russian');

    const onChange = (newValue: string) => {
        setSelectedOption(newValue)
    }

    const getValue = () => selectedOption ? options.find(v => v.value === selectedOption) : ''

    console.log(selectedOption)
    return (
        <Select
            value={getValue()}
            onChange={onChange}
            options={options}
            classNamePrefix="custom-select"
        />
    )
}


// export default Select;
export default SelectComponent