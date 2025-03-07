"use client"; // Mark this component as a Client Component

import React from 'react';
import styles from './InputField.module.scss';

interface InputFieldProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
}) => {
  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${styles.inputField} ${error ? styles.error : ''}`}
      />
      {error && <p className={styles.errorMessage}>{error}</p>}
    </div>
  );
};

export default InputField;