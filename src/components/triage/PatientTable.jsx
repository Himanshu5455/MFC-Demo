
import { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import StatusBadge from "../common/StatusBadge";
import PatientDetailsModal from "./PatientDetailsModal";
import { getTriageBoardByID, updateCustomerStatus } from "../../services/api";

const PatientTable = ({ patients, onStatusChange }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  console.log(selectedPatient, "selectedPatient");
  const [modalOpen, setModalOpen] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuPatientId, setMenuPatientId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handlePatientClick = async (patient, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setAnchorPosition({
      x: rect.right,
      y: rect.top, 
    });

    const fetchedPatientDetails = await fetchPatientData(patient.id);

    setSelectedPatient(fetchedPatientDetails);
    setModalOpen(true);
  };

  const fetchPatientData = async (id) => {
    try {
      const result = await getTriageBoardByID(id);
      return result;
    } catch (err) {
      console.error("Failed to fetch patient data:", err);
      return null;
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPatient(null);
    setAnchorPosition(null);
  };

  const openActionsMenu = (event, patientId) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setMenuPatientId(patientId);
  };

  const closeActionsMenu = () => {
    setMenuAnchorEl(null);
    setMenuPatientId(null);
  };

  const handleActionSelect = async (value) => {
    if (!menuPatientId || !value) return;

    const backendMap = {
      review: "Pending",
      approve: "completed",
      reject: "Rejected",
    };
    const uiMap = {
      review: "Pending",
      approve: "Complete",
      reject: "Rejected",
    };

    const backendStatus = backendMap[value];
    const uiStatus = uiMap[value];
    if (!backendStatus || !uiStatus) return;

    try {
      setActionLoading(true);
      await updateCustomerStatus(menuPatientId, backendStatus);
      if (onStatusChange) {
        onStatusChange(menuPatientId, uiStatus);
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setActionLoading(false);
      closeActionsMenu();
    }
  };
  return (
    <>
      <TableContainer component={Paper} className="shadow-sm">
        <Table>
          <TableHead>
            <TableRow className="bg-gray-50">
              <TableCell className="font-semibold">Name</TableCell>
              <TableCell className="font-semibold">Age</TableCell>
              <TableCell className="font-semibold">Status</TableCell>
              <TableCell className="font-semibold">Priority</TableCell>
              <TableCell className="font-semibold">Referrer</TableCell>
              <TableCell className="font-semibold">Entry Date</TableCell>
              <TableCell className="font-semibold">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients.map((patient) => (
              <TableRow key={patient.id} hover className="cursor-pointer">
                <TableCell
                  onClick={(event) => handlePatientClick(patient, event)}
                  sx={{
                    fontFamily: "inherit",
                    fontWeight: 400,
                    fontSize: "1rem",
                    lineHeight: "1.25rem",
                    letterSpacing: "0%",
                    cursor: "pointer",
                    "&:hover": {
                      color: "#3B82F6",
                    },
                  }}
                >
                  {patient.name}
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: "inherit",
                    fontWeight: 400,
                    fontSize: "1rem",
                    lineHeight: "1.25rem",
                    letterSpacing: "0%",
                  }}
                >
                  {patient.age}
                </TableCell>
                <TableCell>
                  <StatusBadge status={patient.status} type="status" />
                </TableCell>
                <TableCell>
                  <StatusBadge priority={patient.priority} type="priority" />
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: "inherit",
                    fontWeight: 400,
                    fontSize: "1rem",
                    lineHeight: "1.25rem",
                    letterSpacing: "0%",
                    color: "#888888",
                  }}
                >
                  {patient.referrer}
                </TableCell>
                <TableCell
                  sx={{
                    fontFamily: "inherit",
                    fontWeight: 400,
                    fontSize: "1rem",
                    lineHeight: "1.25rem",
                    letterSpacing: "0%",
                    color: "#888888",
                  }}
                >
                  {patient.entryDate}
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={(e) => openActionsMenu(e, patient.id)} disabled={actionLoading}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={closeActionsMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem disabled={actionLoading} onClick={() => handleActionSelect("review")}>Review</MenuItem>
        <MenuItem disabled={actionLoading} onClick={() => handleActionSelect("approve")}>Approve</MenuItem>
        <MenuItem disabled={actionLoading} onClick={() => handleActionSelect("reject")}>Reject</MenuItem>
      </Menu>

      <PatientDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        patient={selectedPatient}
        anchorPosition={anchorPosition}
      />
    </>
  );
};

export default PatientTable;
