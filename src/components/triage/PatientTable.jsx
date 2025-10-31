
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
import StatusBadge from "../common/StatusBadge";
import PatientDetailsModal from "./PatientDetailsModal";
import { getTriageBoardByID } from "../../services/api";

const PatientTable = ({ patients }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  console.log(selectedPatient, "selectedPatient");
  const [modalOpen, setModalOpen] = useState(false);
  const [anchorPosition, setAnchorPosition] = useState(null);

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
                  <IconButton size="small">
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
