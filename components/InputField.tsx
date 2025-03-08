import React, { useState, ChangeEvent } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './InputField.module.scss';

interface InputFieldProps {
  type: string;
  placeholder: string;
  name: string; // Add the name prop
  value?: string; // Optional prop for controlled input
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void; // Optional prop for controlled input
}

const InputField: React.FC<InputFieldProps> = ({ type, placeholder, name, value, onChange }) => {
  const [inputValue, setInputValue] = useState<string>(value || '');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (onChange) {
      onChange(e); // Propagate the change to the parent component
    }
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.inputField}>
      <input
        type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        name={name} // Pass the name prop to the input element
        className={styles.input}
      />
      {type === 'password' && (
        <span onClick={handleShowPassword} className={styles.eyeIcon}>
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      )}
    </div>
  );
};

export default InputField;