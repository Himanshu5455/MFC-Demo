
import {
  addToChatHistory,
  removeToChatHistory,
} from "../store/questionnaireSlice";

export const addTypingIndicator = (dispatch) => {
  const thinkingMessageId = Date.now();
  dispatch(
    addToChatHistory({
      type: "bot",
      message: "",
      isTyping: true,
      timestamp: new Date().toISOString(),
      questionId: `thinking-${thinkingMessageId}`,
    })
  );
  return thinkingMessageId;
};

export const removeTypingIndicator = (dispatch, thinkingMessageId) => {
  dispatch(removeToChatHistory(`thinking-${thinkingMessageId}`));
};

export const withTyping = (dispatch, delayMs, callback) => {
  const id = addTypingIndicator(dispatch);
  setTimeout(() => {
    removeTypingIndicator(dispatch, id);
    callback();
  }, delayMs);
};

export const formatUserAnswer = (question, value) => {
  switch (question.type) {
    case "boolean":
      return value ? "Yes" : "No";
    case "select": {
      const option = question.options?.find((opt) => opt.value === value);
      return option ? option.label : value;
    }
    case "rating":
      return `${value} star${value !== 1 ? "s" : ""}`;
    case "scale": {
      const num = Number(value);
      const clamped = Number.isNaN(num) ? value : Math.max(1, Math.min(5, num));
      return `${clamped}/5`;
    }
    case "file":
      if (Array.isArray(value)) {
        return value.length > 0
          ? `Uploaded ${value.length} file${
              value.length > 1 ? "s" : ""
            }: ${value.map((f) => f.name).join(", ")}`
          : "No files uploaded";
      }
      return value;
    default:
      return value;
  }
};
