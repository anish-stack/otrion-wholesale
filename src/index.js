import React, { useState } from "react";
import { LogBox } from 'react-native';
import { Provider } from 'react-redux';
import { NativeBaseProvider } from "native-base"
import AppNavigator from "./AppNavigator";
import store from './redux/store/store';
import ErrorBoundary from "./ErrorBoundary";

LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs()


App = () => {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <NativeBaseProvider>
          <AppNavigator />
        </NativeBaseProvider>
      </Provider>
    </ErrorBoundary>
  )
}

export default App
