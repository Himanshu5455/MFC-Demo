export const QUESTIONS = [
  {
    id: 'name',
    type: 'text',
    question: "Hi there! 👋 I'm here to help you get started. What's your full name?",
    placeholder: "Enter your full name",
    required: true,
    validation: (value) => value.trim().length >= 2 ? null : "Please enter your full name"
  },
   {
    id: 'phone',
    type: 'tel',
    question: "What's the best phone number to reach you?",
    placeholder: "Enter your phone number",
    required: true,
    validation: (value) => value.replace(/\D/g, '').length >= 10 ? null : "Please enter a valid phone number"
  },
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
    required: true
  },
  
  // Step 3: Referral & Demographics Flow
  {
    id: 'has_referral',
    type: 'select',
    question: "Do you have a referral?",
    options: [
      { value: 'yes_i_do', label: 'Yes, I do' },
      { value: 'yes_from_sprout', label: 'Yes, from Sprout' },
      { value: 'no_i_dont', label: "No, I don't" }
    ],
    required: true
  },
  {
    id: 'demographics_name',
    type: 'text',
    question: "Okay, what's your full name?",
    placeholder: "Enter your full name",
    required: true,
    validation: (value) => value.trim().length >= 2 ? null : "Please enter your full name"
  },
  {
    id: 'demographics_dob',
    type: 'date',
    question: "What's your date of birth?",
    required: true
  },
  {
    id: 'demographics_email',
    type: 'email',
    question: "What's your email address?",
    placeholder: "Enter your email address",
    required: true,
    validation: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : "Please enter a valid email address";
    }
  },
  {
    id: 'demographics_health_card',
    type: 'text',
    question: "Could you please provide your health card number?",
    placeholder: "Enter your health card number",
    required: false
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
    required: false
  },
  {
    id: 'demographics_address',
    type: 'textarea',
    question: "What's your full address?",
    placeholder: "Enter your complete address",
    required: false
  },
  {
    id: 'demographics_phone',
    type: 'tel',
    question: "What's your phone number?",
    placeholder: "Enter your phone number",
    required: true,
    validation: (value) => value.replace(/\D/g, '').length >= 10 ? null : "Please enter a valid phone number"
  },
 
  {
    id: 'referral_reason',
    type: 'select',
    question: "What's the primary reason for your referral?",
    options: [
      { value: 'fertility', label: 'Fertility Issues' },
      { value: 'gynecology', label: 'Gynecological Concerns' },
      { value: 'obstetrics', label: 'Obstetrics' },
      { value: 'menstrual', label: 'Menstrual Disorders' },
      { value: 'other', label: 'Other' }
    ],
    required: true
  },
  {
    id: 'partner_available',
    type: 'boolean',
    question: "Do you have a partner who will be involved in your care?",
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ],
    required: false
  },
  {
    id: 'partner_name',
    type: 'text',
    question: "What's your partner's name?",
    placeholder: "Enter your partner's name",
    required: false,
    showIf: (answers) => answers.partner_available === true
  },
  {
    id: 'alternative_no',
    type: 'tel',
    question: "Alternative phone number we can reach you at?",
    placeholder: "Enter alternative phone number (optional)",
    required: false
  },
  {
    id: 'physician',
    type: 'select',
    question: "Who is your current family physician or primary care doctor?",
      options: [
      { value: 'Dr. Garcia', label: 'Dr. Garcia' },
      { value: 'Dr. Chang', label: 'Dr. Chang' },
      { value: 'Dr. Kelly', label: 'Dr. Kelly' },
    ],
    
    required: false
  },
  {
    id: 'region',
    type: 'select',
    question: "Which region are you located in?",
    options: [
      { value: 'toronto', label: 'Toronto' },
      { value: 'ottawa', label: 'Ottawa' },
      { value: 'hamilton', label: 'Hamilton' },
      { value: 'london', label: 'London' },
      { value: 'kitchener', label: 'Kitchener-Waterloo' },
      { value: 'other', label: 'Other' }
    ],
    required: false
  },
  {
    id: 'dob',
    type: 'date',
    question: "What's your date of birth?",
    required: false
  },
  {
    id: 'OHIP',
    type: 'text',
    question: "What's your OHIP number?",
    placeholder: "Enter your OHIP number",
    required: false
  },
  {
    id: 'gender',
    type: 'select',
    question: "How do you identify your gender?",
    options: [
      { value: 'female', label: 'Female' },
      { value: 'male', label: 'Male' },
      { value: 'non-binary', label: 'Non-binary' },
      { value: 'prefer-not-to-say', label: 'Prefer not to say' },
      { value: 'other', label: 'Other' }
    ],
    required: false
  },
  {
    id: 'full_address',
    type: 'textarea',
    question: "What's your full address?",
    placeholder: "Enter your complete address",
    required: false
  },
  {
    id: 'refer_physician_available',
    type: 'boolean',
    question: "Do you have a referring physician?",
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ],
    required: false
  },
  {
    id: 'refer_physician_name',
    type: 'text',
    question: "What's your referring physician's name?",
    placeholder: "Enter referring physician's name",
    required: false,
    showIf: (answers) => answers.refer_physician_available === true
  },
  {
    id: 'refer_physician_email',
    type: 'email',
    question: "What's your referring physician's email address?",
    placeholder: "Enter referring physician's email",
    required: false,
    showIf: (answers) => answers.refer_physician_available === true
  },
  {
    id: 'refer_physician_address',
    type: 'textarea',
    question: "What's your referring physician's address?",
    placeholder: "Enter referring physician's address",
    required: false,
    showIf: (answers) => answers.refer_physician_available === true
  },
  {
    id: 'refer_physician_fax_no',
    type: 'tel',
    question: "What's your referring physician's fax number?",
    placeholder: "Enter referring physician's fax number",
    required: false,
    showIf: (answers) => answers.refer_physician_available === true
  },
  {
    id: 'refer_physician_OHIP_no',
    type: 'text',
    question: "What's your referring physician's OHIP number?",
    placeholder: "Enter referring physician's OHIP number",
    required: false,
    showIf: (answers) => answers.refer_physician_available === true
  },
  {
    id: 'refer_physician_region',
    type: 'select',
    question: "Which region is your referring physician located in?",
    options: [
      { value: 'toronto', label: 'Toronto' },
      { value: 'ottawa', label: 'Ottawa' },
      { value: 'hamilton', label: 'Hamilton' },
      { value: 'london', label: 'London' },
      { value: 'kitchener', label: 'Kitchener-Waterloo' },
      { value: 'other', label: 'Other' }
    ],
    required: false,
    showIf: (answers) => answers.refer_physician_available === true
  },
  {
    id: 'pain_scale',
    type: 'scale',
    question: "On a scale of 1-5, how would you rate your current pain level?",
    min: 1,
    max: 5,
    required: false,
      validation: (value) => {
    const num = Number(value);
    if (isNaN(num)) return "Please enter a number";
    if (num < 1 || num > 5) return "Value must be between 1 and 5";
    return null;
  }
  },
  {
    id: 'positive_experience',
    type: 'boolean',
    question: "Have you had a positive healthcare experience recently?",
    options: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ],
    required: false
  },
  {
    id: 'rate_experience',
    type: 'rating',
    question: "How would you rate your overall experience with healthcare services?",
    max: 5,
    required: false
  },
  {
    id: 'comment',
    type: 'textarea',
    question: "Is there anything else you'd like us to know or any additional comments?",
    placeholder: "Share any additional information or concerns...",
    required: false
  },

  {
  id: 'files_permission',
  type: 'boolean',
  question: "Would you like to upload any medical documents or files?",
  options: [
    { value: true, label: 'Yes' },
    { value: false, label: 'No' }
  ],
  required: false
},
{
  id: 'files',
  type: 'file',
  question: "Please attach your medical documents or images",
  accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  multiple: true,
  required: false,
  showIf: (answers) => answers.files_permission === true  
}

  // {
  //   id: 'files',
  //   type: 'file',
  //   question: "Would you like to upload any medical documents or files?",
  //   accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  //   multiple: true,
  //   required: false
  // }
];



export const getVisibleQuestions = (answers) => {
  // console.log("Heelloo");
  // console.log(typeof answers.partner_available, answers.partner_available,"data");
  return QUESTIONS.filter(question => {
    if (!question.showIf) return true;
    return question.showIf(answers);
  });
};


