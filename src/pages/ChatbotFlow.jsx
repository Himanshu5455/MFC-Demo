import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ChatMessage from "../components/chat/ChatMessage";
import ChatInput from "../components/chat/ChatInput";
import ChatHeader from "../components/chat/ChatHeader";
import Completion from "../components/chat/Completion";
import {
  CHATBOT_FLOW_STEP2_QUESTIONS,
  getVisibleFlowQuestions,
  getNextQuestion,
  isFlowComplete,
} from "../data/chatbotFlowQuestions";
import { QUESTIONS } from "../data/questions";
import { withTyping } from "../utils/chatHelpers";
import {
  setAnswer,
  addToChatHistory,
  nextQuestion,
  completeChatFlow,
  resetChatFlow,
  setCurrentQuestion,
  setStreamingActive,
  setAwaitingConfirmation,
  setWelcomeStreamed,
} from "../store/chatFlowSlice";

const ChatbotFlow = () => {
  const [welcomeStreamed, setWelcomeStreamed] = useState(false);
  const [currentStep, setCurrentStep] = useState(2); // Start from Step 2
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isStreamingActive, setIsStreamingActive] = useState(false);
  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);

  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const {
    currentQuestionIndex: reduxQuestionIndex,
    answers,
    chatHistory,
    isCompleted,
  } = useSelector((state) => state.chatFlow);

  const chatContainerRef = useRef(null);
  const initializedRef = useRef(false);

  // Get current question - use existing questions first, then new flow
  const getCurrentQuestion = () => {
    console.log("Getting current question with answers:", answers);
    console.log("QUESTIONS array:", QUESTIONS);
    console.log(
      "CHATBOT_FLOW_STEP2_QUESTIONS array:",
      CHATBOT_FLOW_STEP2_QUESTIONS
    );

    // Safety check - ensure QUESTIONS array exists
    if (!QUESTIONS || QUESTIONS.length === 0) {
      console.error("QUESTIONS array is not available!");
      return null;
    }

    // If no name yet, show name question
    if (!answers.name) {
      console.log("No name, returning name question");
      const nameQuestion = QUESTIONS.find((q) => q.id === "name");
      console.log("Name question found:", nameQuestion);
      return nameQuestion || QUESTIONS[0]; // Fallback to first question
    }

    // If we have name but no consent, show consent question
    if (
      answers.name &&
      (answers.consent_info === undefined || answers.consent_info === null)
    ) {
      console.log("Has name but no consent, returning consent question");
      const consentQuestion = QUESTIONS.find((q) => q.id === "consent_info");
      console.log("Consent question found:", consentQuestion);
      return (
        consentQuestion ||
        QUESTIONS.find((q) => q.id === "consent_info") ||
        QUESTIONS[1]
      ); // Fallback
    }

    // If consent is false, we're done
    if (answers.consent_info === false) {
      return null;
    }

    // If consent is true but no referral check, show referral question
    if (answers.consent_info === true && !answers.referral_check) {
      return CHATBOT_FLOW_STEP2_QUESTIONS.find(
        (q) => q.id === "referral_check"
      );
    }
    // If we have referral but no demographics dob, start demographics
    if (answers.referral_check && !answers.demographics_dob) {
      return CHATBOT_FLOW_STEP2_QUESTIONS.find(
        (q) => q.id === "demographics_dob"
      );
    }
    // Continue with demographics flow - check which question is next
    if (answers.demographics_dob) {
      const demographicsQuestions = [
        "demographics_dob",
        "demographics_health_card",
        "demographics_sex_assigned_at_birth",
        "demographics_email",
        "demographics_address",
        "demographics_phone",
      ];

      // Find the next unanswered question
      for (let i = 0; i < demographicsQuestions.length; i++) {
        const questionId = demographicsQuestions[i];
        if (!answers[questionId]) {
          return CHATBOT_FLOW_STEP2_QUESTIONS.find((q) => q.id === questionId);
        }
      }

      // Check for OHIP questions after demographics
      if (answers.has_ohip === undefined || answers.has_ohip === null) {
        console.log(
          "OHIP question not answered yet, returning has_ohip question"
        );
        return CHATBOT_FLOW_STEP2_QUESTIONS.find((q) => q.id === "has_ohip");
      }

      // If has OHIP, check if OHIP number is answered
      if (answers.has_ohip === true && !answers.ohip_number) {
        console.log(
          "Has OHIP but no OHIP number, returning ohip_number question"
        );
        return CHATBOT_FLOW_STEP2_QUESTIONS.find((q) => q.id === "ohip_number");
      }

      // If no OHIP, check if alternative insurance is answered
      if (answers.has_ohip === false && !answers.alternative_insurance) {
        console.log("No OHIP, returning alternative_insurance question");
        return CHATBOT_FLOW_STEP2_QUESTIONS.find(
          (q) => q.id === "alternative_insurance"
        );
      }

      // If alternative insurance is answered, check next steps
      if (answers.alternative_insurance) {
        console.log(
          "Alternative insurance answered:",
          answers.alternative_insurance
        );

        // If Blue Cross selected, check Blue Cross questions
        if (answers.alternative_insurance === "blue_cross") {
          console.log(
            "Blue Cross selected, checking blue_cross_id_upload:",
            answers.blue_cross_id_upload
          );
          if (
            answers.blue_cross_id_upload === null ||
            answers.blue_cross_id_upload === undefined
          ) {
            console.log(
              "Blue Cross selected, returning blue_cross_id_upload question"
            );
            return CHATBOT_FLOW_STEP2_QUESTIONS.find(
              (q) => q.id === "blue_cross_id_upload"
            );
          }
          if (
            answers.blue_cross_id_upload === true &&
            (!answers.blue_cross_documents ||
              answers.blue_cross_documents.length === 0)
          ) {
            console.log(
              "Blue Cross upload confirmed, returning blue_cross_documents question"
            );
            return CHATBOT_FLOW_STEP2_QUESTIONS.find(
              (q) => q.id === "blue_cross_documents"
            );
          }
        }

        // If out of province/country selected, check payment confirmation
        if (
          (answers.alternative_insurance === "out_of_province" ||
            answers.alternative_insurance === "out_of_country") &&
          (answers.payment_confirmation === null ||
            answers.payment_confirmation === undefined)
        ) {
          console.log(
            "Out of province/country selected, returning payment_confirmation question"
          );
          return CHATBOT_FLOW_STEP2_QUESTIONS.find(
            (q) => q.id === "payment_confirmation"
          );
        }
      }

      // If we reach here but still have unanswered questions, try to find the next one
      console.log(
        "Reached end of demographics flow, checking for remaining questions..."
      );

      // Check if we're missing any critical questions
      if (!answers.has_ohip) {
        console.log("Missing has_ohip, returning has_ohip question");
        return CHATBOT_FLOW_STEP2_QUESTIONS.find((q) => q.id === "has_ohip");
      }

      // All questions answered
      console.log("All questions appear to be answered, returning null");
      return null;
    }

    // If we reach here, all questions are answered
    console.log("All questions answered, returning null");
    return null;
  };

  const currentQuestion = getCurrentQuestion();
  console.log("Current question result:", currentQuestion);

  // Fallback question if currentQuestion is undefined
  const safeCurrentQuestion = currentQuestion || {
    id: "name",
    type: "text",
    question:
      "Hi there! 👋 I'm here to help you get started. What's your full name?",
    placeholder: "Enter your full name",
    required: true,
  };

  // Handler for when streaming completes
  const handleStreamingComplete = () => {
    setIsStreamingActive(false);
    if (!welcomeStreamed && chatHistory.length > 0) {
      const lastMsg = chatHistory[chatHistory.length - 1];
      if (lastMsg.questionId === "welcome" && chatHistory.length === 1) {
        setWelcomeStreamed(true);
        setIsStreamingActive(true);
        const firstQuestion = QUESTIONS.find((q) => q.id === "name");
        if (firstQuestion) {
          const messageData = {
            type: "bot",
            message: firstQuestion.question,
            timestamp: new Date().toISOString(),
            questionId: firstQuestion.id,
            shouldStream: true,
          };
          dispatch(addToChatHistory(messageData));
        }
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
    dispatch(resetChatFlow());
    localStorage.removeItem("chatFlow");
    setCurrentStep(2);
    setCurrentQuestionIndex(0);
    setIsAwaitingConfirmation(false);
    setWelcomeStreamed(false);
    initializedRef.current = false;

    // Start with same welcome as existing questionnaire
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

  // Initialize chat on first mount - start with same welcome as existing questionnaire
  useEffect(() => {
    if (initializedRef.current) return;

    console.log("Initializing chat, current state:", {
      answers,
      chatHistory,
      isCompleted,
    });

    // Check for old localStorage data that might interfere
    const oldData = localStorage.getItem("questionnaire");
    if (oldData) {
      console.log("Found old questionnaire data in localStorage:", oldData);
      localStorage.removeItem("questionnaire"); // Clean up old data
    }

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
    localStorage.setItem("chatFlow", JSON.stringify(dataToSave));
  }, [currentQuestionIndex, answers, chatHistory, isCompleted]);

  const handleAnswer = (value) => {
    const question = currentQuestion;
    if (!question) return;

    // Add user message
    const formattedAnswer = formatUserAnswer(question, value);
    dispatch(
      addToChatHistory({
        type: "user",
        message:
          typeof formattedAnswer === "object"
            ? JSON.stringify(formattedAnswer)
            : formattedAnswer,
        timestamp: new Date().toISOString(),
        questionId: question.id,
      })
    ); // Save answer
    dispatch(
      setAnswer({
        field: question.id,
        value: value,
      })
    );

    // Handle name question - move to consent
    if (question.id === "name") {
      const consentQuestion = QUESTIONS.find((q) => q.id === "consent_info");
      if (consentQuestion) {
        withTyping(dispatch, 1500, () => {
          setIsStreamingActive(true);
          dispatch(
            addToChatHistory({
              type: "bot",
              message: consentQuestion.question({
                ...answers,
                [question.id]: value,
              }),
              timestamp: new Date().toISOString(),
              questionId: consentQuestion.id,
              shouldStream: true,
              showBooleanOptions: true,
            })
          );
        });
      }
      return;
    }

    // Handle consent response
    if (question.id === "consent_info" && value === false) {
      // User declined consent - show escalation message
      withTyping(dispatch, 1500, () => {
        setIsStreamingActive(true);
        dispatch(
          addToChatHistory({
            type: "bot",
            message:
              "If you don't feel comfortable sharing your information with me, we'll refer you to one of our specialists to get in touch with you.",
            timestamp: new Date().toISOString(),
            questionId: "consent-declined",
            shouldStream: true,
          })
        );
        dispatch(completeChatFlow());
      });
      return;
    }

    // Handle consent accepted - move to new flow
    if (question.id === "consent_info" && value === true) {
      const referralQuestion = CHATBOT_FLOW_STEP2_QUESTIONS.find(
        (q) => q.id === "referral_check"
      );
      if (referralQuestion) {
        withTyping(dispatch, 1500, () => {
          setIsStreamingActive(true);
          dispatch(
            addToChatHistory({
              type: "bot",
              message: referralQuestion.question,
              timestamp: new Date().toISOString(),
              questionId: referralQuestion.id,
              shouldStream: true,
              options: referralQuestion.options,
            })
          );
        });
      }
      return;
    }

    // Handle referral check - all paths lead directly to demographics collection
    if (question.id === "referral_check") {
      // All paths lead directly to demographics collection - start with Date of Birth
      const dobQuestion = CHATBOT_FLOW_STEP2_QUESTIONS.find(
        (q) => q.id === "demographics_dob"
      );
      if (dobQuestion) {
        withTyping(dispatch, 1500, () => {
          setIsStreamingActive(true);
          dispatch(
            addToChatHistory({
              type: "bot",
              message: dobQuestion.question,
              timestamp: new Date().toISOString(),
              questionId: dobQuestion.id,
              shouldStream: true,
            })
          );
        });
      }
      return;
    }

    // Handle demographics flow progression
    if (question.id.startsWith("demographics_")) {
      const demographicsQuestions = [
        "demographics_dob",
        "demographics_health_card",
        "demographics_sex_assigned_at_birth",
        "demographics_email",
        "demographics_address",
        "demographics_phone",
      ];

      const currentIndex = demographicsQuestions.indexOf(question.id);
      const nextQuestionId = demographicsQuestions[currentIndex + 1];

      if (nextQuestionId) {
        const nextQ = CHATBOT_FLOW_STEP2_QUESTIONS.find(
          (q) => q.id === nextQuestionId
        );
        if (nextQ) {
          withTyping(dispatch, 1500, () => {
            setIsStreamingActive(true);
            const messageData = {
              type: "bot",
              message:
                typeof nextQ.question === "function"
                  ? nextQ.question({ ...answers, [question.id]: value })
                  : nextQ.question,
              timestamp: new Date().toISOString(),
              questionId: nextQ.id,
              shouldStream: true,
            };

            if (nextQ.type === "select" && nextQ.options) {
              messageData.options = nextQ.options;
            }

            dispatch(addToChatHistory(messageData));
          });
        }
      } else {
        // Demographics complete, move to OHIP questions
        const hasOHIP = CHATBOT_FLOW_STEP2_QUESTIONS.find(
          (q) => q.id === "has_ohip"
        );
        if (hasOHIP) {
          withTyping(dispatch, 1500, () => {
            setIsStreamingActive(true);
            dispatch(
              addToChatHistory({
                type: "bot",
                message: hasOHIP.question,
                timestamp: new Date().toISOString(),
                questionId: hasOHIP.id,
                shouldStream: true,
                showBooleanOptions: true,
              })
            );
          });
        }
      }
      return;
    }

    // Handle OHIP flow
    if (question.id === "has_ohip") {
      if (value === true) {
        // User has OHIP - ask for OHIP number
        const ohipNumberQ = CHATBOT_FLOW_STEP2_QUESTIONS.find(
          (q) => q.id === "ohip_number"
        );
        if (ohipNumberQ) {
          withTyping(dispatch, 1500, () => {
            setIsStreamingActive(true);
            dispatch(
              addToChatHistory({
                type: "bot",
                message: ohipNumberQ.question,
                timestamp: new Date().toISOString(),
                questionId: ohipNumberQ.id,
                shouldStream: true,
              })
            );
          });
        }
      } else {
        // User doesn't have OHIP - ask for alternative insurance
        const altInsuranceQ = CHATBOT_FLOW_STEP2_QUESTIONS.find(
          (q) => q.id === "alternative_insurance"
        );
        if (altInsuranceQ) {
          withTyping(dispatch, 1500, () => {
            setIsStreamingActive(true);
            dispatch(
              addToChatHistory({
                type: "bot",
                message: altInsuranceQ.question,
                timestamp: new Date().toISOString(),
                questionId: altInsuranceQ.id,
                shouldStream: true,
                options: altInsuranceQ.options,
              })
            );
          });
        }
      }
      return;
    }

    // Handle alternative insurance selection
    if (question.id === "alternative_insurance") {
      console.log("Alternative insurance selected:", value);
      // If Blue Cross selected, ask for ID upload
      if (value === "blue_cross") {
        console.log("Blue Cross selected, finding upload question...");
        const blueCrossUpload = CHATBOT_FLOW_STEP2_QUESTIONS.find(
          (q) => q.id === "blue_cross_id_upload"
        );
        console.log("Blue Cross upload question found:", blueCrossUpload);
        if (blueCrossUpload) {
          withTyping(dispatch, 1500, () => {
            setIsStreamingActive(true);
            dispatch(
              addToChatHistory({
                type: "bot",
                message: blueCrossUpload.question,
                timestamp: new Date().toISOString(),
                questionId: blueCrossUpload.id,
                shouldStream: true,
                showBooleanOptions: true,
              })
            );
          });
        }
      } else if (value === "out_of_province" || value === "out_of_country") {
        // Out of province/country - ask for payment confirmation
        const paymentConfirmation = CHATBOT_FLOW_STEP2_QUESTIONS.find(
          (q) => q.id === "payment_confirmation"
        );
        if (paymentConfirmation) {
          withTyping(dispatch, 1500, () => {
            setIsStreamingActive(true);
            dispatch(
              addToChatHistory({
                type: "bot",
                message: paymentConfirmation.question({
                  ...answers,
                  [question.id]: value,
                }),
                timestamp: new Date().toISOString(),
                questionId: paymentConfirmation.id,
                shouldStream: true,
                showBooleanOptions: true,
              })
            );
          });
        }
      }
      return;
    }

    // Handle Blue Cross ID upload
    if (question.id === "blue_cross_id_upload") {
      if (value === true) {
        // User has the documents - ask for upload
        const documentsUpload = CHATBOT_FLOW_STEP2_QUESTIONS.find(
          (q) => q.id === "blue_cross_documents"
        );
        if (documentsUpload) {
          withTyping(dispatch, 1500, () => {
            setIsStreamingActive(true);
            dispatch(
              addToChatHistory({
                type: "bot",
                message: documentsUpload.question,
                timestamp: new Date().toISOString(),
                questionId: documentsUpload.id,
                shouldStream: true,
              })
            );
          });
        }
      } else {
        // User doesn't have documents - complete flow
        withTyping(dispatch, 1500, () => {
          setIsStreamingActive(true);
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
          dispatch(completeChatFlow());
        });
      }
      return;
    }

    // Handle Blue Cross documents upload completion
    if (question.id === "blue_cross_documents") {
      // Ensure the uploaded files are properly formatted
      const formattedFiles = Array.isArray(value)
        ? value.map((file) => {
            if (file instanceof File) {
              return {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified,
              };
            }
            return file;
          })
        : [];

      // Save the formatted files
      dispatch(
        setAnswer({
          field: question.id,
          value: formattedFiles,
        })
      );

      withTyping(dispatch, 1500, () => {
        setIsStreamingActive(true);
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
        dispatch(completeChatFlow());
      });
      return;
    }

    // Handle payment confirmation
    if (question.id === "payment_confirmation") {
      if (value === true) {
        // User agrees to pay - proceed with consultation
        withTyping(dispatch, 1500, () => {
          setIsStreamingActive(true);
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
          dispatch(completeChatFlow());
        });
      } else {
        // User declines payment - escalate to human
        withTyping(dispatch, 1500, () => {
          setIsStreamingActive(true);
          dispatch(
            addToChatHistory({
              type: "bot",
              message: `I understand, ${
                answers.name || "there"
              }. I can refer you to one of our specialists.
We'll transfer you to one of our specialists so we can better understand your situation.`,
              timestamp: new Date().toISOString(),
              questionId: "payment-declined-escalation",
              shouldStream: true,
            })
          );
          dispatch(completeChatFlow());
        });
      }
      return;
    }

    // Handle OHIP number completion
    if (question.id === "ohip_number") {
      withTyping(dispatch, 1500, () => {
        setIsStreamingActive(true);
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
        dispatch(completeChatFlow());
      });
      return;
    }

    // Get next question from new flow
    const nextQ = getNextQuestion(question.id, {
      ...answers,
      [question.id]: value,
    });

    if (nextQ) {
      withTyping(dispatch, 1500, () => {
        setIsStreamingActive(true);
        const messageData = {
          type: "bot",
          message: nextQ.question,
          timestamp: new Date().toISOString(),
          questionId: nextQ.id,
          shouldStream: true,
        };

        if (nextQ.type === "select" && nextQ.options) {
          messageData.options = nextQ.options;
        } else if (nextQ.type === "consent") {
          messageData.options = nextQ.options;
        }

        dispatch(addToChatHistory(messageData));
        setCurrentQuestionIndex((prev) => prev + 1);
      });
    } else {
      // No next question - check if flow is complete
      const updatedAnswers = { ...answers, [question.id]: value };
      if (isFlowComplete(updatedAnswers)) {
        withTyping(dispatch, 1500, () => {
          setIsStreamingActive(true);
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
          dispatch(completeChatFlow());
        });
      }
    }
  };

  const handleOptionClick = (value, label, questionId) => {
    console.log("Option clicked:", {
      questionId,
      currentQuestionId: safeCurrentQuestion?.id,
      answers,
    });
    // Only process clicks from the current active question
    if (safeCurrentQuestion && questionId === safeCurrentQuestion.id) {
      handleAnswer(value);
    } else {
      console.log(
        "Ignoring click from previous question:",
        questionId,
        "Current question:",
        safeCurrentQuestion?.id
      );
    }
  };

  // Format user answer for display
  const formatUserAnswer = (question, value) => {
    if (question.type === "select" || question.type === "consent") {
      const option = question.options?.find((opt) => opt.value === value);
      return option ? option.label : value;
    }
    if (question.type === "boolean") {
      return value ? "Yes" : "No";
    }
    if (question.type === "file") {
      if (!value) return "No files uploaded";
      if (!Array.isArray(value)) return "File upload error";
      return value.map((file) => {
        if (typeof file === "string") return { name: file };
        return {
          name: file.name || "Unnamed file",
          size: file.size || 0,
          type: file.type || "application/octet-stream",
          lastModified: file.lastModified,
        };
      });
    }
    if (value && typeof value === "object") {
      return JSON.stringify(value);
    }
    return value;
  };

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
              minHeight: 0,
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

          {/* Input Area - hidden while awaiting confirmation or completed */}
          {!isCompleted && !isAwaitingConfirmation && (
            <Box
              sx={{
                bgcolor: "white",
                borderTop: "1px solid #e0e0e0",
                p: isMobile ? 1 : 2,
                flexShrink: 0,
                ...(isMobile
                  ? {}
                  : {
                      borderBottomLeftRadius: 8,
                      borderBottomRightRadius: 8,
                    }),
              }}
            >
              <ChatInput
                question={safeCurrentQuestion}
                currentAnswer={answers[safeCurrentQuestion.id] || ""}
                onAnswer={handleAnswer}
                isStreamingActive={isStreamingActive}
                filesPermission={false}
                isEditing={false}
              />
            </Box>
          )}

          {/* Completion State */}
          {isCompleted && <Completion isMobile={isMobile} />}
        </Box>
      </Box>
      {/* Desktop Footer - always visible on desktop */}
      {!isMobile && <Footer />}
    </Box>
  );
};

export default ChatbotFlow;
