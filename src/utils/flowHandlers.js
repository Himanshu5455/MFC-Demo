
export const createFlowHandlers = (
  pushBot,
  pushUser,
  proceed,
  setData,
  setFlag,
  clearOptionsForQuestion,
  endFlow,
  { step, awaiting, data, extractNameAndPhone, categorizeReason,computeAge }
) => {
  const handleOptionClick = (value, label, questionId) => {

    if (step === "consent" && questionId === "consent") {
      pushUser(label, questionId);
      setData((d) => ({ ...d, consent: !!value }));
      if (!value) {
        pushBot(
          `I understand, ${
            data.name || "there"
          }.\nIf you don't feel comfortable sharing your information with me, we’ll refer you to one of our specialists to get in touch with you.`,
          { questionId: "consent-escalate" }
        );
        setFlag("humanEscalation", true);
        proceed("end", { type: "none" });
        return;
      }
      pushBot("Do you have a referral?", {
        questionId: "referral",
        options: [
          { value: "referral", label: "Yes I do" },
          { value: "sprout", label: "Yes, from Sprout" },
          { value: "none", label: "No, I don’t" },
        ],
      });
      proceed("referral", { type: "option", questionId: "referral" });
      return;
    }

    // === REFERRAL ===
    if (step === "referral" && questionId === "referral") {
      pushUser(label, questionId);
      const flags = {
        referral: value === "referral",
        sprout: value === "sprout",
        noReferral: value === "none",
      };
      setData((d) => ({
        ...d,
        referral: value,
        flags: { ...d.flags, ...flags },
      }));
      pushBot(`Okay ${data.name || ""}. Please tell me your e-mail.`, {
        questionId: "email",
      });
      proceed("email", { type: "text", questionId: "email" });
      return;
    }

    // === OHIP OPTIONS (Blue Cross, Out of Province, etc.) ===
    if (step === "ohipOptions" && questionId === "ohipOptions") {
      pushUser(label, questionId);
      if (value === "blue_cross") {
        setFlag("blueCross", true);
        setData((d) => ({ ...d, insurance: "blue_cross" }));
        pushBot("Do you have your Blue Cross ID to be uploaded?", {
          questionId: "blueCrossChoice",
          options: [
            { value: "upload", label: "Upload Blue Cross ID" },
            { value: "no_have", label: "I don’t have it right now" },
          ],
        });
        proceed("blueCrossChoice", {
          type: "option",
          questionId: "blueCrossChoice",
        });
        return;
      }
      if (value === "out_province" || value === "out_country") {
        if (value === "out_province") setFlag("outProvince", true);
        if (value === "out_country") setFlag("outCountry", true);
        setData((d) => ({ ...d, insurance: value }));
        pushBot(
          "In this case, the patient is responsible for paying for the consultation, okay? 200 CAD",
          {
            questionId: "payment",
            options: [
              { value: "yes", label: "Yes, proceed" },
              { value: "no", label: "No" },
            ],
          }
        );
        proceed("paymentConfirm", { type: "option", questionId: "payment" });
        return;
      }
    }

    // === BLUE CROSS CHOICE ===
    if (step === "blueCrossChoice" && questionId === "blueCrossChoice") {
      pushUser(label, questionId);
      if (value === "upload") {
        pushBot("Please upload your Blue Cross ID", {
          questionId: "blueCrossUpload",
        });
        proceed("blueCrossUpload", {
          type: "file",
          questionId: "blueCrossUpload",
          accept: "image/*,application/pdf",
          multiple: true,
        });
        return;
      }
      if (value === "no_have") {
        pushBot(
          "Thank you for providing your information. To help us connect you with the right specialist and schedule the appropriate time, could you please tell us the main reason you are contacting the clinic today?",
          {
            questionId: "reason",
            options: [
              {
                value: "infertility",
                label: "Infertility Evaluation or Multiple Losses",
              },
              {
                value: "future_planning",
                label:
                  "Future family planning: Egg preservation, Genetic inquiries, Preconception planning",
              },
              {
                value: "donor",
                label: "Need use of donor embrios / egg / sperm",
              },
              {
                value: "medical_preservation",
                label: "Preservation for medical need",
              },
              { value: "ivf", label: "IVF" },
              {
                value: "transfer_second_opinion",
                label: "Transfer care from another clinic / Second opinion",
              },
              { value: "returning", label: "Returning patient" },
              { value: "cancer", label: "Cancer" },
              { value: "detail", label: "Detail specific symptoms" },
              { value: "other", label: "Other" },
            ],
          }
        );
        proceed("reason", { type: "option", questionId: "reason" });
        return;
      }
    }

    // === PAYMENT CONFIRM ===
    if (step === "paymentConfirm" && questionId === "payment") {
      pushUser(label, questionId);
      const ok = value === "yes";
      setData((d) => ({ ...d, paymentAccepted: ok }));
      if (!ok) {
        pushBot(
          `I understand, ${
            data.name || "there"
          }.\nWe’ll transfer you to one of our specialist so we can better understand your situation`,
          { questionId: "payment-escalate" }
        );
        setFlag("humanEscalation", true);
        proceed("end", { type: "none" });
        return;
      }
      pushBot(
        "Thank you for providing your information. To help us connect you with the right specialist and schedule the appropriate time, could you please tell us the main reason you are contacting the clinic today?",
        {
          questionId: "reason",
          options: [
            {
              value: "infertility",
              label: "Infertility Evaluation or Multiple Losses",
            },
            {
              value: "future_planning",
              label:
                "Future family planning: Egg preservation, Genetic inquiries, Preconception planning",
            },
            {
              value: "donor",
              label: "Need use of donor embrios / egg / sperm",
            },
            {
              value: "medical_preservation",
              label: "Preservation for medical need",
            },
            { value: "ivf", label: "IVF" },
            {
              value: "transfer_second_opinion",
              label: "Transfer care from another clinic / Second opinion",
            },
            { value: "returning", label: "Returning patient" },
            { value: "cancer", label: "Cancer" },
            { value: "detail", label: "Detail specific symptoms" },
            { value: "other", label: "Other" },
          ],
        }
      );
      proceed("reason", { type: "option", questionId: "reason" });
      return;
    }

    // === REASON (Main reason selection) ===
    if (step === "reason" && questionId === "reason") {
      pushUser(label, questionId);
      const valueToLabel = (v) => {
        switch (v) {
          case "infertility":
            return "Infertility Evaluation or Multiple Losses";
          case "future_planning":
            return "Future family planning";
          case "donor":
            return "Need use of donor embrios / egg / sperm";
          case "medical_preservation":
            return "Preservation for medical need";
          case "ivf":
            return "IVF";
          case "transfer_second_opinion":
            return "Transfer care from another clinic / Second opinion";
          case "returning":
            return "Returning patient";
          case "cancer":
            return "Cancer";
          case "immune_service":
            return "Immune Service";
          case "general_surgery":
            return "General Surgery";
          case "ginecology":
            return "Ginecology";
          case "already_pregnant":
            return "Already Preagnant";
          default:
            return String(label || value || "");
        }
      };

      const tagLabel = valueToLabel(value);
      setData((d) => ({ ...d, reasonRaw: tagLabel, reasonTags: [tagLabel] }));

      if (value === "returning") {
        pushBot("Was your last consultation within a year?", {
          questionId: "returning",
          options: [
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ],
        });
        proceed("returning", { type: "option", questionId: "returning" });
        return;
      }

      if (value === "infertility") {
        pushBot("And how long have you been trying to conceive?", {
          questionId: "ttc",
          options: [
            { value: "12+ months", label: "12 months or more" },
            { value: "6 months", label: "6 months" },
            { value: "3 months", label: "3 months" },
            { value: "<3 months", label: "Less than 3 months" },
          ],
        });
        proceed("ttc", { type: "option", questionId: "ttc" });
        return;
      }

      if (value === "cancer") {
        pushBot(
          `Okay, ${
            data.name || "there"
          }.\nI will refer you to one of our specialists right now! \nHe will be able to clarify any points related to your case ok?\nThank you very much for speaking with me and until next time!`,
          { questionId: "escalate-cancer" }
        );
        setFlag("humanEscalation", true);
        proceed("end", { type: "none" });
        return;
      }

      if (value === "detail") {
        pushBot("Please describe your specific symptoms in a few words:", {
          questionId: "reasonDetail",
        });
        proceed("reasonDetail", { type: "text", questionId: "reasonDetail" });
        return;
      }

      if (value === "other") {
        pushBot("Please select one of the following options:", {
          questionId: "otherOptions",
          options: [
            { value: "immune_service", label: "Immune Service" },
            { value: "general_surgery", label: "General Surgery" },
            { value: "ginecology", label: "Ginecology" },
            { value: "already_pregnant", label: "Already Pregnant" },
          ],
        });
        proceed("otherOptions", { type: "option", questionId: "otherOptions" });
        return;
      }

      // Default next → records upload
      pushBot(
        "Okay. Before proceeding, please send me any medical records you have available. If you don't have any at the moment, just select the “I don't have any” option below.",
        {
          questionId: "recordsChoice",
          options: [
            { value: "upload", label: "Upload Medical Records" },
            { value: "none", label: "I don’t have any" },
          ],
        }
      );
      proceed("recordsChoice", { type: "option", questionId: "recordsChoice" });
      return;
    }

    // === OTHER OPTIONS (Immune, Surgery, etc.) ===
    if (step === "otherOptions" && questionId === "otherOptions") {
      pushUser(label, questionId);

      const valueToLabel = (v) => {
        switch (v) {
          case "immune_service":
            return "Immune Service";
          case "general_surgery":
            return "General Surgery";
          case "ginecology":
            return "Ginecology";
          case "already_pregnant":
            return "Already Preagnant";
          default:
            return String(label || value || "");
        }
      };

      const tagLabel = valueToLabel(value);
      setData((d) => ({ ...d, reasonRaw: tagLabel, reasonTags: [tagLabel] }));

      if (value === "immune_service" || value === "general_surgery") {
        pushBot(
          `Okay, ${
            data.name || "there"
          }.\nI will refer you to one of our specialists right now! \nHe will be able to clarify any points related to your case ok?\nThank you very much for speaking with me and until next time!`,
          { questionId: "escalate-other" }
        );
        setFlag("humanEscalation", true);
        proceed("end", { type: "none" });
        return;
      }

      if (value === "ginecology" || value === "already_pregnant") {
        pushBot(
          `I'm sorry, ${
            data.name || "there"
          }, unfortunately we are unable to help you with your case.\nI recommend contacting your family doctor first, so we can help you in the best way possible!\nWe at Marham Fertility Center appreciate your contact!\nFeel free to contact us whenever you want. Our mission is to help you. I hope to see you soon.`,
          { questionId: "end-sorry" }
        );
        proceed("end", { type: "none" });
        return;
      }
    }

    // === RECORDS CHOICE ===
    if (step === "recordsChoice" && questionId === "recordsChoice") {
      clearOptionsForQuestion("recordsChoice");
      pushUser(label, questionId);
      if (value === "none") {
        pushBot(
          "Do you have a partner that will participate the pocedure? (non mandatory)",
          {
            questionId: "partner",
            options: [
              { value: true, label: "Yes, I do" },
              { value: false, label: "No, I don’t" },
            ],
          }
        );
        proceed("partner", { type: "option", questionId: "partner" });
        return;
      }
      if (value === "upload") {
        pushBot("Please upload your medical records", {
          questionId: "recordsUpload",
        });
        proceed("recordsUpload", {
          type: "file",
          questionId: "recordsUpload",
          accept: "image/*,application/pdf",
          multiple: true,
        });
        return;
      }
      return;
    }

    // === PARTNER YES/NO ===
    if (step === "partner" && questionId === "partner") {
      pushUser(label, questionId);
      setData((d) => ({ ...d, hasPartner: !!value }));
      if (value) {
        pushBot("Please provide your partner's name:", {
          questionId: "partnerName",
        });
        proceed("partnerName", { type: "text", questionId: "partnerName" });
        return;
      }
      endFlow();
      return;
    }

    // === PARTNER NAME (handled in handleAnswer below) ===

    // === PARTNER DOB (handled in handleAnswer) ===

    // === PARTNER HEALTH CARD UPLOAD (handled in handleAnswer) ===

    // === PARTNER SEX (handled in handleAnswer) ===

    // === PARTNER EMAIL (handled in handleAnswer) ===

    // === PARTNER ADDRESS (handled in handleAnswer) ===

    // === PARTNER PHONE (handled in handleAnswer) ===

    // === PARTNER SEX ===
    if (step === "partnerSex" && questionId === "partnerSex") {
      pushUser(label, questionId);
      setData((d) => ({
        ...d,
        partner: { ...d.partner, sexAtBirth: String(value) },
      }));
      pushBot(
        "Please upload your partner's medical records (optional). If you don't have any at the moment, just select the 'Skip' option below.",
        {
          questionId: "partnerRecordsChoice",
          options: [
            { value: "upload", label: "Upload Medical Records" },
            { value: "skip", label: "Skip" },
          ],
        }
      );
      proceed("partnerRecordsChoice", { type: "option", questionId: "partnerRecordsChoice" });
      return;
    }

    // === PARTNER MEDICAL RECORDS CHOICE ===
    if (step === "partnerRecordsChoice" && questionId === "partnerRecordsChoice") {
      pushUser(label, questionId);
      if (value === "upload") {
        pushBot("Please upload your partner's medical records", {
          questionId: "partnerRecordsUpload",
        });
        proceed("partnerRecordsUpload", {
          type: "file",
          questionId: "partnerRecordsUpload",
          accept: "image/*,application/pdf",
          multiple: true,
        });
        return;
      }
      if (value === "skip") {
        pushBot("Please provide your partner's email:", {
          questionId: "partnerEmail",
        });
        proceed("partnerEmail", { type: "text", questionId: "partnerEmail" });
        return;
      }
      return;
    }

    // Fallback: if this option belongs to the current step/question, route it to the generic answer handler
    const activeQuestionId = awaiting?.questionId || step;
    if (questionId === activeQuestionId) {
      handleAnswer(value);
    }
  };

  // === TEXT / FILE / DATE HANDLER ===
  const handleAnswer = (value) => {
    const q = awaiting?.questionId || step;

    if (awaiting.type === "file") {
    //   const fileMetadata = Array.isArray(value)
    //     ? value.map((file) => ({
    //         name: file.name || "unknown",
    //         size: file.size || 0,
    //         type: file.type || "unknown",
    //         lastModified: file.lastModified || Date.now(),
    //       }))
    //     : [];

    //   pushUser(`${fileMetadata.length} file(s) uploaded`, q);
      pushUser(`${Array.isArray(value) ? value.length : 0} file(s) uploaded`, q);

      if (step === "blueCrossUpload") {
        // setData((d) => ({ ...d, blueCrossFiles: fileMetadata }));
        setData((d) => ({ ...d, blueCrossFiles: Array.isArray(value) ? value : [] }));
        pushBot(
          "Thank you for providing your information. To help us connect you with the right specialist and schedule the appropriate time, could you please tell us the main reason you are contacting the clinic today?",
          {
            questionId: "reason",
            options: [
              {
                value: "infertility",
                label: "Infertility Evaluation or Multiple Losses",
              },
              {
                value: "future_planning",
                label:
                  "Future family planning: Egg preservation, Genetic inquiries, Preconception planning",
              },
              {
                value: "donor",
                label: "Need use of donor embrios / egg / sperm",
              },
              {
                value: "medical_preservation",
                label: "Preservation for medical need",
              },
              { value: "ivf", label: "IVF" },
              {
                value: "transfer_second_opinion",
                label: "Transfer care from another clinic / Second opinion",
              },
              { value: "returning", label: "Returning patient" },
              { value: "cancer", label: "Cancer" },
              { value: "detail", label: "Detail specific symptoms" },
              { value: "other", label: "Other" },
            ],
          }
        );
        proceed("reason", { type: "option", questionId: "reason" });
        return;
      }

      if (step === "healthCardUpload") {
        // setData((d) => ({ ...d, healthCardFiles: fileMetadata }));
        setData((d) => ({ ...d, healthCardFiles: Array.isArray(value) ? value : [] }));
        pushBot("What's your sex assigned at birth:", {
          questionId: "sex",
          options: [
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
          ],
        });
        proceed("sex", { type: "option", questionId: "sex" });
        return;
      }
      if (step === "recordsUpload") {
        // setData((d) => ({ ...d, medicalRecords: fileMetadata }));
        setData((d) => ({ ...d, medicalRecords: Array.isArray(value) ? value : [] }));
        pushBot(
          "Do you have a partner that will participate the pocedure? (non mandatory)",
          {
            questionId: "partner",
            options: [
              { value: true, label: "Yes, I do" },
              { value: false, label: "No, I don’t" },
            ],
          }
        );
        proceed("partner", { type: "option", questionId: "partner" });
        return;
      }

    if (step === "partnerHealthCardUpload") {
    setData((d) => ({
      ...d,
      partner: { ...d.partner, healthCardFiles: Array.isArray(value) ? value : [] },
    }));
    pushBot("What's your partner's sex assigned at birth:", {
      questionId: "partnerSex",
      options: [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
      ],
    });
    proceed("partnerSex", { type: "option", questionId: "partnerSex" });
    return;
    }

    if (step === "partnerRecordsUpload") {
    setData((d) => ({
      ...d,
      partner: { ...d.partner, medicalRecords: Array.isArray(value) ? value : [] },
    }));
    pushBot("Please provide your partner's email:", {
      questionId: "partnerEmail",
    });
    proceed("partnerEmail", { type: "text", questionId: "partnerEmail" });
    return;
    }
      return;
    }


    pushUser(String(value), q);

    if (step === "intro") {
      const { name, phone } = extractNameAndPhone(String(value));
      setData((d) => ({ ...d, name, phone }));
      pushBot(
        `Thank you very much, ${
          name || "there"
        }!\nBefore we move on to the next steps, I would like to know if you consent to sharing your personal information.\nYour data is 100% secure with us and will only be used to provide you the best support, okay?`,
        { questionId: "consent", showBooleanOptions: true }
      );
      proceed("consent", { type: "option", questionId: "consent" });
      return;
    }

    if (step === "email") {
      setData((d) => ({ ...d, email: String(value).trim() }));
      pushBot("Please tell me your phone number", {
        questionId: "phone",
      });
      proceed("phone", { type: "text", questionId: "phone" });
      return;
    }

    if (step === "phone") {
      setData((d) => ({ ...d, phone: String(value).trim() }));
      pushBot("Now, tell me your Date of birth:", { questionId: "dob" });
      proceed("dob", { type: "date", questionId: "dob" });
      return;
    }

    if (step === "dob") {
      const dob = String(value).trim();
      const age = computeAge(dob);
      const ageFlag = age !== null && age >= 35 ? "Advanced Age" : "";
      setData((d) => ({ ...d, dob, ageFlag }));
      pushBot("Please upload your Health Card:", {
        questionId: "healthCardUpload",
      });
      proceed("healthCardUpload", {
        type: "file",
        questionId: "healthCardUpload",
        accept: "image/*,application/pdf",
        multiple: false,
      });
      return;
    }

    // if (step === "sex") {
    //   setData((d) => ({ ...d, sexAtBirth: String(value) }));
    //   pushBot("And finally, what’s your address?", { questionId: "address" });
    //   proceed("address", { type: "text", questionId: "address" });
    //   return;
    // }
        if (step === "sex") {
      setData((d) => ({ ...d, sexAtBirth: String(value) }));

      // NEW: Pain Level Question
      pushBot("On a scale of 1-5, how would you rate your current pain level?", {
        questionId: "painLevel",
      });
      proceed("painLevel", { type: "text", questionId: "painLevel" });
      return;
    }
    
    if (step === "painLevel") {
      const input = String(value).trim();
      const num = parseInt(input.replace(/\/.*/, ""), 10); // "3/5" → 3

      if (isNaN(num) || num < 1 || num > 5) {
        pushBot("Please enter a valid number between 1 and 5.", { questionId: "painLevel" });
        return;
      }

    //   pushUser(input, "painLevel");
      setData((d) => ({ ...d, painLevel: num }));

      // Next: Address
      pushBot("And finally, what’s your address?", { questionId: "address" });
      proceed("address", { type: "text", questionId: "address" });
      return;
    }

    if (step === "address") {
      setData((d) => ({ ...d, address: String(value) }));
      pushBot("Do you have a OHIP number?", {
        questionId: "ohip",
        options: [
          { value: true, label: "Yes, I do" },
          { value: false, label: "No, I don’t" },
        ],
      });
      proceed("ohip", { type: "option", questionId: "ohip" });
      return;
    }
    
    
    if (step === "ohip") {
      const yes = String(value) === "true" || value === true;
      setData((d) => ({ ...d, ohipProvided: yes }));
      if (yes) {
        pushBot("Okay, please tell me your OHIP number.", {
          questionId: "ohipNumber",
        });
        proceed("ohipNumber", { type: "text", questionId: "ohipNumber" });
        return;
      }
      pushBot("Do you fit any of the available options below?", {
        questionId: "ohipOptions",
        options: [
          { value: "blue_cross", label: "I am Blue Cross insured" },
          { value: "out_province", label: "I am from out of the province" },
          { value: "out_country", label: "I am from out of the country" },
        ],
      });
      proceed("ohipOptions", { type: "option", questionId: "ohipOptions" });
      return;
    }

    if (step === "ohipNumber") {
      setData((d) => ({ ...d, ohipNumber: String(value).trim() }));
      pushBot(
        "Thank you for providing your information. To help us connect you with the right specialist and schedule the appropriate time, could you please tell us the main reason you are contacting the clinic today?",
        {
          questionId: "reason",
          options: [
            {
              value: "infertility",
              label: "Infertility Evaluation or Multiple Losses",
            },
            {
              value: "future_planning",
              label:
                "Future family planning: Egg preservation, Genetic inquiries, Preconception planning",
            },
            {
              value: "donor",
              label: "Need use of donor embrios / egg / sperm",
            },
            {
              value: "medical_preservation",
              label: "Preservation for medical need",
            },
            { value: "ivf", label: "IVF" },
            {
              value: "transfer_second_opinion",
              label: "Transfer care from another clinic / Second opinion",
            },
            { value: "returning", label: "Returning patient" },
            { value: "cancer", label: "Cancer" },
            { value: "detail", label: "Detail specific symptoms" },
            { value: "other", label: "Other" },
          ],
        }
      );
      proceed("reason", { type: "option", questionId: "reason" });
      return;
    }

    if (step === "reasonDetail") {
      const reasonText = String(value);
      const tags = categorizeReason(reasonText);
      setData((d) => ({
        ...d,
        reasonRaw: reasonText,
        reasonTags: tags.length ? tags : ["Detail specific symptoms"],
      }));
      pushBot(
        "Okay. Before proceeding, please send me any medical records you have available. If you don't have any at the moment, just select the “I don't have any” option below.",
        {
          questionId: "recordsChoice",
          options: [
            { value: "upload", label: "Upload Medical Records" },
            { value: "none", label: "I don’t have any" },
          ],
        }
      );
      proceed("recordsChoice", { type: "option", questionId: "recordsChoice" });
      return;
    }

    if (step === "reason") {
      const reasonText = String(value);
      const tags = categorizeReason(reasonText);
      setData((d) => ({ ...d, reasonRaw: reasonText, reasonTags: tags }));

      if (tags.includes("Returning patient")) {
        pushBot("Was your last consultation within a year?", {
          questionId: "returning",
          options: [
            { value: true, label: "Yes" },
            { value: false, label: "No" },
          ],
        });
        proceed("returning", { type: "option", questionId: "returning" });
        return;
      }

      if (
        tags.includes("Infertility Evaluation or Multiple Losses") ||
        reasonText.toLowerCase().includes("conceive")
      ) {
        pushBot("And how long have you been trying to conceive?", {
          questionId: "ttc",
          options: [
            { value: "12+ months", label: "12 months or more" },
            { value: "6 months", label: "6 months" },
            { value: "3 months", label: "3 months" },
            { value: "<3 months", label: "Less than 3 months" },
          ],
        });
        proceed("ttc", { type: "option", questionId: "ttc" });
        return;
      }

      if (tags.includes("Immune Service") || tags.includes("General Surgery")) {
        pushBot(
          `Okay, ${
            data.name || "there"
          }.\nI will refer you to one of our specialists right now! \nHe will be able to clarify any points related to your case ok?\nThank you very much for speaking with me and until next time!`,
          { questionId: "escalate-other" }
        );
        setFlag("humanEscalation", true);
        proceed("end", { type: "none" });
        return;
      }

      if (tags.includes("Ginecology") || tags.includes("Already Preagnant")) {
        pushBot(
          `I'm sorry, ${
            data.name || "there"
          }, unfortunately we are unable to help you with your case.\nI recommend contacting your family doctor first, so we can help you in the best way possible!\nWe at Marham Fertility Center appreciate your contact!\nFeel free to contact us whenever you want. Our mission is to help you. I hope to see you soon.`,
          { questionId: "end-sorry" }
        );
        proceed("end", { type: "none" });
        return;
      }

      pushBot(
        "Okay. Before proceeding, please send me any medical records you have available. If you don't have any at the moment, just select the “I don't have any” option below.",
        {
          questionId: "recordsChoice",
          options: [
            { value: "upload", label: "Upload Medical Records" },
            { value: "none", label: "I don’t have any" },
          ],
        }
      );
      proceed("recordsChoice", { type: "option", questionId: "recordsChoice" });
      return;
    }

    if (step === "returning") {
      const yes = String(value) === "true" || value === true;
      setData((d) => ({ ...d, returningWithinYear: yes }));
      if (!yes) {
        pushBot(
          `Okay, ${
            data.name || "there"
          }.\nI will refer you to one of our specialists right now! \nHe will be able to clarify any points related to your case ok?\nThank you very much for speaking with me and until next time!`,
          { questionId: "returning-escalate" }
        );
        setFlag("humanEscalation", true);
        proceed("end", { type: "none" });
        return;
      }
      pushBot(
        "Okay. Before proceeding, please send me any medical records you have available. If you don't have any at the moment, just select the “I don't have any” option below.",
        {
          questionId: "recordsChoice",
          options: [
            { value: "upload", label: "Upload Medical Records" },
            { value: "none", label: "I don’t have any" },
          ],
        }
      );
      proceed("recordsChoice", { type: "option", questionId: "recordsChoice" });
      return;
    }

    if (step === "ttc") {
      setData((d) => ({ ...d, ttcDuration: String(value) }));
      pushBot(
        "Okay. Before proceeding, please send me any medical records you have available. If you don't have any at the moment, just select the “I don't have any” option below.",
        {
          questionId: "recordsChoice",
          options: [
            { value: "upload", label: "Upload Medical Records" },
            { value: "none", label: "I don’t have any" },
          ],
        }
      );
      proceed("recordsChoice", { type: "option", questionId: "recordsChoice" });
      return;
    }

    if (step === "partnerName") {
      setData((d) => ({
        ...d,
        partner: { ...d.partner, name: String(value).trim() },
      }));
      pushBot("Please provide your partner's date of birth:", {
        questionId: "partnerDob",
      });
      proceed("partnerDob", { type: "date", questionId: "partnerDob" });
      return;
    }

    if (step === "partnerDob") {
      setData((d) => ({
        ...d,
        partner: { ...d.partner, dob: String(value).trim() },
      }));
      pushBot("Please upload your partner's Health Card:", {
        questionId: "partnerHealthCardUpload",
      });
      proceed("partnerHealthCardUpload", {
        type: "file",
        questionId: "partnerHealthCardUpload",
        accept: "image/*,application/pdf",
        multiple: false,
      });
      return;
    }

    if (step === "partnerEmail") {
      setData((d) => ({
        ...d,
        partner: { ...d.partner, email: String(value).trim() },
      }));
      pushBot("Please provide your partner's address:", {
        questionId: "partnerAddress",
      });
      proceed("partnerAddress", {
        type: "text",
        questionId: "partnerAddress",
      });
      return;
    }

    if (step === "partnerAddress") {
      setData((d) => ({
        ...d,
        partner: { ...d.partner, address: String(value).trim() },
      }));
      pushBot("Please provide your partner's phone number:", {
        questionId: "partnerPhone",
      });
      proceed("partnerPhone", { type: "text", questionId: "partnerPhone" });
      return;
    }

    if (step === "partnerPhone") {
      setData((d) => ({
        ...d,
        partner: { ...d.partner, phone: String(value).trim() },
      }));
      endFlow();
      return;
    }
  };

  return { handleOptionClick, handleAnswer };
};


