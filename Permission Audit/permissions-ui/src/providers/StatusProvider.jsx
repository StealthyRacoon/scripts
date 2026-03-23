import { createContext, useContext, useEffect } from "react";
import { notification, Spin } from "antd";
import { setupInterceptors } from "../utils/api";

const StatusContext = createContext();

export function useStatus() {
  return useContext(StatusContext);
}

export function StatusProvider({ children }) {
  const [api, contextHolder] = notification.useNotification();

  const notify = {
    success: (title) =>
      api.success({ title, duration: 3, showProgress: true }),

    error: (title) =>
      api.error({ title, duration: 4, showProgress: true }),

    warning: (title) =>
      api.warning({ title, duration: 4, showProgress: true }),

    info: (title) =>
      api.info({ title, duration: 3, showProgress: true }),

    loading: (title) =>
      api.open({
        title: title,
        icon: <Spin size="small" />,
        duration: 0,
      }),
  };

  // ✅ Initialize interceptors ONCE
  useEffect(() => {
    setupInterceptors(notify);
  }, []);

  return (
    <StatusContext.Provider value={{ notify }}>
      {contextHolder}
      {children}
    </StatusContext.Provider>
  );
}