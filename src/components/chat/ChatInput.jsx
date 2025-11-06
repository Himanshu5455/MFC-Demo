import React, { useState, useRef, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import {
  Box,
  TextField,
  Button,
  IconButton,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AddIcon from "@mui/icons-material/Add";

const ChatInput = ({
  question,
  currentAnswer,
  onAnswer,
  disabled,
  isStreamingActive,
  filesPermission,
  isEditing,
}) => {
  const [inputValue, setInputValue] = useState(currentAnswer || "");
  const [validationError, setValidationError] = useState("");

  // Initialize files state with safety checks
  const [files, setFiles] = useState(() => {
    if (currentAnswer && Array.isArray(currentAnswer)) {
      return currentAnswer.map((file) => {
        if (typeof file === "string") {
          return { name: file };
        }
        return {
          name: file.name || "Unnamed File",
          size: file.size || 0,
          type: file.type || "application/octet-stream",
          _file: file.file || null,
        };
      });
    }
    return [];
  });
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  // Initialize files from currentAnswer if it exists
  useEffect(() => {
    if (currentAnswer && Array.isArray(currentAnswer)) {
      const initialFiles = currentAnswer.map((file) => {
        if (typeof file === "string") {
          return { name: file };
        }
        return {
          name: file.name || "Unnamed File",
          size: file.size || 0,
          type: file.type || "application/octet-stream",
          _file: file.file || null,
        };
      });
      setFiles(initialFiles);
    }
  }, []);

  // On question change: if editing from summary, prefill with existing answer; otherwise clear
  useEffect(() => {
    if (isEditing) {
      if (question?.type === "file" && Array.isArray(currentAnswer)) {
        const initialFiles = currentAnswer.map((file) => {
          if (typeof file === "string") {
            return { name: file, isUrl: true };
          }
          return {
            name: file.name || "",
            size: file.size || 0,
            type: file.type || "",
            file: file,
          };
        });
        setFiles(initialFiles);
        setInputValue("");
      } else if (question?.type === "date") {
        // currentAnswer might be in DD/MM/YYYY; convert to Date for picker
        if (
          typeof currentAnswer === "string" &&
          currentAnswer.match(/^\d{2}\/\d{2}\/\d{4}$/)
        ) {
          const [dd, mm, yyyy] = currentAnswer.split("/");
          const formattedDate = `${yyyy}-${mm}-${dd}`; // backend expects YYYY-MM-DD
          console.log(formattedDate);
          setInputValue(formattedDate);
        } else {
          setInputValue(currentAnswer || "");
        }
        setFiles([]);
      } else {
        setInputValue(currentAnswer || "");
        setFiles([]);
      }
    } else {
      if (question?.type === "file" && Array.isArray(currentAnswer)) {
        setFiles(currentAnswer);
        setInputValue("");
      } else {
        setInputValue("");
        setFiles([]);
      }
    }
    setError("");
  }, [question?.id, isEditing]);

  const handleSubmit = (value = inputValue) => {
    console.log("inputValue,inputValue", inputValue);
    // Prevent submission if streaming is active
    if (isStreamingActive) {
      return;
    }

    let submitValue;

    // Special handling for files_permission question
    if (question.id === "files_permission") {
      if (value === false) {
        setError("");
        onAnswer(false);
        return; // exit early
      }
    }

    // Normalize values based on question type
    if (question.type === "file") {
      // Create a safe representation of files for submission
      submitValue = files.map((fileInfo) => ({
        name: fileInfo.name,
        size: fileInfo.size,
        type: fileInfo.type,
        // Include the actual File object if available
        file: fileInfo._file || null,
      }));
    } else if (question.type === "date") {
      if (value instanceof Date) {
        const d = value;
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = String(d.getFullYear());
        submitValue = `${day}/${month}/${year}`;
      } else if (typeof value === "string" && value.includes("-")) {
        const parts = value.split("-");
        if (parts.length === 3) {
          submitValue = `${parts[2]}/${parts[1]}/${parts[0]}`;
        } else {
          submitValue = value || "";
        }
      } else {
        submitValue = value || "";
      }
    } else if (question.type === "boolean") {
      // Convert text input to boolean for boolean questions
      if (typeof value === "string") {
        const lowerValue = value.toLowerCase().trim();
        if (
          lowerValue === "yes" ||
          lowerValue === "true" ||
          lowerValue === "y"
        ) {
          submitValue = true;
        } else if (
          lowerValue === "no" ||
          lowerValue === "false" ||
          lowerValue === "n"
        ) {
          submitValue = false;
        } else {
          // If it's not a recognizable boolean value, treat as text
          submitValue = value;
        }
      } else {
        submitValue = value;
      }
    } else {
      submitValue = value;
    }

    if (
      question.required &&
      (!submitValue ||
        (Array.isArray(submitValue) && submitValue.length === 0) ||
        submitValue === "")
    ) {
      if (question.id === "files" && filesPermission === false) {
      } else {
        setError(`${question.question} is required`);
        return;
      }
    }

    if (question.validation) {
      const validationError = question.validation(submitValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError("");
    onAnswer(submitValue);

    // Clear inputs based on type
    if (question.type === "file") {
      setFiles([]);
    } else {
      setInputValue("");
    }
  };

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files || []).map((file) => {
      // Create a safe representation of the file
      return {
        name: file.name || "Unnamed File",
        size: file.size || 0,
        type: file.type || "application/octet-stream",
        // Store the original file separately for submission
        _file: file,
      };
    });

    setFiles((prev) => [...prev, ...selectedFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const validateFullName = (value) => {
    // Only letters and spaces allowed
    const nameRegex = /^[A-Za-z\s]+$/;

    if (!value.trim()) {
      return "Full name is required.";
    }

    if (!nameRegex.test(value)) {
      return "Name can only include letters and spaces.";
    }

    const words = value.trim().split(/\s+/);
    if (words.length < 2) {
      return "To ensure we have everything spelled correctly for your records, could you please tell me your full name (first and last name)?";
    }

    return "";
  };

  const handleChange = (e) => {
    console.log("question.id", question.id);
    const value = e.target.value;
    setInputValue(value);

    // intro means name field
    if (question.id === "intro") {
      const errorMsg = validateFullName(value);
      setValidationError(errorMsg);
    } else {
      setValidationError("");
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case "text":
      case "email":
      case "tel":
        // return (
        //   <Box
        //     sx={{
        //       display: "flex",
        //       gap: 1,
        //       alignItems: "center",
        //       width: "100%",
        //       px: { xs: 1, sm: 2 },
        //     }}
        //   >
        //     <TextField
        //       fullWidth
        //       variant="outlined"
        //       placeholder="Type a message..."
        //       value={inputValue}
        //       onChange={handleChange}
        //       onKeyPress={handleKeyPress}
        //       disabled={disabled}
        //       type={question.type}
        //       size="small"
        //       sx={{
        //         flex: 1,
        //         "& .MuiOutlinedInput-root": {
        //           borderRadius: 20,
        //           backgroundColor: "white",
        //           fontSize: { xs: "0.875rem", sm: "1rem" },
        //         },
        //       }}
        //     />
        //     <IconButton
        //       onClick={() => handleSubmit()}
        //       disabled={
        //         disabled ||
        //         (typeof inputValue === "string"
        //           ? !inputValue.trim()
        //           : !inputValue) ||
        //         isStreamingActive
        //       }
        //       sx={{
        //         bgcolor: "#125A67",
        //         color: "white !important",
        //         width: 40,
        //         height: 40,
        //         flexShrink: 0,
        //         "&:hover": { bgcolor: "#0d434c", color: "white !important" },
        //         "&:disabled": { bgcolor: "#e0e0e0", color: "#9CA3AF" },
        //       }}
        //     >
        //       <SendIcon sx={{ color: "white" }} />
        //     </IconButton>
        //   </Box>
        // );
        return (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              width: "100%",
              px: { xs: 1, sm: 2 },
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={inputValue}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              disabled={disabled}
              type={question.type}
              size="small"
              error={!!validationError}
              helperText={validationError}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 20,
                  backgroundColor: "white",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                },
              }}
            />
            <IconButton
              onClick={() => {
                if (!validationError && inputValue.trim()) handleSubmit();
                else setError(validateFullName(inputValue));
              }}
              disabled={
                disabled ||
                !inputValue.trim() ||
                !!validationError ||
                isStreamingActive
              }
              sx={{
                bgcolor: "#125A67",
                color: "white !important",
                width: 40,
                height: 40,
                flexShrink: 0,
                "&:hover": { bgcolor: "#0d434c", color: "white !important" },
                "&:disabled": { bgcolor: "#e0e0e0", color: "#9CA3AF" },
              }}
            >
              <SendIcon sx={{ color: "white" }} />
            </IconButton>
          </Box>
        );

      case "boolean":
        return (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              width: "100%",
              px: { xs: 1, sm: 2 },
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your response..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled}
              size="small"
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 20,
                  backgroundColor: "white",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                },
              }}
            />
            <IconButton
              onClick={() => handleSubmit()}
              disabled={
                disabled ||
                (typeof inputValue === "string"
                  ? !inputValue.trim()
                  : !inputValue) ||
                isStreamingActive
              }
              sx={{
                bgcolor: "#125A67",
                color: "white !important",
                width: 40,
                height: 40,
                flexShrink: 0,
                "&:hover": { bgcolor: "#0d434c", color: "white !important" },
                "&:disabled": { bgcolor: "#e0e0e0", color: "#9CA3AF" },
              }}
            >
              <SendIcon sx={{ color: "white" }} />
            </IconButton>
          </Box>
        );

      case "select":
        return (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              width: "100%",
              px: { xs: 1, sm: 2 },
            }}
          >
            <IconButton
              sx={{
                color: "#125A67",
                width: 40,
                height: 40,
                flexShrink: 0,
                "&:hover": {
                  bgcolor: "rgba(18, 90, 103, 0.08)",
                  color: "#0d434c",
                },
              }}
            >
              <AddIcon fontSize="medium" />
            </IconButton>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled}
              size="small"
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 20,
                  backgroundColor: "white",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  "& fieldset": { borderColor: "#e0e0e0" },
                  "&:hover fieldset": { borderColor: "#125A67" },
                  "&.Mui-focused fieldset": { borderColor: "#125A67" },
                },
              }}
            />
            <IconButton
              onClick={() => handleSubmit()}
              disabled={
                disabled ||
                (typeof inputValue === "string"
                  ? !inputValue.trim()
                  : !inputValue) ||
                isStreamingActive
              }
              sx={{
                bgcolor: "#125A67",
                color: "white !important",
                width: 40,
                height: 40,
                flexShrink: 0,
                "&:hover": { bgcolor: "#0d434c", color: "white !important" },
                "&:disabled": { bgcolor: "#e0e0e0", color: "#9CA3AF" },
              }}
            >
              <SendIcon sx={{ color: "white" }} />
            </IconButton>
          </Box>
        );

      case "date":
        return (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              width: "100%",
              px: { xs: 1, sm: 2 },
            }}
          >
            <IconButton
              sx={{
                color: "#125A67",
                width: 40,
                height: 40,
                flexShrink: 0,
                "&:hover": {
                  bgcolor: "rgba(18, 90, 103, 0.08)",
                  color: "#0d434c",
                },
              }}
            >
              <AddIcon fontSize="medium" />
            </IconButton>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Select your date of birth"
                value={inputValue || null}
                onChange={(newValue) => setInputValue(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true, // ✅ makes it stretch full width
                    size: "small",
                    disabled: disabled,
                    sx: {
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 20,
                        backgroundColor: "white",
                      },
                    },
                  },
                }}
                maxDate={new Date()} // ✅ optional: prevent picking future dates
              />
            </LocalizationProvider>

            <IconButton
              onClick={() => handleSubmit(inputValue)}
              disabled={!inputValue || disabled || isStreamingActive}
              sx={{
                bgcolor: "#125A67",
                color: "white !important",
                width: 40,
                height: 40,
                flexShrink: 0,
                "&:hover": { bgcolor: "#0d434c", color: "white !important" },
                "&:disabled": { bgcolor: "#e0e0e0", color: "#9CA3AF" },
              }}
            >
              <SendIcon sx={{ color: "white" }} />
            </IconButton>
          </Box>
        );

      case "file":
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              width: "100%",
              px: { xs: 1, sm: 2 },
              py: 0.5,
              minHeight: "60px",
              justifyContent: "flex-end",
            }}
          >
            {/* hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept={question.accept || "*/*"}
              multiple={question.multiple || false}
              style={{ display: "none" }}
            />

            {/* preview uploaded files */}
            {files.length > 0 && (
              <Paper
                variant="outlined"
                sx={{ p: 1, maxHeight: 80, overflow: "auto" }}
              >
                <Typography
                  variant="caption"
                  sx={{ mb: 0.5, color: "#374151", display: "block" }}
                >
                  Files: {files.length}
                </Typography>
                <List dense sx={{ py: 0 }}>
                  {files.map((fileInfo, index) => (
                    <ListItem key={index} sx={{ px: 0, py: 0.25 }}>
                      <AttachFileIcon
                        sx={{ mr: 0.5, color: "#125A67", fontSize: 14 }}
                      />
                      <ListItemText
                        primary={
                          typeof fileInfo === "string"
                            ? fileInfo
                            : fileInfo.name || "Unnamed File"
                        }
                        secondary={
                          typeof fileInfo === "string"
                            ? ""
                            : fileInfo.size
                            ? `${(fileInfo.size / 1024).toFixed(1)} KB`
                            : ""
                        }
                        sx={{
                          "& .MuiListItemText-primary": { fontSize: "0.75rem" },
                          "& .MuiListItemText-secondary": {
                            fontSize: "0.65rem",
                          },
                        }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleRemoveFile(index)}
                          sx={{ color: "#EF4444" }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {/* single upload button */}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                sx={{
                  borderColor: "#125A67",
                  color: "#125A67",
                  "&:hover": {
                    borderColor: "#0d434c",
                    bgcolor: "#125A67",
                    color: "white",
                  },
                  borderRadius: 20,
                  textTransform: "none",
                  flex: 1,
                }}
              >
                Upload files
              </Button>
            </Box>

            {/* send button after upload */}
            {files.length > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <IconButton
                  onClick={() => handleSubmit()}
                  disabled={disabled || isStreamingActive}
                  sx={{
                    bgcolor: "#125A67",
                    color: "white !important",
                    width: 48,
                    height: 48,
                    "&:hover": {
                      bgcolor: "#0d434c",
                      color: "white !important",
                    },
                  }}
                >
                  <SendIcon sx={{ color: "white" }} />
                </IconButton>
              </Box>
            )}

            {error && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 1, textAlign: "center" }}
              >
                {error}
              </Typography>
            )}
          </Box>
        );

      default:
        return (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              width: "100%",
              px: { xs: 1, sm: 2 },
            }}
          >
            <IconButton
              sx={{
                color: "#125A67",
                width: 40,
                height: 40,
                flexShrink: 0,
                "&:hover": {
                  bgcolor: "rgba(18, 90, 103, 0.08)",
                  color: "#0d434c",
                },
              }}
            >
              <AddIcon fontSize="medium" />
            </IconButton>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled}
              size="small"
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 20,
                  backgroundColor: "white",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                },
              }}
            />
            <IconButton
              onClick={() => handleSubmit()}
              disabled={
                disabled ||
                (typeof inputValue === "string"
                  ? !inputValue.trim()
                  : !inputValue) ||
                isStreamingActive
              }
              sx={{
                bgcolor: "#125A67",
                color: "white !important",
                width: 40,
                height: 40,
                flexShrink: 0,
                "&:hover": { bgcolor: "#0d434c", color: "white !important" },
                "&:disabled": { bgcolor: "#e0e0e0", color: "#9CA3AF" },
              }}
            >
              <SendIcon sx={{ color: "white" }} />
            </IconButton>
          </Box>
        );
    }
  };

  return (
    <Box
      sx={{
        minHeight: "60px",
        minWidth: "100%",
        display: "flex",
        alignItems: "flex-end",
        width: "100%",
      }}
    >
      {renderInput()}
    </Box>
  );
};

export default ChatInput;
