import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentQuestionIndex: 0,
  answers: {
    name: '',
    phone: '',
    consent_info: null,
    referral_check: '',
    demographics_dob: '',
    demographics_health_card: '',
    demographics_sex_assigned_at_birth: '',
    demographics_email: '',
    demographics_address: '',
    demographics_phone: '',
    has_ohip: null,
    ohip_number: '',
    alternative_insurance: '',
    blue_cross_id_upload: null,
    blue_cross_documents: [],
    payment_confirmation: null
  },
  chatHistory: [],
  isCompleted: false,
  isLoading: false,
  currentStep: 2,
  isStreamingActive: false,
  isAwaitingConfirmation: false,
  welcomeStreamed: false
};

const chatFlowSlice = createSlice({
  name: 'chatFlow',
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
      } else {
        state.answers[field] = value;
      }
    },
    
    addToChatHistory: (state, action) => {
      state.chatHistory.push(action.payload);
    },
    
    removeFromChatHistory: (state, action) => {
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
    
    completeChatFlow: (state) => {
      state.isCompleted = true;
    },
    
    resetChatFlow: (state) => {
      return { ...initialState };
    },
    
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    loadFromStorage: (state, action) => {
      return { ...state, ...action.payload };
    },
    
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload;
    },
    
    setStreamingActive: (state, action) => {
      state.isStreamingActive = action.payload;
    },
    
    setAwaitingConfirmation: (state, action) => {
      state.isAwaitingConfirmation = action.payload;
    },
    
    setWelcomeStreamed: (state, action) => {
      state.welcomeStreamed = action.payload;
    }
  }
});

export const {
  setAnswer,
  addToChatHistory,
  removeFromChatHistory,
  nextQuestion,
  prevQuestion,
  setCurrentQuestion,
  completeChatFlow,
  resetChatFlow,
  setLoading,
  loadFromStorage,
  setCurrentStep,
  setStreamingActive,
  setAwaitingConfirmation,
  setWelcomeStreamed
} = chatFlowSlice.actions;

export default chatFlowSlice.reducer;
