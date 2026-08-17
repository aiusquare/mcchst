export const secondrySubjects = [
  { id: "1", name: "English Language" },
  { id: "2", name: "Mathematics" },
  { id: "3", name: "Islamic Studies" },
  { id: "4", name: "Computer Science" },
  { id: "5", name: "Agricultural Science" },
  { id: "6", name: "General Mathematics" },
  { id: "7", name: "Biology" },
  { id: "8", name: "Physics" },
  { id: "9", name: "Chemistry" },
  { id: "10", name: "Further Mathematics" },
  { id: "11", name: "Health and Physical Education" },
  { id: "12", name: "Technical Drawing" },
  { id: "13", name: "Food and Nutrition" },
  { id: "14", name: "Financial Accounting" },
  { id: "15", name: "Book Keeping" },
  { id: "16", name: "Typewriting" },
  { id: "17", name: "Commerce" },
  { id: "18", name: "Data Processing" },
  { id: "19", name: "Economics" },
  { id: "20", name: "Government" },
  { id: "21", name: "Civic Education" },
  { id: "22", name: "Geography" },
  { id: "22", name: "History" },
  { id: "22", name: "Fisheries" },
  { id: "23", name: "Hausa" },
];

export const secondryScores = [
  { id: "1", name: "A1" },
  { id: "2", name: "B2" },
  { id: "3", name: "B3" },
  { id: "4", name: "C4" },
  { id: "5", name: "C5" },
  { id: "6", name: "C6" },
  { id: "7", name: "D7" },
  { id: "8", name: "E8" },
  { id: "9", name: "F9" },
  { id: "10", name: "Awaiting Result" },
];

export const accessRules = {
  application: ["/admin/application", "/admin/list-of-applicants"],
  admission: [
    "/admin/application",
    "/admin/list-of-admission",
    "/admin/list-of-registered",
    "/admin/list-of-applicants",
    "/admin/admission",
    "/admin/students-id-card",
  ],
  finance: [
    "/admin/finance",
    "/admin/finance/settlement-creation",
    "/admin/create-invoice",
    "/admin/raised-invoices",
    "/admin/invoices-report",
    "/admin/invoice-sync",
    "/admin/student-finance-report",
    "/admin/account-reconciliation",
    "/admin/hostel-reports",
    "/admin/funds-transfer",
    "/admin/manual-payment",
    "/admin/edit-invoice",
    "/admin/view-invoice",
  ],
  accounting: [
    "/admin/invoices-report",
    "/admin/invoice-sync",
    "/admin/account-reconciliation",
    "/admin/manual-payment",
    "/admin/edit-invoice",
    "/admin/view-invoice",
  ],
  officer: [
    "/admin/officers",
    "/admin/scholarship",
    "/admin/course-registration",
    "/admin/view-invoice",
    "/admin/dept-reports",
    "/admin/hod-undertakings",
    "/admin/undertaking-reports",
    "/admin/confirm-admission",
    "/admin/hod-clearance",
    "/admin/sao-clearance",
    "/admin/account-clearance",
    "/admin/stationary-collection",
    "/admin/exit-card-list",
    "/admin/course-management",
  ],
  users: ["/admin/users", "/admin/create-staff"],
  qualityAssurance: ["/admin/undertaking-reports"],
  siteAdmin: [
    "/admin",
    "/admin/application",
    "/admin/finance",
    "/admin/users",
    "/admin/create-staff",
    "/admin/settings",
  ],
};

export const requiredRegistrationKeys = [
  "FirstName",
  "Surname",
  "PhoneNumber",
  "Email",
  "AdmissionNumber",
  "Address",
  "State",
  "LGA",
  "Gender",
  "MaritalStatus",
  "DoB",
  "PrimarySchool",
  "SecondarySchool",
  "PrimaryYear",
  "SecondaryYear",
  "ParentOrGuardianName",
  "ParentOrGuardianPhone",
  "ParentOrGuardianAddress",
];

export const programmes = [
  {
    id: "0",
    name: "Higher National Diploma",
    programs: [
      {
        id: 1,
        name: "HND in Environmental Health Technology",
      },
      {
        id: 2,
        name: "HND in Health Information Management",
      },
      {
        id: 3,
        name: "HND in Dental Therapy",
      },
    ],
  },
  {
    id: "1",
    name: "National Diploma",
    programs: [
      {
        id: 1,
        name: "ND in Public Health Technology",
      },
      {
        id: 2,
        name: "ND in Epidemiology and Disease Control Technology",
      },
      {
        id: 3,
        name: "ND in Environmental Health Technology",
      },
      {
        id: 4,
        name: "ND in Dental Therapy",
      },
      {
        id: 5,
        name: "ND in Dental Technology",
      },
      {
        id: 6,
        name: "ND in Health Information Management",
      },
      {
        id: 7,
        name: "ND in Community Health",
      },
      {
        id:8,
        name: "ND in Pharmacy Technician",
      },
      {
        id: 9,
        name: "ND in Medical Laboratory Science",
      },
    ],
  },
  {
    id: "2",
    name: "Professional Diploma",
    programs: [
      {
        id: 1,
        name: "Diploma in Medical Imaging Processing and X-ray Technician",
      },
      {
        id: 2,
        name: "Diploma in Medical Laboratory Technician",
      },
      {
        id: 3,
        name: "Diploma in Pharmacy Technician",
      },
      {
        id: 4,
        name: "Diploma in Community Health",
      },
    ],
  },
  {
    id: "3",
    name: "Certificates",
    programs: [
      {
        id: 1,
        name: "Certificate in Community Health",
      },
    ],
  },
];

