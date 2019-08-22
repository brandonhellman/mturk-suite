import React from 'react';

interface Props {
  checked: boolean;
  label: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function Checkbox({ checked, label, onChange }: Props) {
  return (
    <div>
      <label>
        <input type="checkbox" value={label} checked={checked} onChange={onChange} style={{ 'marginRight': 5 }} />
        {label}
      </label>
    </div>
  );
}
