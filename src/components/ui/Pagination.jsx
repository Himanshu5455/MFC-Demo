import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';

const PaginationComponent = ({
  currentPage = 1,
  totalPages = 1,
  startItem = 0,
  endItem = 0,
  totalItems = 0,
  onPageChange
}) => {
  if (totalPages <= 1) {
    return (
      <div className="flex justify-between items-center mt-6 p-4 bg-white rounded-lg shadow-sm">
        <Typography variant="body2" className="text-gray-600">
          {totalItems === 0 ? '0-0 of 0 patients' : `${startItem}-${endItem} of ${totalItems} patients`}
        </Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-white rounded-lg shadow-sm">
      <Typography variant="body2" className="text-gray-600">
        {startItem}-{endItem} of {totalItems} patients
      </Typography>
      <div className="flex items-center gap-2">
        <Typography variant="body2" className="text-gray-600">
          Page {currentPage} of {totalPages}
        </Typography>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={onPageChange}
          color="primary"
          size="small"
        />
      </div>
    </div>
  );
};
export default PaginationComponent;
