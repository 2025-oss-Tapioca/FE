export const validatePassword = (password) => {
  const regex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}:;"'<>,.?~\\/])[A-Za-z\d!@#$%^&*()_+\-={}:;"'<>,.?~\\/]{8,16}$/;
  return regex.test(password);
};
