import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';

const FilterDropdown = ({ label, value, onChange, options }) => {
  return (
    <FormControl size="small" sx={{ minWidth: 100 }}>
      <InputLabel id={`${label}-label`}>{label}</InputLabel>
      <Select
        labelId={`${label}-label`}
        value={value}
        label={label}
        onChange={onChange}
      >
        <MenuItem value="">
          All
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};export default FilterDropdown;
