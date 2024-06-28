// CustomDropdown.js
import React from 'react';
import Select from 'react-select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faPhone, faVideo } from '@fortawesome/free-solid-svg-icons';
import './CustomDropdown.css';

const options = [
  { value: 'Meeting', label: 'Meeting', icon: faBriefcase },
  { value: 'Call', label: 'Call', icon: faPhone },
  { value: 'Video Call', label: 'Video Call', icon: faVideo },
];

const customStyles = {
  control: (base) => ({
    ...base,
    width: '100%',
  }),
  option: (base, { data }) => ({
    ...base,
    display: 'flex',
    alignItems: 'center',
  }),
};

const formatOptionLabel = ({ label, icon }) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <FontAwesomeIcon icon={icon} style={{ marginRight: 10 }} />
    {label}
  </div>
);

function CustomDropdown({ value, onChange }) {
  const selectedOption = options.find(option => option.value === value);
  return (
    <Select
      value={selectedOption}
      onChange={option => onChange(option.value)}
      options={options}
      styles={customStyles}
      formatOptionLabel={formatOptionLabel}
    />
  );
}

export default CustomDropdown;
