
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
  IconButton,
  Chip,
  Grid,
  Menu,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PropTypes from "prop-types";
import { statusColors } from "../../utils/constants";
import FileUploadBox from "../../pages/FileUploadBox";
import { COLORS } from "../color/Colors";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { updateCustomerStatus } from "../../services/api";

// Component to display patient details in a modal
const PatientDetailsModal = ({ open, onClose, patient, position, onStatusChange }) => {
  // console.log("PatientDetailsModal patient:", patient);
  const [patientData, setPatientData] = useState(patient);
  const [markLoading, setMarkLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setPatientData(patient);
  }, [patient]);

  if (!patient) return null;

  // Normalize patient data
  const age = patient.answers?.age || patient.age || "N/A";
  const phone =
    patient.phone ||
    patient.mobile ||
    patient.contact ||
    patient.answers?.phone ||
    "N/A";
  const email =
    patient.email || patient.username || patient.answers?.email || "N/A";
  const referralReason =
    patient.answers?.referral_reason || patient.referral_reason || "N/A";
  const partnerName =
    patient.answers?.partner_name || patient.partnerName || "N/A";
    const address = patient.answers.full_address ||"N/A";
    const ohipnumber = patient.answers.OHIP ||"N/A";
    const sexatbirth = patient.answers.gender ||"N/A";
  const hasPartner = Boolean(patient.partner || patient.answers?.partner);

  // Normalize files
  const files = patient.files
    ? Array.isArray(patient.files)
      ? patient.files.map((file, idx) => ({
          name: file.name || file.url?.split("/").pop() || `file-${idx}`,
          url: file.url || file,
        }))
      : Object.entries(patient.files || {}).map(([key, value]) => ({
          name: value.name || value.url?.split("/").pop() || key,
          url: value.url || value,
        }))
    : [];

  // Handle expand button click to navigate to patient details page
  const handleExpandClick = () => {
    onClose();
    if (patient.id) {
      navigate(`/patient-details/${patient.id}`);
    } else {
      console.warn("Patient ID is missing, cannot navigate to details page.");
    }
  };

  // Handle menu open/close
  const openActionsMenu = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const closeActionsMenu = () => {
    setMenuAnchorEl(null);
  };

  // Handle menu action select
  const handleActionSelect = async (value) => {
    if (!value) return;

    // Map dropdown to backend status and UI status
    const backendMap = {
      review: 'Pending', // goes to Pending column
      approve: 'completed', // goes to Complete column
      reject: 'Rejected', // goes to Rejected column
    };
    const uiMap = {
      review: 'Pending',
      approve: 'Complete',
      reject: 'Rejected',
    };

    const backendStatus = backendMap[value];
    const uiStatus = uiMap[value];
    if (!backendStatus || !uiStatus) return;

    try {
      setActionLoading(true);
      await updateCustomerStatus(patient.id, backendStatus);
      setPatientData((prev) => ({ ...prev, status: uiStatus }));
      if (onStatusChange) {
        onStatusChange(patient.id, uiStatus);
      }
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setActionLoading(false);
      closeActionsMenu();
    }
  };

  // Calculate modal position styles
  const getPositionStyles = () => {
    if (!position) {
      return {
        position: "fixed",
        top: "50%",
        left: "60%",
      
        transform: "translate(-50%, -50%)",
      };
    }

    const modalWidth = 720;
    const modalHeight = 720;
    const minMargin = 20;
    const { left, top } = position;

    const adjustedLeft = Math.max(
      minMargin,
      Math.min(left, window.innerWidth - modalWidth - minMargin)
    );
    const adjustedTop = Math.max(
      minMargin,
      Math.min(top, window.innerHeight - modalHeight - minMargin)
    );

    return {
      position: "fixed",
      left: `${adjustedLeft}px`,
      top: `${adjustedTop}px`,
      width: `${modalWidth}px`,
      maxHeight: `${modalHeight}px`,
    };
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          ...getPositionStyles(),
          borderRadius: 3,
          overflow: "hidden",
          maxWidth: "75vw",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
        },
      }}
      BackdropProps={{ sx: { backgroundColor: "rgba(0, 0, 0, 0.3)" } }}
    >
      <DialogContent
        sx={{
          p: 0,
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: `1px solid ${COLORS.border}`,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={onClose} aria-label="Close modal">
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: COLORS.textPrimary }}
            >
              Patient Information
            </Typography>
          </Box>
          <IconButton
            onClick={handleExpandClick}
            aria-label="Expand to full page"
          >
            <OpenInFullIcon />
          </IconButton>
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>

          {/* Action Button */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 , justifyContent: 'space-between'}}>
          <Button
            variant="contained"
            startIcon={<CheckCircleIcon />}
            sx={{
              backgroundColor: COLORS.primary,
              "&:hover": { backgroundColor: COLORS.primaryHover },
              mb: 2,
              textTransform: "none",
              borderRadius: 2,
            }}
            disabled={markLoading}
            onClick={async () => {
              if (!patient?.id) return;
              try {
                setMarkLoading(true);
                await updateCustomerStatus(patient.id, 'completed');
                setPatientData((prev) => ({ ...prev, status: 'Complete' }));
                if (onStatusChange) {
                  onStatusChange(patient.id, 'Complete');
                }
                // Smooth update without hard reload: keep modal open and rely on state/parent refresh
              } catch (e) {
                console.error('Failed to mark as complete', e);
              } finally {
                setMarkLoading(false);
              }
            }}
          >
            Mark as complete
          </Button>
          <IconButton onClick={openActionsMenu} disabled={actionLoading}>
            <MoreHorizIcon />
          </IconButton>
            </Box>


          {/* Patient Header */}
          <Box sx={{ mb: 2 , p:1}}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, color: COLORS.textPrimary }}
              >
                {patient.name || "N/A"}
              </Typography>
              <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                #{patient.id || "N/A"}
              </Typography>
              <Chip
                label={
                  Array.isArray(patientData?.status)
                    ? patientData.status.join(", ")
                    : patientData?.status || "N/A"
                }
                size="small"
                sx={{
                  backgroundColor: `${
                    statusColors[
                      Array.isArray(patientData?.status)
                        ? patientData.status[0]
                        : patientData?.status
                    ] || "#9CA3AF"
                  }20`,
                  color:
                    statusColors[
                      Array.isArray(patientData?.status)
                        ? patientData.status[0]
                        : patientData?.status
                    ] || "#9CA3AF",
                  fontWeight: 500,
                }}
              />
            </Box>

            {/* Patient Details */}
            <Box
              sx={{
                border: `1px solid ${COLORS.border}`,
                borderRadius: 2,
                backgroundColor: "#FAFAFA",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRight: `1px solid ${COLORS.border}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: COLORS.textSecondary }}
                  >
                    Age
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: COLORS.textPrimary }}
                  >
                    {age}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, p: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: COLORS.textSecondary }}
                  >
                    Contact
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: COLORS.textPrimary }}
                  >
                    {phone}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRight: `1px solid ${COLORS.border}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: COLORS.textSecondary }}
                  >
                    Email
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: COLORS.textPrimary }}
                  >
                    {email}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, p: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: COLORS.textSecondary }}
                  >
                    Address
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: COLORS.textPrimary }}
                  >
                    {address}
                  </Typography>

                </Box>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRight: `1px solid ${COLORS.border}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: COLORS.textSecondary }}
                  >
                    Referral reason
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: COLORS.textPrimary }}
                  >
                    {referralReason}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRight: `1px solid ${COLORS.border}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: COLORS.textSecondary }}
                  >
                    Partner
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: COLORS.textPrimary }}
                  >
                    {hasPartner ? "Yes" : "No"}
                  </Typography>
                </Box>
             
              </Box>
                     <Box
                sx={{
                  display: "flex",
                  borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRight: `1px solid ${COLORS.border}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: COLORS.textSecondary }}
                  >
                    OHIP
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: COLORS.textPrimary }}
                  >
                    {ohipnumber}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRight: `1px solid ${COLORS.border}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: COLORS.textSecondary }}
                  >
                    Sex at birth 
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: COLORS.textPrimary }}
                  >
                    {sexatbirth}
                  </Typography>
                </Box>
             
              </Box>
              <Box
                sx={{
                  display: "flex",
                  borderBottom: `1px solid ${COLORS.border}`,
                }}
              >
                   <Box   sx={{
                    flex: 1,
                    p: 2,
                    borderRight: `1px solid ${COLORS.border}`,
                  }}>
                  <Typography
                    variant="caption"
                    sx={{ color: COLORS.textSecondary }}
                  >
                    Partner Name
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: COLORS.textPrimary }}
                  >
                    {partnerName}
                  </Typography>
                </Box>
                 <Box   sx={{
                    flex: 1,
                    p: 2,
                    borderRight: `1px solid ${COLORS.border}`,
                  }}>
                <Typography
                  variant="caption"
                  sx={{ color: COLORS.textSecondary }}
                >
                  Priority
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: COLORS.error, fontWeight: 500 }}
                >
                  {patient.priority || "N/A"}
                </Typography>
              </Box>
