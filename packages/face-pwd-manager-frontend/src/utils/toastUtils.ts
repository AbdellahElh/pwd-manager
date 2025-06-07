import toast, { ToastOptions } from "react-hot-toast";

// Default toast style
const defaultToastStyle: ToastOptions = {
  position: "bottom-right",
  style: {
    background: "#333",
    color: "#fff",
    border: "1px solid #484848",
  },
  iconTheme: {
    primary: "#0ff",
    secondary: "#000",
  },
};

/**
 * Shows a success toast notification with consistent styling
 * @param message The message to display in the toast
 * @param options Additional toast options to override defaults
 */
export const showSuccessToast = (
  message: string,
  options?: Partial<ToastOptions>
): string => {
  return toast.success(message, { ...defaultToastStyle, ...options });
};

/**
 * Shows an error toast notification with consistent styling
 * @param message The message to display in the toast
 * @param options Additional toast options to override defaults
 */
export const showErrorToast = (
  message: string,
  options?: Partial<ToastOptions>
): string => {
  return toast.error(message, { ...defaultToastStyle, ...options });
};

/**
 * Shows an info toast notification with consistent styling
 * @param message The message to display in the toast
 * @param options Additional toast options to override defaults
 */
export const showInfoToast = (
  message: string,
  options?: Partial<ToastOptions>
): string => {
  return toast(message, { ...defaultToastStyle, ...options });
};

/**
 * Dismisses a toast by its ID
 * @param toastId The ID of the toast to dismiss
 */
export const dismissToast = (toastId: string): void => {
  toast.dismiss(toastId);
};
