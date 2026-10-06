let session = null;

export const getSession = () => session;
export const setSession = (value) => {
  session = value;
};
export const clearSession = () => {
  session = null;
};