</Box>

            </Box>
          </Box>

          {/* Uploads Section */}
          
          <Grid item xs={2}>
            {patientData ? (
              <>
                {/* If files exist */}
                {patientData?.answers?.files &&
                Object.keys(patientData.answers.files).length > 0 ? (
                  <Box
                    sx={{
                      backgroundColor: "white",
                      borderRadius: 3,
                      p: 0,
                      boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "#111827", mb: 3 }}
                    >
                      Uploads
                    </Typography>

                    <Grid container spacing={2} item xs={2} md={2} lg={2}>
                      {(() => {
                        const files = Object.entries(
                          patientData.answers.files || {}
                        );
                        const items = [];

                        // Add all file items first
                        files.forEach(([key, url]) => {
                          items.push(
                            <Grid item xs={2} key={key}>
                              <FileItem
                                url={url}
                                date={patientData.referral_date}
                              />
                            </Grid>
                          );
                        });

                        // Always add the uploader box at the end
                        items.push(
                          <Grid item xs={6} key="uploader-box">
                            <FileUploadBox
                              patient={patientData}
                              onUploadSuccess={(newFiles, options) =>
                                setPatientData((prev) => {
                                  const prevFiles = prev?.answers?.files || {};
                                  const replace = options?.replace === true;
                                  const nextFiles = replace
                                    ? newFiles
                                    : { ...prevFiles, ...newFiles };
                                  return {
                                    ...prev,
                                    answers: {
                                      ...(prev?.answers || {}),
                                      files: nextFiles,
                                    },
                                  };
                                })
                              }
                            />
                          </Grid>
                        );

                        return items;
                      })()}
                    </Grid>
                  </Box>
                ) : (
                  // If no files attached
                  <Box
                    sx={{
                      backgroundColor: "white",
                      borderRadius: 3,
                      p: 4,
                      boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, color: "#111827", mb: 3 }}
                    >
                      Uploads images
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ color: "#6B7280", mb: 2, textAlign: "center" }}
                    >
                      No files attached.
                    </Typography>

                    <FileUploadBox
                      patient={patientData}
                      onUploadSuccess={(newFiles, options) =>
                        setPatientData((prev) => {
                          const prevFiles = prev?.answers?.files || {};
                          const replace = options?.replace === true;
                          const nextFiles = replace
                            ? newFiles
                            : { ...prevFiles, ...newFiles };
                          return {
                            ...prev,
                            answers: {
                              ...(prev?.answers || {}),
                              files: nextFiles,
                            },
                          };
                        })
                      }
                    />
                  </Box>
                )}
              </>
            ) : (
              <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
                Patient info is loading...
              </Typography>
            )}
          </Grid>
        </Box>
      </DialogContent>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={closeActionsMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {patientData?.status !== 'Pending' && (
          <MenuItem disabled={actionLoading} onClick={() => handleActionSelect("review")}>Review</MenuItem>
        )}
        {patientData?.status !== 'Complete' && (
          <MenuItem disabled={actionLoading} onClick={() => handleActionSelect("approve")}>Approve</MenuItem>
        )}
        {patientData?.status !== 'Rejected' && (
          <MenuItem disabled={actionLoading} onClick={() => handleActionSelect("reject")}>Reject</MenuItem>
        )}
      </Menu>
    </Dialog>
  );
};

