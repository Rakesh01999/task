'use client';

import { Provider } from 'react-redux';
import { store } from '../store/store';
import Toast from '../components/Common/Toast';
import SessionRestorer from '../components/Auth/SessionRestorer';

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <SessionRestorer>
        {children}
      </SessionRestorer>
      <Toast />
    </Provider>
  );
}
