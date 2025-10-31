
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Button,
  Chip,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { statusColors } from '../utils/constants';
import { getTriageBoardByID } from '../services/api';
import FileUploadBox from './FileUploadBox';
import Notes from './Notes';
import { COLORS } from '../components/color/Colors';
import { ChartBarIcon, ChartGanttIcon } from 'lucide-react';
import ChatIcon from '@mui/icons-material/Chat';
import AlertItem from './AlertItem'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

// Component to render a single patient detail
const PatientDetail = ({ label, value }) => (
  <Grid item xs={12} sm={6} md={3}>
    <Typography variant="body2" sx={{ color: COLORS.textSecondary, mb: 1 }}>
      {label}
    </Typography>
    <Typography
      variant="h6"
      sx={{
        color: label === 'Priority' ? COLORS.error : COLORS.textPrimary,
        fontWeight: 500,
      }}
    >
      {value || 'N/A'}
    </Typography>
  </Grid>
);

// Component to render a file upload item
const FileItem = ({ url, date }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Box
      sx={{
        border: `1px solid ${COLORS.border}`,
        borderRadius: 2,
        p: 3,
        backgroundColor: COLORS.background,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 60,
          height: 60,
          backgroundColor: COLORS.error,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
          PDF
        </Typography>
      </Box>
 <Typography
        variant="body1"
        sx={{
          color: COLORS.textPrimary,
          mb: 1,
          fontWeight: 500,
          wordBreak: "break-word",
          maxWidth: "150px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {url.split("/").pop()}
      </Typography>
      <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
        {date ? new Date(date).toLocaleString() : 'N/A'}
      </Typography>
    </Box>
  </Grid>
);


const PatientDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    initialContact: true,
    symptomAssessment: false,
    riskEvaluation: false,
    examUpload: false,
    triageComplete: false,
  });

const notesExist = (() => {
  if (!patient?.answers?.note_title) return false;
  try {
    const titles = JSON.parse(patient.answers.note_title);
    return Object.keys(titles).length > 0;
  } catch (e) {
    return false;
  }
})();

const missingDetails = (() => {
  if (!patient) return [];
  const details = [
    { label: "Age", value: patient?.answers?.age },
    { label: "Contact", value: patient?.contact_info?.phone },
    { label: "Email", value: patient?.contact_info?.email },
    { label: "Referrer", value: patient?.answers?.referring },
    { label: "Referral reason", value: patient?.answers?.referral_reason },
    { label: "Partner", value: patient?.partner ? "Yes" : "No" },
    { label: "Partner Name", value: patient?.answers?.partner_name },
    { label: "Priority", value: patient?.priority },
  ];

  return details
    .filter((d) => !d.value || d.value === "N/A")
    .map((d) => d.label);
})();

const alerts = [
  ...(notesExist
    ? [
        {
          type: "info",
          message: "New notes",
          color: "#E3F2FD",
        },
      ]
    : []),
  {
    type: "error",
    message: patient?.priority
      ? `Priority: ${patient.priority}`
      : "Priority information not available",
    color:
      patient?.priority === "High"
        ? "#FFEBEE"
        : patient?.priority === "Medium"
        ? "#FFF8E1"
        : patient?.priority === "Low"
        ? "#E8F5E9"
        : "#E0E0E0",
  },
  ...(missingDetails.length > 0
    ? [
        {
          type: "warning",
          message: `Incomplete Information: ${missingDetails.join(", ")}`,
          color: "#FFF8E1",
        },
      ]
    : []),
];


// ✅ Add Advanced Age alert dynamically
const age = Number(patient?.answers?.age);
if (!isNaN(age) && age > 35) {
  alerts.push({
    type: 'age',
    message: 'Advanced Age',
    color: '#E1F5FE',
  });
}

  // Fetch patient data
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getTriageBoardByID(id);
        setPatient(result);
      } catch (err) {
        console.error('Failed to fetch patient data:', err);
        setError('Unable to load patient data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  // Toggle expandable sections
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Render loading state
  if (loading) {
    return (
      <Box
        sx={{
          backgroundColor: COLORS.background,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Render error or not found state
  if (error || !patient) {
    return (
      <Box
        sx={{
          backgroundColor: COLORS.background,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {error || 'Patient not found'}
          </Typography>
          <Button variant="contained" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Box>
      </Box>
    );
  }

  console.log("Patient address:", patient.answers.full_address);  
  // Patient details data
 const patientDetails = [
    { label: "Age", value: patient.answers?.age },
    { label: "Contact", value: patient.contact_info?.phone },
    { label: "Email", value: patient.contact_info?.email },
    { label: "Addres", value: patient.answers.full_address || "N/A" },
    { label: "OHIP", value: patient.answers.OHIP || "N/A" },
    { label: "Sex at birth", value: patient.answers.gender || "N/A" },


    // { label: "Referrer", value: patient.answers?.referring },
    { label: "Referral reason", value: patient.answers?.referral_reason },
    { label: "Partner", value: patient.partner ? "Yes" : "No" },
    {
      label: "Partner Name",
      value: patient.partner ? patient.answers?.partner_name || "No" : "No",
    },
    { label: "Priority", value: patient.priority },
  ];

  // Timeline items (partially derived from patient data)
  const timelineItems = [
    { label: 'Initial Contact', date: patient.referral_date, completed: !!patient.referral_date },
    { label: 'Symptom Assessment', date: null, completed: false },
    { label: 'Risk Evaluation', date: null, completed: false },
    { label: 'Exam Upload', date: null, completed: false },
    { label: 'Triage Complete', date: patient.status === 'Complete' ? patient.referral_date : null, completed: patient.status === 'Complete' },
  ];

  return (
    <Box
      sx={{
        backgroundColor: COLORS.background,
        minHeight: '100vh',
        maxWidth: '1250px',
        mx: 'auto',
        px: 2,
      }}
    >
      <div className="container mx-auto py-6 px-4">
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* <IconButton onClick={() => navigate(-1)} size="small">
              <ArrowBackIcon />
            </IconButton> */}
            <Typography variant="h4" sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
              Patient Information
            </Typography>
          </Box>
          <Box sx={{display: 'flex' ,  alignItems: 'center', gap: 2}}>
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              sx={{
                backgroundColor: COLORS.primary,
                color: 'white',
                '&:hover': { backgroundColor: COLORS.primaryHover },
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
              }}
            >
              Mark as complete
            </Button>
            <button
              className="min-w-[31px] px-[7px] py-[6px] bg-[#D9D9D9] rounded-[8px]"
            >
              <MoreHorizIcon />
            </button>

          </Box>
        </Box>

        <Grid spacing={4}>

          <Grid item xs={12}>
            {/* Patient Info */}

            <div className="py-8 px-4 mb-2">

              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">
                  {patient.name}
                </h2>
                <span className="text-sm text-gray-500">
                  #{patient.id}
                </span>
                <span
                  className={`inline-flex bg-[#fdf7e5] text-[#efad03] items-center px-2 py-0.5 rounded-md text-sm font-medium `}
                >
                  {Array.isArray(patient.status) ? patient.status.join(", ") : patient.status}
                </span>
              </div>

              {/* Details Flex */}
              <div className="flex flex-wrap gap-4">
                {patientDetails.map((detail, index) => (
                  <div
                    key={index}
                    className={`w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(25%-0.75rem)] pb-4 border-b border-gray-200
                      }`}
                  >
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {detail.label}
                    </p>
                    <p
                      className={`text-base ${detail.label === "Priority" && detail.value === "High"
                        ? 'text-red-500 font-semibold'
                        : 'text-gray-900'
                        }`}
                    >
                      {detail.value || "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Uploads Section */}
            <Box
              sx={{
                py: 0,
                px: 2,
                mb: 3,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600, color: COLORS.textPrimary, mb: 4 }}>
                Uploads
              </Typography>
              <Grid container spacing={3}>
                {Object.entries(patient.answers?.files || {}).map(([key, url]) => (
                  <FileItem key={key} url={url} date={patient.referral_date} />
                ))}
                <Grid item xs={12} sm={6} md={4}>
                  <FileUploadBox
                    patient={patient}
                    onUploadSuccess={(newFiles) =>
                      setPatient((prev) => ({
                        ...prev,
                        answers: { ...prev.answers, files: newFiles },
                      }))
                    }
                  />
                </Grid>
              </Grid>
            </Box>



            {/* Alerts Section */}
            <Box
              sx={{
                backgroundColor: 'white',
                borderRadius: 3,
                p: 4,
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                mb: 4,
                mt: 4,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600, color: COLORS.textPrimary, mb: 3 }}>
                Alerts
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {alerts.map((alert, index) => (
                  <AlertItem key={index} type={alert.type} message={alert.message} color={alert.color} />
                ))}
              </Box>
            </Box>

            {/* Triage Timeline Section */}
            <Box
              sx={{
                mt: 4,
                px: 2,
                py: 4,
                borderRadius: 3,

              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 600, color: COLORS.textPrimary }}>
                Triage Timeline
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                {timelineItems.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1,
                      borderRadius: 2,
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: COLORS.background },
                    }}
                    onClick={() => toggleSection(item.label.toLowerCase().replace(' ', ''))}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {/* Icon always rendered, color changes based on completion */}
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ChatIcon
                          sx={{
                            fontSize: 20,
                            color: COLORS.textSecondary,
                          }}
                        />
                      </Box>

                      <Box>
                        <div className="flex">
                          <Typography variant="body1" sx={{ fontWeight: 500, color: COLORS.textPrimary }}>
                            {item.label}
                            {expandedSections[item.label.toLowerCase().replace(' ', '')] ? (
                              <ExpandLessIcon sx={{ color: COLORS.textSecondary }} />
                            ) : (
                              <ExpandMoreIcon sx={{ color: COLORS.textSecondary }} />
                            )}
                          </Typography>
                        </div>

                        <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                          {item.date}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>

            </Box>

            {/* Notes Section */}
            <Box
              sx={{
                backgroundColor: "white",
                borderRadius: 3,
                p: 4,
                boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: COLORS.textPrimary, mb: 4 }}
              >
                Notes
              </Typography>

              <Notes patient={patient} />
            </Box>
          </Grid>
        </Grid>
      </div>
    </Box>
  );
};

// PropTypes for type checking
PatientDetailsPage.propTypes = {
  patient: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    status: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
    priority: PropTypes.string,
    referral_date: PropTypes.string,
    partner: PropTypes.bool,
    contact_info: PropTypes.shape({
      phone: PropTypes.string,
      email: PropTypes.string,
    }),
    answers: PropTypes.shape({
      age: PropTypes.string,
      referring: PropTypes.string,
      referral_reason: PropTypes.string,
      partner_name: PropTypes.string,
      note: PropTypes.string,
      note_title: PropTypes.string,
      files: PropTypes.object,
    }),
  }),
};

PatientDetail.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

FileItem.propTypes = {
  url: PropTypes.string.isRequired,
  date: PropTypes.string,
};

AlertItem.propTypes = {
  type: PropTypes.oneOf(['info', 'error', 'warning']).isRequired,
  message: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

export default PatientDetailsPage;