// Component to render a file upload item
// const FileItem = ({ url, date }) => (
//   <Box
//     sx={{
//       border: `1px solid ${COLORS.border}`,
//       borderRadius: 2,
//       p: 2,
//       backgroundColor: COLORS.background,
//       textAlign: "center",
//     }}
//   >
//     <Box
//       sx={{
//         width: 50,
//         height: 50,
//         backgroundColor: COLORS.error,
//         borderRadius: 2,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         mx: "auto",
//         mb: 2,
//       }}
//     >
//       <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
//         PDF
//       </Typography>
//     </Box>
//     <Typography
//       variant="body1"
//       sx={{
//         color: "#111827",
//         mb: 1,
//         fontWeight: 500,
//         wordBreak: "break-word",
//         maxWidth: "150px",
//         overflow: "hidden",
//         textOverflow: "ellipsis",
//         whiteSpace: "nowrap",
//       }}
//     >
//       {url.split("/").pop()}
//     </Typography>
//     <Typography variant="body2" sx={{ color: COLORS.textSecondary }}>
//       {date ? new Date(date).toLocaleString() : "N/A"}
//     </Typography>
//   </Box>
// );

const FileItem = ({ url, date }) => (
  <Grid item xs={12} sm={6} md={4}>
    <Box
      sx={{
        border: `1px solid ${COLORS.border}`,
        borderRadius: 2,
        p: 3,
        backgroundColor: COLORS.background,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 60,
          height: 60,
          backgroundColor: COLORS.error,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: "white", fontWeight: 600 }}>
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
        {date ? new Date(date).toLocaleString() : "N/A"}
      </Typography>
    </Box>
  </Grid>
);

PatientDetailsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  patient: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    status: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
    age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    phone: PropTypes.string,
    mobile: PropTypes.string,
    contact: PropTypes.string,
    email: PropTypes.string,
    sexatbirth: PropTypes.string,
    ohipnumber: PropTypes.string,
    username: PropTypes.string,
    referrer: PropTypes.string,
    referral_reason: PropTypes.string,
    priority: PropTypes.string,
    partner: PropTypes.any,
    partnerName: PropTypes.string,
    referral_date: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    files: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
    answers: PropTypes.shape({
      phone: PropTypes.string,
      email: PropTypes.string,
      address: PropTypes.string,
      refer_physician_name: PropTypes.string,
      referral_reason: PropTypes.string,
      partner: PropTypes.any,
      partner_name: PropTypes.string,
      files: PropTypes.any,
    }),
  }),
  position: PropTypes.shape({
    left: PropTypes.number,
    top: PropTypes.number,
  }),
};

export default PatientDetailsModal;