export const admissionProgrammes = [
  {
    department: "Community Health",
    programmes: [
      {
        programme: "Certificate in Community Health",
        programmeCode: "JCHEW",
        admissionCode: "JC",
        duration: "2 Years",
      },
      {
        programme: "Diploma in Community Health",
        programmeCode: "CHEW",
        admissionCode: "CH",
        duration: "3 Years",
      },
      {
        programme: "ND in Community Health",
        programmeCode: "ND CHEW",
        admissionCode: "NC",
        duration: "2 Years",
      },
    ],
  },
  {
    department: "Medical Laboratory Science",
    programmes: [
      {
        programme: "ND in Medical Laboratory Technology",
        programmeCode: "ND MLT",
        admissionCode: "MT",
        duration: "2 Years",
      },
      {
        programme: "Diploma in Medical Laboratory Technician",
        programmeCode: "MLT",
        admissionCode: "MT",
        duration: "3 Years",
      },
    ],
  },
  {
    department: "Public Health",
    programmes: [
      {
        programme: "ND in Public Health Technology",
        programmeCode: "ND PHT",
        admissionCode: "PH",
        duration: "2 Years",
      },
    ],
  },
  {
    department: "Health Information Management",
    programmes: [
      {
        programme: "ND in Health Information Management",
        programmeCode: "ND HIM",
        admissionCode: "HM",
        duration: "2 Years",
      },
      {
        programme: "HND in Health Information Management",
        programmeCode: "HND HIM",
        admissionCode: "HM",
        duration: "2 Years",
      },
    ],
  },
  {
    department: "Pharmacy Technician",
    programmes: [
      {
        programme: "ND in Pharmacy Technician",
        programmeCode: "ND PT",
        admissionCode: "NP",
        duration: "2 Years",
      },
      {
        programme: "Diploma in Pharmacy Technician",
        programmeCode: "DPT",
        admissionCode: "PT",
        duration: "3 Years",
      },
    ],
  },
  {
    department: "Medical Imaging Processing and X-ray",
    programmes: [
      {
        programme: "Diploma in Medical Imaging Processing and X-ray Technician",
        programmeCode: "MXT",
        admissionCode: "MX",
        duration: "2 Years",
      },
    ],
  },
  {
    department: "Dental Health",
    programmes: [
      {
        programme: "ND in Dental Technology",
        programmeCode: "ND DTE",
        admissionCode: "DT",
        duration: "2 Years",
      },
      {
        programme: "ND in Dental Therapy",
        programmeCode: "ND DT",
        admissionCode: "NDT",
        duration: "2 Years",
      },
      {
        programme: "HND in Dental Therapy",
        programmeCode: "HND DT",
        admissionCode: "HDT",
        duration: "2 Years",
      },
      {
        programme: "HND in Dental Technology",
        programmeCode: "HND DT",
        admissionCode: "DT",
        duration: "2 Years",
      },
    ],
  },
  {
    department: "Environmental Health",
    programmes: [
      {
        programme: "ND in Environmental Health",
        programmeCode: "ND EH",
        admissionCode: "EH",
        duration: "2 Years",
      },
      {
        programme: "HND in Environmental Health",
        programmeCode: "HND EH",
        admissionCode: "EH",
        duration: "2 Years",
      },
    ],
  },
];

export const accesses = [
  { name: "Finance", code: "finance" },
  { name: "Application", code: "application" },
  { name: "Admision", code: "admission" },
  { name: "Site Administrator", code: "siteAdmin" },
  { name: "Account Officer", code: "accounting" },
  { name: "Quality Assurance", code: "qualityAssurance" },
  { name: "College Officer", code: "officer" },
  { name: "Security Officer", code: "so" },
];

export const entryMode = [
  { name: "Fresh", code: "fresh" },
  { name: "Retrainee", code: "retrainee" },
  { name: "Transfer", code: "transfer" },
  { name: "Abridgment", code: "abridgment" },
];

export const sessionOfEntry = [
  { name: "2023/2024" },
  { name: "2024/2025" },
  { name: "2025/2026" },
  { name: "2026/2027" },
];

export const officers = [
  { name: "Head of Dept", role: "hod" },
  { name: "Student affairs", role: "sao" },
  { name: "Burser", role: "burser" },
  { name: "Account officer", role: "accounting" },
  { name: "Registerer", role: "registerer" },
];
