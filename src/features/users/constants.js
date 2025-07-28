export const STAFF_STATUSES = [
  { name: "Junior Staff", code: "JS" },
  { name: "Senior Staff", code: "SS" },
  { name: "Parttime Staff", code: "PT" },
  { name: "Principal Officer", code: "PO" },
  { name: "Management Staff", code: "MO" },
];

export const ACCESS_MODES = {
  READ_ONLY: "readOnly",
  READ_WRITE: "readWrite",
};

export const VALIDATION_PATTERNS = {
  PHONE: /^(\+234|0)([7-9]{1})([0-9]{9})$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};
