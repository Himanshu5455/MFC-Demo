export const CHATBOT_FLOW_STEP2_QUESTIONS = [
  // Step 2: Consent (using same as existing questionnaire)
  {
    id: 'consent_info',
    type: 'boolean',
    question: (answers) => `Thank you very much, ${answers.name || 'there'}!

Before we move on to the next steps, I would like to know if you consent to sharing your personal information.

Your data is 100% secure with us and will only be used to provide you the best support, okay?`,
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ],
    required: true,
    step: 2
  },
  {
    id: 'consent_declined',
    type: 'message',
    message: (answers) => `I understand, ${answers.name || 'there'}. If you don't feel comfortable sharing your information with me, we'll refer you to one of our specialists to get in touch with you.`,
    step: 2,
    showIf: (answers) => answers.consent_request === false,
    isEnd: true,
    escalationType: 'human'
  },

  // Step 3: Referral & Demographics (following flowchart exactly)
  {
    id: 'referral_check',
    type: 'select',
    question: "Do you have a referral?",
    options: [
      { value: 'yes_i_do', label: 'Yes, I do' },
      { value: 'yes_from_sprout', label: 'Yes, from Sprout' },
      { value: 'no_i_dont', label: "No, I don't" }
    ],
    required: true,
    step: 3
  },
  // Demographics collection as per flowchart
  {
    id: 'demographics_dob',
    type: 'date',
    question: "What's your date of birth?",
    required: true,
    step: 3
  },
  {
    id: 'demographics_health_card',
    type: 'text',
    question: (answers) => {
      if (answers.referral_check === 'yes_from_sprout') {
        return "Could you please provide your health card number?";
      }
      return "Could you please provide your health card number?";
    },
    placeholder: "Enter your health card number",
    required: (answers) => answers.referral_check !== 'yes_from_sprout',
    step: 3
  },
  {
    id: 'demographics_sex_assigned_at_birth',
    type: 'select',
    question: "What sex were you assigned at birth?",
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'other', label: 'Other' },
      { value: 'prefer_not_to_say', label: 'Prefer not to say' }
    ],
    required: false,
    step: 3
  },
  {
    id: 'demographics_email',
    type: 'email',
    question: "What's your email address?",
    placeholder: "Enter your email address",
    required: true,
    step: 3,
    validation: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : "Please enter a valid email address";
    }
  },
  {
    id: 'demographics_address',
    type: 'textarea',
    question: "What's your full address?",
    placeholder: "Enter your complete address",
    required: false,
    step: 3
  },
  {
    id: 'demographics_phone',
    type: 'tel',
    question: "What's your phone number?",
    placeholder: "Enter your phone number",
    required: true,
    step: 3,
    validation: (value) => value.replace(/\D/g, '').length >= 10 ? null : "Please enter a valid phone number"
  },
  
  // OHIP Number Section
  {
    id: 'has_ohip',
    type: 'boolean',
    question: `Thank you very much!

Do you have a OHIP number?`,
    options: [
      { value: true, label: 'Yes, I do' },
      { value: false, label: "No, I don't" }
    ],
    required: true,
    step: 3
  },
  {
    id: 'ohip_number',
    type: 'text',
    question: "Okay, please tell me your OHIP number.",
    placeholder: "Enter your OHIP number",
    required: true,
    step: 3,
    showIf: (answers) => answers.has_ohip === true
  },
  {
    id: 'alternative_insurance',
    type: 'select',
    question: "Do you fit any of the available options below?",
    options: [
      { value: 'blue_cross', label: 'I am Blue Cross insured' },
      { value: 'out_of_province', label: 'I am from out of the province' },
      { value: 'out_of_country', label: 'I am from out of the country' }
    ],
    required: true,
    step: 3,
    showIf: (answers) => answers.has_ohip === false
  },
  {
    id: 'blue_cross_id_upload',
    type: 'boolean',
    question: "Do you have your Blue Cross ID to be uploaded?",
    options: [
      { value: true, label: 'Yes, I have it' },
      { value: false, label: "I don't have it right now" }
    ],
    required: true,
    step: 3,
    showIf: (answers) => answers.alternative_insurance === 'blue_cross'
  },
  {
    id: 'blue_cross_documents',
    type: 'file',
    question: "Please upload your Blue Cross documents",
    accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
    multiple: true,
    required: true,
    step: 3,
    showIf: (answers) => answers.alternative_insurance === 'blue_cross' && answers.blue_cross_id_upload === true
  },

  // Payment confirmation for out of province/country
  {
    id: 'payment_confirmation',
    type: 'boolean',
    question: (answers) => {
      const location = answers.alternative_insurance === 'out_of_province' ? 'out of the province' : 'out of the country';
      return `Please note that the consultation fee of 200 CAD will be the patient’s responsibility.`;
    },
    options: [
      { value: true, label: 'Yes, proceed' },
      { value: false, label: 'No' }
    ],
    required: true,
    step: 3,
    showIf: (answers) => answers.alternative_insurance === 'out_of_province' || answers.alternative_insurance === 'out_of_country'
  },

  // Human escalation message for payment decline
  {
    id: 'payment_declined_escalation',
    type: 'message',
    message: (answers) => `I understand, ${answers.name || 'there'}. I can refer you to one of our specialists.
We'll transfer you to one of our specialists so we can better understand your situation.`,
    step: 3,
    showIf: (answers) => answers.payment_confirmation === false,
    isEnd: true,
    escalationType: 'human'
  }
];

// Helper function to get questions for a specific step
export const getQuestionsForStep = (step) => {
  return CHATBOT_FLOW_STEP2_QUESTIONS.filter(question => question.step === step);
};

// Helper function to get visible questions based on answers
export const getVisibleFlowQuestions = (answers) => {
  return CHATBOT_FLOW_STEP2_QUESTIONS.filter(question => {
    if (!question.showIf) return true;
    return question.showIf(answers);
  });
};

// Helper function to get next question in flow
export const getNextQuestion = (currentQuestionId, answers) => {
  const visibleQuestions = getVisibleFlowQuestions(answers);
  const currentIndex = visibleQuestions.findIndex(q => q.id === currentQuestionId);
  
  if (currentIndex === -1 || currentIndex === visibleQuestions.length - 1) {
    return null; // No next question
  }
  
  return visibleQuestions[currentIndex + 1];
};

// Helper function to check if flow is complete
export const isFlowComplete = (answers) => {
  const requiredQuestions = CHATBOT_FLOW_STEP2_QUESTIONS.filter(q => q.required && !q.isIntro && !q.isEnd);
  return requiredQuestions.every(q => {
    if (q.showIf && !q.showIf(answers)) return true; // Skip if condition not met
    return answers[q.id] !== undefined && answers[q.id] !== '' && answers[q.id] !== null;
  });
};
