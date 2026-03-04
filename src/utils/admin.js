export const ADMIN_EMAIL = 'advdeepakkumar26@gmail.com';

export const isAdminEmail = (email) => {
  if (!email) return false;
  return String(email).trim().toLowerCase() === String(ADMIN_EMAIL).trim().toLowerCase();
};
