import { toast, type ToastType } from 'vue3-toastify';

export default function useToast() {
  const makeToast = (message: string, type: ToastType | string = 'success', config = {}) => {
    toast(message, {
      type: (typeof type === 'string'
        ? type === 'danger'
          ? 'error'
          : type
        : 'success') as ToastType,
      position: 'top-right',
      autoClose: ['error', 'warning'].includes(type) ? 6000 : 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      theme: 'colored',
      icon: true,
      ...config,
    });
  };
  return makeToast;
}
