
// import React, { useRef } from "react";
// import { Box, Typography } from "@mui/material";
// import CloudUploadIcon from "@mui/icons-material/CloudUpload";
// import { patchCustomerFiles } from "../services/api";

// const FileUploadBox = ({ patient, onUploadSuccess }) => {
//   const fileInputRef = useRef(null);

//   const handleClick = () => {
//     fileInputRef.current.click();
//   };

//   const normalizeFiles = (filesResponse) => {
//     if (!filesResponse) return {};
//     if (typeof filesResponse === "object" && !Array.isArray(filesResponse)) {
//       return filesResponse;
//     }
//     if (Array.isArray(filesResponse)) {
//       const entries = filesResponse
//         .map((url, index) => [
//           `file_${Date.now()}_${index}`,
//           typeof url === "string" ? url : url?.url || "",
//         ])
//         .filter(([, url]) => Boolean(url));
//       return Object.fromEntries(entries);
//     }
//     return {};
//   };

//   const handleFileChange = async (e) => {
//     const file = e.target.files[0]; 
//     if (!file) return;

//     const tempKey = `temp_${Date.now()}`;
//     const tempUrl = URL.createObjectURL(file);
//     onUploadSuccess?.({ [tempKey]: tempUrl });

//     try {
//       const formData = new FormData();
//       formData.append("new_files", file);

//       const response = await patchCustomerFiles(patient.id, formData);


//       const filesFromResp =
//         response?.answers?.files || response?.files || response;
//       const normalized = normalizeFiles(filesFromResp);

//       onUploadSuccess?.(normalized);

//       if (response?.message) {
//         alert(response.message);
//       }
//       console.log("Upload response:", response);
//     } catch (error) {
//       console.error("Error uploading file:", error);
//       alert(error.response?.data?.message || "Upload failed!");
//     } finally {
      
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     }
//   };

//   return (
//     <Box
//       sx={{
//         border: "2px dashed #D1D5DB",
//         borderRadius: 2,
//         p: 2,
//         textAlign: "center",
//         backgroundColor: "#FAFAFA",
//         height: "100%",
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//         cursor: "pointer",
//         "&:hover": { backgroundColor: "#F3F4F6" },
//       }}
//       onClick={handleClick}
//     >
//       <CloudUploadIcon sx={{ fontSize: 40, color: "#9CA3AF", mb: 2 }} />
//       <Typography variant="body1" sx={{ color: "#374151", mb: 1 }}>
//         Drag and drop
//       </Typography>
//       <Typography variant="body2" sx={{ color: "#6B7280" }}>
//         Or click to browse your files
//       </Typography>
//       <input
//         type="file"
//         accept="image/*,application/pdf"
//         ref={fileInputRef}
//         style={{ display: "none" }}
//         onChange={handleFileChange}
//       />
//     </Box>
//   );
// };

// export default FileUploadBox;

import React, { useRef } from "react";
import { Box, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { patchCustomerFiles } from "../services/api";

const FileUploadBox = ({ patient, onUploadSuccess }) => {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const normalizeFiles = (filesResponse) => {
    if (!filesResponse) return {};
    if (typeof filesResponse === "object" && !Array.isArray(filesResponse)) {
      return filesResponse;
    }
    if (Array.isArray(filesResponse)) {
      const entries = filesResponse
        .map((url, index) => [
          `file_${Date.now()}_${index}`,
          typeof url === "string" ? url : url?.url || "",
        ])
        .filter(([, url]) => Boolean(url));
      return Object.fromEntries(entries);
    }
    return {};
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optimistic preview so UI updates immediately
    const tempKey = `temp_${Date.now()}`;
    const tempUrl = URL.createObjectURL(file);
    onUploadSuccess?.({ [tempKey]: tempUrl });

    try {
      const formData = new FormData();
      formData.append("new_files", file);

      const response = await patchCustomerFiles(patient.id, formData);

      // Our http wrapper returns response.data directly
      // Try common shapes: { files }, { answers: { files } }, array
      const filesFromResp =
        response?.answers?.files || response?.files || response;
      const normalized = normalizeFiles(filesFromResp);

      // Replace temp preview with the definitive server response
      onUploadSuccess?.(normalized, { replace: true });

      if (response?.message) {
        // Non-blocking toast via alert for now (consistent with existing code)
        alert(response.message);
      }
      console.log("Upload response:", response);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(error.response?.data?.message || "Upload failed!");
    } finally {
      // Allow selecting the same file again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Box
      sx={{
        border: "2px dashed #D1D5DB",
        borderRadius: 2,
        p: 2,
        textAlign: "center",
        backgroundColor: "#FAFAFA",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        "&:hover": { backgroundColor: "#F3F4F6" },
      }}
      onClick={handleClick}
    >
      <CloudUploadIcon sx={{ fontSize: 40, color: "#9CA3AF", mb: 2 }} />
      <Typography variant="body1" sx={{ color: "#374151", mb: 1 }}>
        Drag and drop
      </Typography>
      <Typography variant="body2" sx={{ color: "#6B7280" }}>
        Or click to browse your files
      </Typography>
      <input
        type="file"
        accept="image/*,application/pdf"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </Box>
  );
};

export default FileUploadBox;
