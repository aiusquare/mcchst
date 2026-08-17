export const ADMIN_PAGE_ACCESS_OPTIONS = [
  {
    group: "Application",
    pages: [
      { label: "Application setup", path: "/admin/application" },
      { label: "List of applicants", path: "/admin/list-of-applicants" },
      {
        label: "Academic session management",
        path: "/admin/academic-session-management",
      },
    ],
  },
  {
    group: "Admission",
    pages: [
      { label: "Admit student", path: "/admin/admission" },
      { label: "Admitted students", path: "/admin/list-of-admission" },
      { label: "Registered students", path: "/admin/list-of-registered" },
      { label: "Students ID card", path: "/admin/students-id-card" },
    ],
  },
  {
    group: "Finance",
    pages: [
      { label: "Manage payment", path: "/admin/finance" },
      {
        label: "Settlement creation",
        path: "/admin/finance/settlement-creation",
      },
      { label: "Create invoice", path: "/admin/create-invoice" },
      { label: "Raised invoices", path: "/admin/raised-invoices" },
      { label: "Invoices report", path: "/admin/invoices-report" },
      { label: "Invoice sync", path: "/admin/invoice-sync" },
      { label: "Students finance report", path: "/admin/student-finance-report" },
      { label: "Account reconciliation", path: "/admin/account-reconciliation" },
      { label: "Hostel reports", path: "/admin/hostel-reports" },
      { label: "Funds transfer", path: "/admin/funds-transfer" },
      { label: "Manual payment", path: "/admin/manual-payment" },
    ],
  },
  {
    group: "Users",
    pages: [
      { label: "Users management", path: "/admin/users" },
      { label: "Create user account", path: "/admin/create-staff" },
    ],
  },
  {
    group: "Quality Assurance",
    pages: [
      {
        label: "Reports of undertakings",
        path: "/admin/undertaking-reports",
      },
    ],
  },
  {
    group: "Office",
    pages: [
      { label: "Officers dashboard", path: "/admin/officers" },
      { label: "Department reports", path: "/admin/dept-reports" },
      { label: "Student admission", path: "/admin/confirm-admission" },
      { label: "Course management", path: "/admin/course-management" },
      { label: "HOD clearance", path: "/admin/hod-clearance" },
      { label: "SAO clearance", path: "/admin/sao-clearance" },
      { label: "Account clearance", path: "/admin/account-clearance" },
      { label: "Stationary collection", path: "/admin/stationary-collection" },
      { label: "Scholarship", path: "/admin/scholarship" },
      { label: "Registrar clearance", path: "/admin/registrar-clearance" },
      { label: "Stationaries registration", path: "/admin/registrar-stationaries" },
      { label: "Exit card list", path: "/admin/exit-card-list" },
      { label: "Registration documents", path: "/admin/registration-docs" },
      { label: "Registrar admissions", path: "/admin/registrar-admissions" },
      { label: "HOD undertakings", path: "/admin/hod-undertakings" },
      { label: "Registrar undertakings", path: "/admin/registrar-undertakings" },
    ],
  },
  {
    group: "Administration",
    pages: [{ label: "Site administration", path: "/admin/settings" }],
  },
];

const RELATED_PAGE_PATHS = {
  "/admin/invoices-report": ["/admin/edit-invoice", "/admin/view-invoice"],
  "/admin/raised-invoices": ["/admin/edit-invoice", "/admin/view-invoice"],
  "/admin/users": ["/admin/edit-users"],
  "/admin/create-staff": ["/admin/edit-users"],
};

const LOCAL_PAGE_ASSIGNMENTS_KEY = "userAdditionalPagesById";

export const normalizeAdminPath = (path) => {
  if (!path || typeof path !== "string") return "";

  const cleanPath = path.trim();
  if (!cleanPath) return "";

  if (cleanPath.startsWith("/admin")) return cleanPath;
  if (cleanPath.startsWith("admin/")) return `/${cleanPath}`;
  if (cleanPath.startsWith("/")) return cleanPath;

  return `/admin/${cleanPath}`;
};

export const parsePageAccess = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return [
      ...new Set(
        value
          .flatMap((item) =>
            typeof item === "object"
              ? parsePageAccess(item)
              : normalizeAdminPath(item)
          )
          .filter(Boolean)
      ),
    ];
  }

  if (typeof value === "object") {
    return parsePageAccess(value.pages || value.paths || Object.values(value));
  }

  if (typeof value !== "string") return [];

  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    return parsePageAccess(JSON.parse(trimmed));
  } catch (err) {
    return [
      ...new Set(
        trimmed
          .split(",")
          .map(normalizeAdminPath)
          .filter(Boolean)
      ),
    ];
  }
};

export const getUserAdditionalPages = (user = {}) => {
  const apiPages = parsePageAccess(
    user.additionalPages ||
      user.additional_pages ||
      user.extra_pages ||
      user.pageAccess ||
      user.page_access ||
      user.allowed_pages
  );

  if (apiPages.length > 0) return apiPages;

  return getLocalAdditionalPagesForUser(user.user_id || user.userId);
};

export const getStoredAdditionalPages = () => {
  return parsePageAccess(localStorage.getItem("additionalPages"));
};

export const serializePageAccess = (pages) => {
  return JSON.stringify(parsePageAccess(pages));
};

export const getLocalPageAssignments = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_PAGE_ASSIGNMENTS_KEY)) || {};
  } catch (err) {
    return {};
  }
};

export const getLocalAdditionalPagesForUser = (userId) => {
  if (!userId) return [];
  return parsePageAccess(getLocalPageAssignments()[userId]);
};

export const saveLocalAdditionalPagesForUser = (userId, pages) => {
  if (!userId) return;

  const assignments = getLocalPageAssignments();
  assignments[userId] = parsePageAccess(pages);
  localStorage.setItem(LOCAL_PAGE_ASSIGNMENTS_KEY, JSON.stringify(assignments));
};

export const isAdditionalPageAllowed = (pages, currentPath) => {
  const path = normalizeAdminPath(currentPath);
  const allowedPages = parsePageAccess(pages);

  return allowedPages.some((allowedPath) => {
    const relatedPaths = RELATED_PAGE_PATHS[allowedPath] || [];
    return [allowedPath, ...relatedPaths].some((pagePath) =>
      path.startsWith(pagePath)
    );
  });
};
