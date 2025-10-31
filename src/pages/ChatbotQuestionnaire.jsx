import React, { useEffect, useRef, useState } from "react";

import { getVisibleQuestions } from "../data/questions";
import { useSelector, useDispatch } from "react-redux";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ChatMessage from "../components/chat/ChatMessage";
import ChatInput from "../components/chat/ChatInput";
import ChatHeader from "../components/chat/ChatHeader";
import Completion from "../components/chat/Completion";
import {
  setAnswer,
  addToChatHistory,
  nextQuestion,
  completeQuestionnaire,
  resetQuestionnaire,
  setCurrentQuestion,
} from "../store/questionnaireSlice";
import { QUESTIONS } from "../data/questions";
import { registerCustomer, serializeCustomerPayload } from "../services/api";
import { withTyping, formatUserAnswer } from "../utils/chatHelpers";
import { buildSummary, mergeWithStoredAnswers } from "../utils/summary";
import {
  cacheFiles,
  getFilesFromMeta,
  clearFileCache,
} from "../utils/fileStore";

const ChatbotQuestionnaire = () => {
  const [welcomeStreamed, setWelcomeStreamed] = useState(false);
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { currentQuestionIndex, answers, chatHistory, isCompleted } =
    useSelector((state) => state.questionnaire);

  const chatContainerRef = useRef(null);
  const initializedRef = useRef(false);

  const visibleQuestions = getVisibleQuestions(answers);
  const currentQuestion = visibleQuestions[currentQuestionIndex];

  const [isStreamingActive, setIsStreamingActive] = useState(false);
  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);
  const [isReturnToSummary, setIsReturnToSummary] = useState(false);

  // Handler for when streaming completes
  const handleStreamingComplete = () => {
    setIsStreamingActive(false);
    if (!welcomeStreamed && chatHistory.length > 0) {
      const lastMsg = chatHistory[chatHistory.length - 1];
      if (lastMsg.questionId === "welcome" && chatHistory.length === 1) {
        setWelcomeStreamed(true);
        setIsStreamingActive(true);
        const firstQuestion = getVisibleQuestions(answers)[0];
        const messageData = {
          type: "bot",
          message: firstQuestion.question,
          timestamp: new Date().toISOString(),
          questionId: firstQuestion.id,
          shouldStream: true,
        };
        if (firstQuestion.type === "select" && firstQuestion.options) {
          messageData.options = firstQuestion.options;
        } else if (firstQuestion.type === "boolean") {
          messageData.showBooleanOptions = true;
        }
        dispatch(addToChatHistory(messageData));
      }
    }
  };

  // Check if user has started messaging (answered at least one question)
  const hasUserStartedMessaging = Object.values(answers).some(
    (value) =>
      value !== "" &&
      value !== null &&
      value !== undefined &&
      !(Array.isArray(value) && value.length === 0)
  );

  // Reset chat function
  const handleStartNewChat = () => {
    dispatch(resetQuestionnaire());
    localStorage.removeItem("questionnaire");
    try {
      clearFileCache();
    } catch {}
    initializedRef.current = false;
    setIsAwaitingConfirmation(false);
    setWelcomeStreamed(false);
    // Only send welcome message; first question will be sent after streaming completes
    setTimeout(() => {
      setIsStreamingActive(true);
      dispatch(
        addToChatHistory({
          type: "bot",
          message:
            "Hello! I'm Maya, your medical triage assistant. I'll help you by asking a few questions to understand your situation better.",
          timestamp: new Date().toISOString(),
          questionId: "welcome",
          shouldStream: true,
        })
      );
    }, 500);
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  // Always initialize a fresh chat on first mount
  useEffect(() => {
    if (initializedRef.current) return;
    try {
      localStorage.removeItem("questionnaire");
      clearFileCache();
    } catch {}
    dispatch(resetQuestionnaire());
    setWelcomeStreamed(false);
    setIsStreamingActive(true);
    dispatch(
      addToChatHistory({
        type: "bot",
        message:
          "Hello! I'm Maya, your medical triage assistant. I'll help you by asking a few questions to understand your situation better.",
        timestamp: new Date().toISOString(),
        questionId: "welcome",
        shouldStream: true,
      })
    );
    initializedRef.current = true;
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      currentQuestionIndex,
      answers,
      chatHistory,
      isCompleted,
    };
    localStorage.setItem("questionnaire", JSON.stringify(dataToSave));
  }, [currentQuestionIndex, answers, chatHistory, isCompleted]);

  const handleAnswer = (value) => {
    const question = currentQuestion; // already from visibleQuestions
    if (!question) return;

    // Add user message
    dispatch(
      addToChatHistory({
        type: "user",
        message: formatUserAnswer(question, value),
        timestamp: new Date().toISOString(),
        questionId: question.id,
      })
    );

    // Normalize specific types before saving
    let normalizedValue = value;
    if (question.type === "scale") {
      const num = Number(value);
      if (!Number.isNaN(num)) {
        const clamped = Math.max(1, Math.min(5, num));
        normalizedValue = clamped;
      }
    }
    if (question.type === "file" && Array.isArray(value)) {
      const containsFiles = value.some(
        (v) => v instanceof File || v instanceof Blob
      );
      if (containsFiles) {
        try {
          normalizedValue = cacheFiles(value); // store only serializable metadata in Redux
        } catch {
          normalizedValue = value.map((f) => ({
            name: f?.name,
            size: f?.size,
          }));
        }
      } else {
        normalizedValue = value; // already metadata
      }
    }

    // Save answer
    dispatch(
      setAnswer({
        field: question.id,
        value: normalizedValue,
      })
    );

    // Handle consent response
    if (question.id === 'consent_info' && normalizedValue === false) {
      // User declined consent - show admin contact message and complete questionnaire
      withTyping(dispatch, 1500, () => {
        setIsStreamingActive(true);
        dispatch(
          addToChatHistory({
            type: "bot",
            message: "If you don't feel comfortable sharing your information with me, we’ll refer you to one of our specialists to get in touch with you.",
            timestamp: new Date().toISOString(),
            questionId: "consent-declined",
            shouldStream: true,
          })
        );
        dispatch(completeQuestionnaire());
      });
      return;
    }

    // Handle referral response - proceed to demographics regardless of answer
    if (question.id === 'has_referral') {
      // Add a contextual message based on referral type (only if there is one)
      let contextualMessage = "";
      if (normalizedValue === 'yes_from_sprout') {
        contextualMessage = "Great! Since you're referred from Sprout, we'll proceed with collecting your demographic information. Note that you may not necessarily have an OHIP number.";
      } else if (normalizedValue === 'yes_i_do') {
        contextualMessage = "Perfect! Let's collect your demographic information to get started.";
      }

      // Only add contextual message if there is one
      if (contextualMessage) {
        withTyping(dispatch, 1500, () => {
          setIsStreamingActive(true);
          dispatch(
            addToChatHistory({
              type: "bot",
              message: contextualMessage,
              timestamp: new Date().toISOString(),
              questionId: "referral-context",
              shouldStream: true,
            })
          );
        });
      }

    }

    // If we are editing from summary, regenerate summary immediately and skip normal progression
    if (isReturnToSummary) {
      withTyping(dispatch, 800, () => {
        setIsStreamingActive(true);
        const merged = mergeWithStoredAnswers(answers);
        const summaryText = buildSummary(merged);
        dispatch(
          addToChatHistory({
            type: "bot",
            message: summaryText,
            timestamp: new Date().toISOString(),
            questionId: "summary-info",
            shouldStream: true,
            options: [
              { value: "confirm_summary", label: "Yes, everything is correct" },
              { value: "edit_summary", label: "No, edit my info" },
            ],
          })
        );
      });

      setIsAwaitingConfirmation(true);
      // Ensure we don't continue normal flow
      return;
    }

    // ✅ Recalculate visible questions AFTER saving answer
    const effectiveAnswers = {
      ...answers,
      [question.id]: normalizedValue,
    };
    const updatedVisibleQuestions = getVisibleQuestions(effectiveAnswers);

    const nextIndex = currentQuestionIndex + 1;
    const nextQ = updatedVisibleQuestions[nextIndex];

    if (nextQ) {
      withTyping(dispatch, 1500, () => {
        setIsStreamingActive(true);

        let botMessage = nextQ.question;
        
        // Handle dynamic questions that depend on answers
        if (typeof nextQ.question === 'function') {
          botMessage = nextQ.question(effectiveAnswers);
        }
        
        if (nextQ.id === "exams_to_share") {
          botMessage = "Do you have any exams to share with us?";
        }

        const messageData = {
          type: "bot",
          message: botMessage,
          timestamp: new Date().toISOString(),
          questionId: nextQ.id,
          shouldStream: true,
        };

        if (nextQ.type === "select" && nextQ.options) {
          messageData.options = nextQ.options;
        } else if (nextQ.type === "boolean") {
          messageData.showBooleanOptions = true;
        }

        dispatch(addToChatHistory(messageData));
        dispatch(nextQuestion()); // keep Redux index in sync with visible
      });
    } else {
      // no next → completion
      withTyping(dispatch, 1500, () => {
        setIsStreamingActive(true);

        // If returning to summary after an edit, regenerate and ask again
        if (isReturnToSummary) {
          const merged = mergeWithStoredAnswers(answers);
          const summaryText = buildSummary(merged);
          dispatch(
            addToChatHistory({
              type: "bot",
              message: summaryText,
              timestamp: new Date().toISOString(),
              questionId: "summary-info",
              shouldStream: true,
              options: [
                {
                  value: "confirm_summary",
                  label: "Yes, everything is correct",
                },
                { value: "edit_summary", label: "No, edit my info" },
              ],
            })
          );
          setIsAwaitingConfirmation(true);
          setIsReturnToSummary(false);
        } else if (question.id === "files") {
          // If the last answered question was file upload, add a summary message from localStorage
          const merged = mergeWithStoredAnswers(answers);
          const summaryText = buildSummary(merged);
          dispatch(
            addToChatHistory({
              type: "bot",
              message: summaryText,
              timestamp: new Date().toISOString(),
              questionId: "summary-info",
              shouldStream: true,
              options: [
                {
                  value: "confirm_summary",
                  label: "Yes, everything is correct",
                },
                { value: "edit_summary", label: "No, edit my info" },
              ],
            })
          );

          setIsAwaitingConfirmation(true);
          // Defer completion until user confirms
        } else if (effectiveAnswers?.files_permission === false) {
          // User opted not to upload files → still show summary and proceed to submission
          const merged = mergeWithStoredAnswers(effectiveAnswers);
          const summaryText = buildSummary(merged);
          dispatch(
            addToChatHistory({
              type: "bot",
              message: summaryText,
              timestamp: new Date().toISOString(),
              questionId: "summary-info",
              shouldStream: true,
              options: [
                {
                  value: "confirm_summary",
                  label: "Yes, everything is correct",
                },
                { value: "edit_summary", label: "No, edit my info" },
              ],
            })
          );
          setIsAwaitingConfirmation(true);
          // Defer completion until user confirms
        } else {
          // default completion message
          dispatch(
            addToChatHistory({
              type: "bot",
              message:
                "Thank you for completing the questionnaire! 🎉 We have all the information we need.",
              timestamp: new Date().toISOString(),
              questionId: "completion",
              shouldStream: true,
            })
          );

          // Immediately mark as complete for non-file final step
          dispatch(completeQuestionnaire());
        }
      });
      // Note: completion is dispatched above depending on the path
    }
  };

  const handleOptionClick = (value, label, questionId) => {
    // Handle special confirmation from summary message
    if (questionId === "summary-info" && value === "confirm_summary") {
      withTyping(dispatch, 800, () => {
        setIsStreamingActive(true);
        (async () => {
          try {
            const hydratedFiles = getFilesFromMeta(answers?.files);
            const payload = serializeCustomerPayload({
              ...answers,
              files:
                hydratedFiles && hydratedFiles.length > 0
                  ? hydratedFiles
                  : undefined,
            });
            await registerCustomer(payload);
            dispatch(
              addToChatHistory({
                type: "bot",
                message: "Your information has been submitted successfully. ✅",
                timestamp: new Date().toISOString(),
                questionId: "submit-success",
                shouldStream: true,
              })
            );
          } catch (err) {
            dispatch(
              addToChatHistory({
                type: "bot",
                message: `We could not submit your information. ${
                  err?.message || "Please try again later."
                }`,
                timestamp: new Date().toISOString(),
                questionId: "submit-failed",
                shouldStream: true,
              })
            );
          } finally {
            setTimeout(() => {
              dispatch(
                addToChatHistory({
                  type: "bot",
                  message:
                    "Thank you for completing the questionnaire! 🎉 We have all the information we need.",
                  timestamp: new Date().toISOString(),
                  questionId: "completion",
                  shouldStream: true,
                })
              );
              dispatch(completeQuestionnaire());
              setIsAwaitingConfirmation(false);
            }, 600);
          }
        })();
      });
      return;
    }

    // Handle request to edit from summary
    if (questionId === "summary-info" && value === "edit_summary") {
      setIsReturnToSummary(true);
      dispatch(
        addToChatHistory({
          type: "bot",
          message: "Which detail would you like to update?",
          timestamp: new Date().toISOString(),
          questionId: "edit-fields",
          shouldStream: true,
          options: [
            { value: "name", label: "Full name" },
            { value: "email", label: "Email" },
            { value: "phone", label: "Phone" },
            { value: "dob", label: "DOB" },
            { value: "physician", label: "Referral" },
            { value: "referral_reason", label: "Reason" },
          ],
        })
      );
      return;
    }

    // Handle field selection to edit
    if (questionId === "edit-fields") {
      const fieldId = value;
      const targetIndex = visibleQuestions.findIndex((q) => q.id === fieldId);
      if (targetIndex !== -1) {
        dispatch(setCurrentQuestion(targetIndex));
        setIsAwaitingConfirmation(false);
      }
      return;
    }

    // Only process clicks from the current active question
    if (currentQuestion && questionId === currentQuestion.id) {
      handleAnswer(value);
    } else {
      console.log(
        "Ignoring click from previous question:",
        questionId,
        "Current question:",
        currentQuestion?.id
      );
    }
  };

  // formatUserAnswer imported from utils/chatHelpers

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "#f8f9fa",
      }}
    >
      {/* Desktop Navbar - always visible on desktop */}
      {!isMobile && <Navbar />}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          pt: isMobile ? 0 : 1,
          pb: isMobile ? 0 : 1,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: "100%",
            maxWidth: isMobile ? "100%" : "800px",
            display: "flex",
            flexDirection: "column",
            bgcolor: "white",
            overflow: "hidden",
            ...(isMobile
              ? {}
              : {
                  borderRadius: 2,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                }),
          }}
        >
          {/* Header */}
          <ChatHeader
            isMobile={isMobile}
            hasUserStartedMessaging={hasUserStartedMessaging}
            onStartNewChat={handleStartNewChat}
          />

          {/* Chat Container */}
          <Box
            ref={chatContainerRef}
            sx={{
              flexGrow: 1,
              overflow: "auto",
              bgcolor: "#f8f9fa",
              backgroundImage: isMobile
                ? "none"
                : "linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)",
              display: "flex",
              flexDirection: "column",
              px: isMobile ? 1 : 3,
              py: 2,
              minHeight: 0, // Allow flex shrinking
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                background: "transparent",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#dee2e6",
                borderRadius: "3px",
              },
            }}
          >
            {chatHistory.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                onOptionClick={handleOptionClick}
                onStreamingComplete={handleStreamingComplete}
              />
            ))}
          </Box>

          {/* Input Area - hidden while awaiting confirmation */}
          {!isCompleted && currentQuestion && !isAwaitingConfirmation && (
            <Box
              sx={{
                bgcolor: "white",
                borderTop: "1px solid #e0e0e0",
                p: isMobile ? 1 : 2,
                flexShrink: 0, // Prevent input area from shrinking
                ...(isMobile
                  ? {}
                  : {
                      borderBottomLeftRadius: 8,
                      borderBottomRightRadius: 8,
                    }),
              }}
            >
              <ChatInput
                question={currentQuestion}
                currentAnswer={answers[currentQuestion.id]}
                onAnswer={handleAnswer}
                isStreamingActive={isStreamingActive}
                filesPermission={answers?.files_permission}
                isEditing={isReturnToSummary}
              />
            </Box>
          )}

          {/* Completion State */}
          {isCompleted && <Completion isMobile={isMobile} />}
        </Box>{" "}
        {/* Close inner chat container Box */}
      </Box>{" "}
      {/* Close outer flex container Box */}
      {/* Desktop Footer - always visible on desktop */}
      {!isMobile && <Footer />}
    </Box>
  );
};

export default ChatbotQuestionnaire;
