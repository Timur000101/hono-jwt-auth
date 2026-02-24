// Helper to create a Request object for the signup endpoint
export const signupReq = (
  email = "test@test.com",
  password = "password123"
) => {
  // Use http://localhost/api/signup as the URL. The host doesn't matter since we process it in-memory via app.request()
  return new Request(`${process.env.BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

// Helper to create a Request object for the login endpoint
export const loginReq = (email = "test@test.com", password = "password123") => {
  return new Request(`${process.env.BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });
};

// Helper to create a Request object for the logout endpoint
export const logoutReq = () => {
  return new Request(`${process.env.BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
};
