import { post, setAuthToken } from "../data/apiClient";

export interface User {
  id: number;
  email: string;
  token?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  selfie?: Blob;
}

export const authService = {
  /**
   * Login with email and face recognition
   * @param email User email
   * @param selfie User selfie blob
   */
  async loginWithFace(email: string, selfie?: Blob): Promise<User> {
    const formData = new FormData();
    formData.append("email", email);

    if (selfie) {
      formData.append("selfie", selfie, "selfie.jpg");
    }

    const response = await post<FormData, LoginResponse>(
      "/users/login",
      formData
    );
    // Save user to local storage
    const user = {
      ...response.user,
      token: response.token,
    };

    // Set the auth token for API requests
    setAuthToken(response.token);

    localStorage.setItem("user", JSON.stringify(user));
    return user;
  },

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    const user = localStorage.getItem("user");
    return !!user;
  },
  /**
   * Get current user from local storage
   */
  getCurrentUser(): User | null {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        // Set the auth token if it exists
        if (user && user.token) {
          setAuthToken(user.token);
        }
        return user;
      } catch (e) {
        return null;
      }
    }
    return null;
  },
  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem("user");
    setAuthToken(null);
  },
};
