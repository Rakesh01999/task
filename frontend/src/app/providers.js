'use client';

import { Provider } from 'react-redux';
import { store } from '../store/store';
import Toast from '../components/Common/Toast';

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      {children}
      <Toast />
    </Provider>
  );
}
