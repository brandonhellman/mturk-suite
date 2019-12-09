import React from 'react';

export interface SelectProps {
  children: any;
  label: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  value: string;
}

export default function Select({ children, label, onChange, value }: SelectProps) {
  return (
    <div>
      <label>{label}</label>
      <select onChange={onChange} value={value}>
        {children}
      </select>
    </div>
  );
}
