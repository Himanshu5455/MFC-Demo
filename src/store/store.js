import { configureStore } from '@reduxjs/toolkit';
import questionnaireReducer from './questionnaireSlice';
import chatFlowReducer from './chatFlowSlice';

export const store = configureStore({
  reducer: {
    questionnaire: questionnaireReducer,
    chatFlow: chatFlowReducer,
  },
});
