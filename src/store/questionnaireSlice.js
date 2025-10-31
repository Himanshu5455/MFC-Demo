import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentQuestionIndex: 0,
  answers: {
    name: '',
    email: '',
    phone: '',
    referral_reason: '',
    partner_available: null,
    partner_name: '',
    alternative_no: '',
    physician: '',
    region: '',
    dob: '',
    OHIP: '',
    gender: '',
    full_address: '',
    refer_physician_available: null,
    refer_physician_name: '',
    refer_physician_email: '',
    refer_physician_address: '',
    refer_physician_fax_no: '',
    refer_physician_OHIP_no: '',
    refer_physician_region: '',
    pain_scale: '',
    positive_experience: null,
    rate_experience: 0,
    comment: '',
    files_permission: null,
    files: [],
    blue_cross_documents: []
  },
  chatHistory: [],
  isCompleted: false,
  isLoading: false
};

const questionnaireSlice = createSlice({
  name: 'questionnaire',
  initialState,
  reducers: {
    setAnswer: (state, action) => {
      const { field, value } = action.payload;
      
      // Handle file uploads - convert File objects to serializable format
      if (field === 'blue_cross_documents' && Array.isArray(value)) {
        state.answers[field] = value.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }));
      } else if (field === 'files' && Array.isArray(value)) {
        state.answers[field] = value.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        }));
      } else {
        state.answers[field] = value;
      }
    },
    addToChatHistory: (state, action) => {
      state.chatHistory.push(action.payload);
    },
    removeToChatHistory: (state, action) => {
      state.chatHistory = state.chatHistory.filter(msg => msg.questionId !== action.payload);
    },
    nextQuestion: (state) => {
      state.currentQuestionIndex += 1;
    },
    prevQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
      }
    },
    setCurrentQuestion: (state, action) => {
      state.currentQuestionIndex = action.payload;
    },
    completeQuestionnaire: (state) => {
      state.isCompleted = true;
    },
    resetQuestionnaire: (state) => {
      return { ...initialState };
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    loadFromStorage: (state, action) => {
      return { ...state, ...action.payload };
    }
  }
});

export const {
  setAnswer,
  addToChatHistory,
  removeToChatHistory,
  nextQuestion,
  prevQuestion,
  setCurrentQuestion,
  completeQuestionnaire,
  resetQuestionnaire,
  setLoading,
  loadFromStorage
} = questionnaireSlice.actions;

export default questionnaireSlice.reducer;
