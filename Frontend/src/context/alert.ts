import { createContext, useContext } from "react";

interface AlertMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

interface AlertContextType {
  showAlert: (type: AlertMessage["type"], message: string) => void;
  clearAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
};

export { AlertContext };
export type { AlertMessage, AlertContextType };
