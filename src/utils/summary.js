
import { QUESTIONS } from "../data/questions";

const getReasonLabel = (reasonValue) => {
  try {
    const reasonQ = QUESTIONS.find((q) => q.id === "referral_reason");
    if (reasonQ && Array.isArray(reasonQ.options)) {
      const opt = reasonQ.options.find((o) => o.value === reasonValue);
      if (opt) return opt.label;
    }
  } catch {}
  return reasonValue;
};

const getReferralLabel = (referralValue) => {
  try {
    const referralQ = QUESTIONS.find((q) => q.id === "has_referral");
    if (referralQ && Array.isArray(referralQ.options)) {
      const opt = referralQ.options.find((o) => o.value === referralValue);
      if (opt) return opt.label;
    }
  } catch {}
  return referralValue;
};

const getSexLabel = (sexValue) => {
  try {
    const sexQ = QUESTIONS.find((q) => q.id === "demographics_sex_assigned_at_birth");
    if (sexQ && Array.isArray(sexQ.options)) {
      const opt = sexQ.options.find((o) => o.value === sexValue);
      if (opt) return opt.label;
    }
  } catch {}
  return sexValue;
};

export const buildSummary = (answersLike) => {
  // Legacy fields (from original flow)
  const savedName = answersLike?.name || answersLike?.demographics_name || "";
  const savedEmail = answersLike?.email || answersLike?.demographics_email || "";
  const savedPhone = answersLike?.phone || answersLike?.demographics_phone || "";
  const savedDob = answersLike?.dob || answersLike?.demographics_dob || "";
  
  // New demographic fields
  const savedReferralType = answersLike?.has_referral || "";
  const savedReferralLabel = getReferralLabel(savedReferralType);
  const savedHealthCard = answersLike?.demographics_health_card || "";
  const savedSex = answersLike?.demographics_sex_assigned_at_birth || "";
  const savedSexLabel = getSexLabel(savedSex);
  const savedAddress = answersLike?.demographics_address || "";
  
  // Legacy referral fields
  const savedReferral =
    answersLike?.refer_physician_name || answersLike?.physician || "";
  const savedReasonValue = answersLike?.referral_reason || "";
  const savedReasonLabel = getReasonLabel(savedReasonValue);

  const summaryLines = [
    `Great! I have received your information.`,
    `Full name: ${savedName || "N/A"}`,
    `Email: ${savedEmail || "N/A"}`,
    `Phone: ${savedPhone || "N/A"}`,
    `Date of Birth: ${savedDob || "N/A"}`,
    `Referral Status: ${savedReferralLabel || "N/A"}`,
    `Health Card: ${savedHealthCard || "N/A"}`,
    `Sex Assigned at Birth: ${savedSexLabel || "N/A"}`,
    `Address: ${savedAddress || "N/A"}`,
    `Referral Source: ${savedReferral || "N/A"}`,
    `Reason: ${savedReasonLabel || "N/A"}`,
    ``,
    `Is that correct?`,
  ];

  return summaryLines.join("\n");
};

export const mergeWithStoredAnswers = (fallbackAnswers) => {
  let merged = { ...fallbackAnswers };
  try {
    const savedDataRaw = localStorage.getItem("questionnaire");
    if (savedDataRaw) {
      const savedData = JSON.parse(savedDataRaw);
      const a = savedData?.answers || {};
      merged = {
        ...merged,
        // Legacy fields
        name: a.name ?? merged.name,
        email: a.email ?? merged.email,
        phone: a.phone ?? merged.phone,
        dob: a.dob ?? merged.dob,
        refer_physician_name:
          a.refer_physician_name ?? merged.refer_physician_name,
        physician: a.physician ?? merged.physician,
        referral_reason: a.referral_reason ?? merged.referral_reason,
        // New demographic fields
        has_referral: a.has_referral ?? merged.has_referral,
        demographics_name: a.demographics_name ?? merged.demographics_name,
        demographics_dob: a.demographics_dob ?? merged.demographics_dob,
        demographics_email: a.demographics_email ?? merged.demographics_email,
        demographics_health_card: a.demographics_health_card ?? merged.demographics_health_card,
        demographics_sex_assigned_at_birth: a.demographics_sex_assigned_at_birth ?? merged.demographics_sex_assigned_at_birth,
        demographics_address: a.demographics_address ?? merged.demographics_address,
        demographics_phone: a.demographics_phone ?? merged.demographics_phone,
      };
    }
  } catch (e) {
    // ignore parse errors and proceed with fallback
  }
  return merged;
};
