

import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

const SearchBar = ({ value, onChange, className }) => {
  return (
    <div className={`w-full md:w-auto flex justify-center md:justify-start ${className ?? ""}`}>
      <TextField
        variant="outlined"
        placeholder="Search patients..."
        value={value}
        onChange={onChange}
        size="small"
        fullWidth
        className="max-w-full p-0 md:max-w-xs lg:max-w-sm"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon className="text-gray-400" />
            </InputAdornment>
          ),
          sx: {
            "& fieldset": { border: "none" }, 
             // light gray background
           
         
          },
        }}
        sx={{
          width: {
            xs: "100%", // full width on small screens
            sm: "250px",
            md: "320px",
            lg: "200px",
          },
        }}
      />
    </div>
  );
};

export default SearchBar;

