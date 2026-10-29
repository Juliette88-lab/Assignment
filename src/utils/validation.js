export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPassword = (password) => {
  return typeof password === "string" && password.length >= 8;
};

export const isValidName = (name) => {
  return typeof name === "string" && name.trim().length >= 2;
};
