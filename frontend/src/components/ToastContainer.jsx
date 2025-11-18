import React, { useCallback, useMemo, useState } from 'react';
import Toast from './Toast';
import ToastContext from './ToastContext';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).slice(2,8);
    setToasts((t) => [...t, { id, message, type, duration }]);
    return id;
  }, []);

  const remove = useCallback((id) => {
    setToasts((t) => t.filter(x => x.id !== id));
  }, []);

  const value = useMemo(() => ({ toast: add, remove }), [add, remove]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 items-end">
        {toasts.map(t => (
          <Toast key={t.id} id={t.id} message={t.message} type={t.type} duration={t.duration} onClose={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
export default ToastProvider;
