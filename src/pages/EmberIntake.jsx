import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import ChatHeader from "../components/chat/ChatHeader";
import ChatMessage from "../components/chat/ChatMessage";
import ChatInput from "../components/chat/ChatInput";
import { extractNameAndPhone, computeAge, categorizeReason } from "../utils/utils";
import { WELCOME_TEXT } from "../utils/constants";
import { createFlowHandlers } from "../utils/flowHandlers";
import { registerCustomer } from "../services/api";


const initialData = {
  name: "",
  phone: "",
  consent: null,
  referral: "",
  email: "",
  dob: "",
  ageFlag: "",
  sexAtBirth: "",
  painLevel: "",
  address: "",
  healthCardFiles: [],
  ohipProvided: null,
  ohipNumber: "",
  insurance: "",
  blueCrossFiles: [],
  paymentAccepted: null,
  reasonRaw: "",
  reasonTags: [],
  ttcDuration: "",
  returningWithinYear: null,
  medicalRecords: [],
  hasPartner: null,
  partner: {
    name: "",
    dob: "",
    healthCardFiles: [],
    sexAtBirth: "",
    medicalRecords: [],
    email: "",
    address: "",
    phone: "",
  },
  flags: {
    humanEscalation: false,
    referral: false,
    sprout: false,
    noReferral: false,
    blueCross: false,
    outProvince: false,
    outCountry: false,
  },
};

