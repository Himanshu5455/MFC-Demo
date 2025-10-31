import React, { useState, useRef } from 'react';
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
  ListItemSecondaryAction
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import AddIcon from '@mui/icons-material/Add';

const ChatInput = ({ question, currentAnswer, onAnswer, disabled }) => {
  const [inputValue, setInputValue] = useState(currentAnswer || '');
  const [files, setFiles] = useState(currentAnswer && Array.isArray(currentAnswer) ? currentAnswer : []);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleSubmit = (value = inputValue) => {
    // For file inputs, use files array instead of inputValue
    const submitValue = question.type === 'file' ? files : value;
    
    if (question.required && (!submitValue || (Array.isArray(submitValue) && submitValue.length === 0) || submitValue === '')) {
      setError(`${question.question} is required`);
      return;
    }

    if (question.validation) {
      const validationError = question.validation(submitValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError('');
    onAnswer(submitValue);
    
    // Clear inputs based on type
    if (question.type === 'file') {
      setFiles([]);
    } else {
      setInputValue('');
    }
  };

  const handleFileUpload = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const fileData = selectedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }));
    
    setFiles(prev => [...prev, ...fileData]);
    
    // Clear the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const renderInput = () => {
    switch (question.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            alignItems: 'flex-end',
            px: { xs: 1, sm: 2 }
          }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled}
              error={!!error}
              helperText={error}
              type={question.type}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 20,
                  backgroundColor: 'white',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }
              }}
            />
            <IconButton
              onClick={() => handleSubmit()}
              disabled={disabled || !inputValue.trim()}
              sx={{
                bgcolor: '#1976d2',
                color: 'white',
                width: 40,
                height: 40,
                '&:hover': { bgcolor: '#1565c0' },
                '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' }
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        );

      case 'boolean':
        return (
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            px: { xs: 1, sm: 2 },
            py: 1
          }}>
            <Button
              variant={inputValue === true ? 'contained' : 'outlined'}
              onClick={() => handleSubmit(true)}
              disabled={disabled}
              sx={{
                flex: 1,
                bgcolor: inputValue === true ? '#4caf50' : 'transparent',
                borderColor: '#4caf50',
                color: inputValue === true ? 'white' : '#4caf50',
                '&:hover': {
                  bgcolor: inputValue === true ? '#45a049' : '#e8f5e8'
                },
                borderRadius: 20,
                textTransform: 'none'
              }}
            >
              Yes
            </Button>
            <Button
              variant={inputValue === false ? 'contained' : 'outlined'}
              onClick={() => handleSubmit(false)}
              disabled={disabled}
              sx={{
                flex: 1,
                bgcolor: inputValue === false ? '#f44336' : 'transparent',
                borderColor: '#f44336',
                color: inputValue === false ? 'white' : '#f44336',
                '&:hover': {
                  bgcolor: inputValue === false ? '#d32f2f' : '#ffebee'
                },
                borderRadius: 20,
                textTransform: 'none'
              }}
            >
              No
            </Button>
          </Box>
        );

      case 'file':
        return (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 2,
            px: { xs: 1, sm: 2 },
            py: 1
          }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept={question.accept || "*/*"}
              multiple={question.multiple || false}
              style={{ display: 'none' }}
            />
            
            {files.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, maxHeight: 150, overflow: 'auto' }}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: '#374151' }}>
                  Selected Files:
                </Typography>
                <List dense>
                  {files.map((file, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <AttachFileIcon sx={{ mr: 1, color: '#1976d2', fontSize: 16 }} />
                      <ListItemText
                        primary={file.name}
                        secondary={`${(file.size / 1024).toFixed(1)} KB`}
                        sx={{ 
                          '& .MuiListItemText-primary': { fontSize: '0.875rem' },
                          '& .MuiListItemText-secondary': { fontSize: '0.75rem' }
                        }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => handleRemoveFile(index)}
                          sx={{ color: '#EF4444' }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
            
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                sx={{
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  '&:hover': {
                    borderColor: '#1565c0',
                    bgcolor: '#e3f2fd'
                  },
                  borderRadius: 20,
                  textTransform: 'none',
                  flex: 1
                }}
              >
                Send a image
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<AttachFileIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                sx={{
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  '&:hover': {
                    borderColor: '#1565c0',
                    bgcolor: '#e3f2fd'
                  },
                  borderRadius: 20,
                  textTransform: 'none',
                  flex: 1
                }}
              >
                Send a file
              </Button>
            </Box>
            
            {files.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <IconButton
                  onClick={() => handleSubmit()}
                  disabled={disabled}
                  sx={{
                    bgcolor: '#1976d2',
                    color: 'white',
                    width: 48,
                    height: 48,
                    '&:hover': { bgcolor: '#1565c0' }
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            )}
            
            {error && (
              <Typography variant="caption" color="error" sx={{ mt: 1, textAlign: 'center' }}>
                {error}
              </Typography>
            )}
          </Box>
        );

      default:
        return (
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            alignItems: 'flex-end',
            px: { xs: 1, sm: 2 }
          }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled}
              error={!!error}
              helperText={error}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 20,
                  backgroundColor: 'white'
                }
              }}
            />
            <IconButton
              onClick={() => handleSubmit()}
              disabled={disabled || !inputValue.trim()}
              sx={{
                bgcolor: '#1976d2',
                color: 'white',
                width: 40,
                height: 40,
                '&:hover': { bgcolor: '#1565c0' },
                '&:disabled': { bgcolor: '#E5E7EB', color: '#9CA3AF' }
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        );
    }
  };

  return (
    <Box sx={{ py: 1 }}>
      {renderInput()}
      {/* Add Button at the bottom for mobile interface */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mt: 1,
        px: { xs: 1, sm: 2 }
      }}>
        <IconButton
          sx={{
            bgcolor: '#f5f5f5',
            color: '#666',
            width: 32,
            height: 32,
            '&:hover': { bgcolor: '#e0e0e0' }
          }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatInput;
