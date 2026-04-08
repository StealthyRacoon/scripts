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


// Message api instead of notification api
// import { createContext, useContext, useEffect } from "react";
// import { message, Spin } from "antd";
// import { setupInterceptors } from "../utils/api";

// const StatusContext = createContext();

// export function useStatus() {
//   return useContext(StatusContext);
// }

// export function StatusProvider({ children }) {
//   // useMessage hook to control context placement
//   const [api, contextHolder] = message.useMessage();

//   // Drop-in compatible notify object
//   const notify = {
//     success: (title) => api.success({ content: title, duration: 3 }),
//     error: (title) => api.error({ content: title, duration: 4 }),
//     warning: (title) => api.warning({ content: title, duration: 4 }),
//     info: (title) => api.info({ content: title, duration: 3 }),
//     loading: (title) =>
//       api.open({
//         content: title,
//         icon: <Spin size="small" />,
//         duration: 0,
//       }),
//   };

//   // Initialize interceptors ONCE
//   useEffect(() => {
//     setupInterceptors(notify);
//   }, []);

//   return (
//     <StatusContext.Provider value={{ notify }}>
//       {contextHolder}
//       {children}
//     </StatusContext.Provider>
//   );
// }