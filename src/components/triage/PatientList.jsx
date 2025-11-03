
import { useEffect, useRef, useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SearchBar from '../common/SearchBar';
import FilterDropdown from '../common/FilterDropdown';
import ViewToggle from '../common/ViewToggle';
import PatientTable from './PatientTable';
import PatientGrid from './PatientGrid';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CustomPagination from '../ui/CustomPagination';


const PatientList = ({ patients = [], onStatusChange }) => {
  const [view, setView] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    referrer: '', status: '', priority: '', entryDate: null, age: '', gender: ''
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handleFilterChange = (filterName) => (event) => {
    setFilters(prev => ({ ...prev, [filterName]: event.target.value }));
    setPage(1);
  };

const referrerMapping = {
  "Yes, I do": "Self",
  "Yes, from Sprout": "Partner",
  "No, I don’t": "None"
};

  const filterOptions = {
    // referrer: [...new Set(patients.map(p => p.referrer))],
    referrer: Object.keys(referrerMapping),
    status: [...new Set(patients.map(p => p.status))],
    priority: [...new Set(patients.map(p => p.priority))],
    entryDate: ['Today', 'This Week', 'This Month'],
    age: ['0-20', '21-50', '51-90', '91-110', '111+', 'None'],
    gender: ['Male', 'Female', 'Other']
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase());
    // const matchesReferrer = filters.referrer ? patient.referrer === filters.referrer : true;
    const matchesReferrer = filters.referrer
  ? patient.referrer === referrerMapping[filters.referrer]
  : true;

    const matchesStatus = filters.status ? patient.status === filters.status : true;
    const matchesPriority = filters.priority ? patient.priority === filters.priority : true;
    const matchesGender = filters.gender ? patient.gender === filters.gender : true;

    let matchesAge = true;
    if (filters.age) {
      const ageNum = patient.ageNumber ?? null;
      if (filters.age === 'None') {
        matchesAge = !ageNum;
      } else if (filters.age.endsWith('+')) {
        const min = Number(filters.age.replace('+', '').trim());
        matchesAge = ageNum >= min;
      } else {
        const [min, max] = filters.age.split('-').map(Number);
        matchesAge = ageNum >= min && ageNum <= max;
      }
    }

    let matchesDate = true;
    if (filters.entryDate && patient.entryDate) {
      const patientDate = new Date(patient.entryDate).toDateString();
      const selectedDate = new Date(filters.entryDate).toDateString();
      matchesDate = patientDate === selectedDate;
    }

    return matchesSearch && matchesReferrer && matchesStatus && matchesPriority && matchesAge && matchesGender && matchesDate;
  });



  const totalItems = filteredPatients.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const displayedPatientsTable = filteredPatients.slice(startIndex, endIndex);

  return (
    <Box className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Typography variant="h5" className="font-semibold text-gray-700">Patient List</Typography>
        <ViewToggle view={view} onViewChange={setView} />
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 mb-6 overflow-x-auto p-3 sm:p-0">
        <SearchBar
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          className="w-80 border border-gray-300 rounded text-sm"
          placeholder="Search by patient name or ID"
        />

        <FilterDropdown
          label="Referrer"
          value={filters.referrer}
          onChange={handleFilterChange('referrer')}
          options={filterOptions.referrer}
          className="w-32 border rounded p-1 text-sm"
        />

        <FilterDropdown
          label="Status"
          value={filters.status}
          onChange={handleFilterChange('status')}
          options={filterOptions.status}
          className="w-32 border rounded p-1 text-sm"
        />

        <FilterDropdown
          label="Priority"
          value={filters.priority}
          onChange={handleFilterChange('priority')}
          options={filterOptions.priority}
          className="w-32 border rounded p-1 text-sm"
        />

 
<LocalizationProvider dateAdapter={AdapterDateFns}>
  <DatePicker
    label="Entry Date"
    value={filters.entryDate}
    onChange={(newDate) => {
      setFilters(prev => ({ ...prev, entryDate: newDate }));
      setPage(1);
      setIsDatePickerOpen(false);
    }}
    open={isDatePickerOpen}
    onOpen={() => setIsDatePickerOpen(true)}
    onClose={() => setIsDatePickerOpen(false)}
    slotProps={{
      textField: {
        size: "small",
        sx: {
          minWidth: 120,
          '& .MuiInputBase-root': {
            borderRadius: 4,
            borderColor: '#d1d5db',
            padding: '2px',
          },
          '& .MuiSvgIcon-root': { display: 'none' },
        },
        onClick: (e) => {
          e.stopPropagation(); // optional
          setIsDatePickerOpen(true);
        },
      },
      popper: {
        sx: { zIndex: 1500 },
        modifiers: [{ name: "offset", options: { offset: [0, 6] } }],
      },
    }}
  />
</LocalizationProvider>




        <FilterDropdown
          label="Age"
          value={filters.age}
          onChange={handleFilterChange('age')}
          options={filterOptions.age}
          className="w-32 border rounded p-1 text-sm"
        />

        {/* <FilterDropdown
          label="Gender"
          value={filters.gender}
          onChange={handleFilterChange('gender')}
          options={filterOptions.gender}
          className="w-32 border rounded p-1 text-sm"
        /> */}
      </div>

      {view === 'table'
        ? <PatientTable patients={displayedPatientsTable} onStatusChange={onStatusChange} />
        : <PatientGrid patients={filteredPatients} onStatusChange={onStatusChange} />}

      {view === 'table' && (
        <CustomPagination
          currentPage={currentPage}
          totalPages={totalPages}
          startItem={totalItems === 0 ? 0 : startIndex + 1}
          endItem={endIndex}
          totalItems={totalItems}
          rowsPerPage={pageSize}
          onPageChange={setPage}
          onRowsPerPageChange={(newSize) => { setPageSize(newSize); setPage(1); }}
        />
      )}
    </Box>
  );
};

export default PatientList;