const EmberIntake = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const chatContainerRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [step, setStep] = useState("intro");
  const [awaiting, setAwaiting] = useState({ type: "text" });
  const [data, setData] = useState(initialData);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  //  Initialize only once on first load
  useEffect(() => {
    setMessages([
      {
        type: "bot",
        message: WELCOME_TEXT,
        timestamp: new Date().toISOString(),
        questionId: "intro",
        shouldStream: true,
      },
    ]);
    setAwaiting({ type: "text", questionId: "intro" });
  }, []);

  // Helpers
  const pushBot = (message, options) => {
    setMessages((prev) => [
      ...prev,
      {
        type: "bot",
        message,
        timestamp: new Date().toISOString(),
        questionId: options?.questionId || "",
        shouldStream: true,
        options: options?.options,
        showBooleanOptions: options?.showBooleanOptions,
      },
    ]);
  };

  const pushUser = (message, questionId) => {
    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        message,
        timestamp: new Date().toISOString(),
        questionId,
      },
    ]);
  };

  const proceed = (nextStep, nextAwaiting) => {
    setStep(nextStep);
    setAwaiting(nextAwaiting);
  };

  const setFlag = (key, value = true) => {
    setData((d) => ({ ...d, flags: { ...d.flags, [key]: value } }));
  };

  const clearOptionsForQuestion = (qid) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.questionId === qid
          ? { ...m, options: undefined, showBooleanOptions: undefined }
          : m
      )
    );
  };

  // Final form submission
  const endFlow = async () => {
    setAwaiting({ type: "none" });

    // show loading message
    pushBot("⏳ Submitting your information...", { questionId: "processing" });

    const payload = {
      name: data?.name?.trim() || "",
      email: data?.email?.trim() || "",
      phone: data?.phone?.trim() || "",
      referral_reason: data?.reasonRaw?.trim() || "",
      partner_available: Boolean(data?.hasPartner) || false,
      partner_name: data?.partner?.name?.trim() || "",
      partner_dob: data?.partner?.dob ? data.partner.dob.split("/").reverse().join("-") : "",
      partner_health_card: "", // Files are handled separately
      partner_sex: data?.partner?.sexAtBirth || "",
      partner_email: data?.partner?.email?.trim() || "",
      partner_address: data?.partner?.address?.trim() || "",
      partner_phone: data?.partner?.phone?.trim() || "",
      //    files: [
      //   ...(data?.healthCardFiles || []),
      //   ...(data?.medicalRecords || []),
      //   ...(data?.blueCrossFiles || []),
      //   ...(data?.partnerHealthCardFiles || []),
      // ],

      medical_records: "", // Files are handled separately
      alternative_no: "",
      physician: "",
      region: "",
      dob: data?.dob ? data.dob.split("/").reverse().join("-") : "",
      OHIP: data?.ohipNumber?.trim() || "",
      gender: data?.sexAtBirth || "",
      full_address: data?.address?.trim() || "",
      refer_physician_available: false,
      refer_physician_name: "",
      refer_physician_email: "",
      refer_physician_address: "",
      refer_physician_fax_no: "",
      refer_physician_OHIP_no: "",
      refer_physician_region: "",
      pain_scale: data?.painLevel || "",
      positive_experience: true,
      rate_experience: "",
      comment: "",
      files: [
        ...(data?.blueCrossFiles || []),
        ...(data?.healthCardFiles || []),
        ...(data?.medicalRecords || []),
        ...(data?.partner?.healthCardFiles || []),
      ].flat(),
    };

    try {
      console.log("payload", payload);
      const response = await registerCustomer(payload);
      console.log("API Success:", response);

      // ✅ remove the "Submitting..." message
      setMessages((prev) => prev.filter((m) => m.questionId !== "processing"));

      // ✅ then show success
      pushBot(
        `🎉 Thank you very much ${data.name || ""}!\nYour information has been submitted successfully.\nWe'll get back to you soon!`,
        { questionId: "success" }
      );
    } catch (error) {
      console.error("API Error:", error);

      // ✅ remove the "Submitting..." message even on error
      setMessages((prev) => prev.filter((m) => m.questionId !== "processing"));

      const details = error?.response?.data?.detail;
      if (Array.isArray(details) && details.length > 0) {
        const missing = details
          .map((d) => d.loc?.[1])
          .filter(Boolean)
          .join(", ");
        pushBot(
          `⚠️ Some required fields are missing: ${missing}.\nPlease check your data and try again.`,
          { questionId: "error-validation" }
        );
      } else {
        pushBot(
          `❌ Submission failed but your data is safe locally.\nPlease contact support if this continues.`,
          { questionId: "error-fallback" }
        );
      }
    }

    setStep("end");
  };

  // Flow Handlers
  const { handleOptionClick, handleAnswer } = createFlowHandlers(
    pushBot,
    pushUser,
    proceed,
    setData,
    setFlag,
    clearOptionsForQuestion,
    endFlow,
    { step, awaiting, data, extractNameAndPhone, categorizeReason, computeAge }
  );

  const currentQuestion = useMemo(() => {
    if (awaiting.type === "none" || awaiting.type === "option") return null;
    const q = { id: awaiting.questionId || step, question: "", type: awaiting.type };
    if (awaiting.type === "file") return { ...q, accept: awaiting.accept, multiple: awaiting.multiple };
    if (awaiting.type === "date") return { ...q, type: "date" };
    return q;
  }, [awaiting, step]);

  // Restart chat
  const handleStartNewChat = () => {
    setData(initialData);
    setStep("intro");
    setAwaiting({ type: "text", questionId: "intro" });
    setMessages([
      {
        type: "bot",
        message: WELCOME_TEXT,
        timestamp: new Date().toISOString(),
        questionId: "intro",
        shouldStream: true,
      },
    ]);
  };


  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "#f8f9fa" }}>
      {!isMobile && <Navbar />}
      <Box sx={{ flex: 1, display: "flex", justifyContent: "center", pt: isMobile ? 0 : 1, pb: isMobile ? 0 : 1, overflow: "hidden" }}>
        <Box
          sx={{
            height: "100%",
            width: "100%",
            maxWidth: isMobile ? "100%" : "800px",
            display: "flex",
            flexDirection: "column",
            bgcolor: "white",
            overflow: "hidden",
            ...(isMobile ? {} : { borderRadius: 2, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }),
          }}
        >
          <ChatHeader
            isMobile={isMobile}
            hasUserStartedMessaging={messages.some((m) => m.type === "user")}
            onStartNewChat={handleStartNewChat}
          />

          <Box
            ref={chatContainerRef}
            sx={{
              flexGrow: 1,
              overflow: "auto",
              bgcolor: "#f8f9fa",
              backgroundImage: isMobile ? "none" : "linear-gradient(145deg, #f8f9fa 0%, #e9ecef 100%)",
              display: "flex",
              flexDirection: "column",
              px: isMobile ? 1 : 3,
              py: 2,
              minHeight: 0,
              "&::-webkit-scrollbar": { width: "6px" },
              "&::-webkit-scrollbar-thumb": { background: "#dee2e6", borderRadius: "3px" },
            }}
          >
            {messages.map((m, i) => (
              <ChatMessage key={i} message={m} onOptionClick={handleOptionClick} />
            ))}
          </Box>

          {step !== "end" && currentQuestion && (
            <Box
              sx={{
                bgcolor: "white",
                borderTop: "1px solid #e0e0e0",
                p: isMobile ? 1 : 2,
                flexShrink: 0,
              }}
            >
              <ChatInput
                question={currentQuestion}
                onAnswer={handleAnswer}
                disabled={false}
                isStreamingActive={false}
              />
            </Box>
          )}
        </Box>
      </Box>
      {!isMobile && <Footer />}
    </Box>
  );
};

export default EmberIntake;
