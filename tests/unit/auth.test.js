import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { login, logout, register } from '../../src/services/authService';
import ReactNativePersistenceStorage from '../../src/services/reactNativePersistenceStorage';

const mockCreateUserWithEmailAndPassword = jest.fn();
const mockSignInWithEmailAndPassword = jest.fn();
const mockSignOut = jest.fn();
const mockAuth = {
  currentUser: null,
};

jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: (...args) => mockCreateUserWithEmailAndPassword(...args),
  signInWithEmailAndPassword: (...args) => mockSignInWithEmailAndPassword(...args),
  signOut: (...args) => mockSignOut(...args),
}));

jest.mock('../../src/services/firebase', () => ({
  auth: mockAuth,
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const AUTH_TOKEN_KEY = '@mineshield_auth_token';

const persistToken = async (token) => ReactNativePersistenceStorage.setItem(AUTH_TOKEN_KEY, token);
const readToken = async () => ReactNativePersistenceStorage.getItem(AUTH_TOKEN_KEY);
const clearToken = async () => ReactNativePersistenceStorage.removeItem(AUTH_TOKEN_KEY);

function AuthHarness() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [storedToken, setStoredToken] = useState('');

  const handleLogin = async () => {
    setStatus('loading');
    setMessage('');

    try {
      const credential = await login(email, password);
      mockAuth.currentUser = credential.user || null;

      const token = await credential.user?.getIdToken?.(true);
      if (token) {
        await persistToken(token);
        setStoredToken(token);
      }

      setStatus('signed-in');
      setMessage('login-success');
    } catch (error) {
      setStatus('error');
      setMessage(error?.code || error?.message || 'login-error');
    }
  };

  const handleRegister = async () => {
    setStatus('loading');
    setMessage('');

    try {
      const credential = await register(email, password);
      mockAuth.currentUser = credential.user || null;
      setStatus('registered');
      setMessage('register-success');
    } catch (error) {
      setStatus('error');
      setMessage(error?.code || error?.message || 'register-error');
    }
  };

  const handleLogout = async () => {
    setStatus('loading');
    setMessage('');

    try {
      await logout();
      mockAuth.currentUser = null;
      await clearToken();
      setStoredToken('');
      setStatus('logged-out');
      setMessage('logout-success');
    } catch (error) {
      setStatus('error');
      setMessage(error?.code || error?.message || 'logout-error');
    }
  };

  return (
    <View>
      <TextInput
        testID="email-input"
        placeholder="example@mineshield.com"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        testID="password-input"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable testID="login-button" onPress={handleLogin}>
        <Text>Login</Text>
      </Pressable>

      <Pressable testID="register-button" onPress={handleRegister}>
        <Text>Register</Text>
      </Pressable>

      <Pressable testID="logout-button" onPress={handleLogout}>
        <Text>Logout</Text>
      </Pressable>

      <Text testID="auth-status">{status}</Text>
      <Text testID="auth-message">{message}</Text>
      <Text testID="stored-token">{storedToken}</Text>
    </View>
  );
}

describe('authService', () => {
  let tokenStore;

  beforeEach(() => {
    tokenStore = new Map();
    jest.clearAllMocks();
    mockAuth.currentUser = null;

    AsyncStorage.getItem.mockImplementation(async (key) =>
      tokenStore.has(key) ? tokenStore.get(key) : null
    );
    AsyncStorage.setItem.mockImplementation(async (key, value) => {
      tokenStore.set(key, value);
      return null;
    });
    AsyncStorage.removeItem.mockImplementation(async (key) => {
      tokenStore.delete(key);
      return null;
    });
  });

  it('successful login with valid credentials', async () => {
    const getIdToken = jest.fn().mockResolvedValue('token-123');

    mockSignInWithEmailAndPassword.mockResolvedValueOnce({
      user: {
        uid: 'worker-1',
        email: 'worker@mineshield.com',
        getIdToken,
      },
    });

    const { getByTestId } = render(<AuthHarness />);

    fireEvent.changeText(getByTestId('email-input'), 'worker@mineshield.com');
    fireEvent.changeText(getByTestId('password-input'), 'Password123!');
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(getByTestId('auth-status').props.children).toBe('signed-in');
    });

    expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      'worker@mineshield.com',
      'Password123!'
    );
    expect(getIdToken).toHaveBeenCalledWith(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY, 'token-123');
    expect(getByTestId('stored-token').props.children).toBe('token-123');
  });

  it('failed login with invalid credentials', async () => {
    mockSignInWithEmailAndPassword.mockRejectedValueOnce({
      code: 'auth/invalid-credential',
      message: 'Invalid credentials',
    });

    const { getByTestId } = render(<AuthHarness />);

    fireEvent.changeText(getByTestId('email-input'), 'worker@mineshield.com');
    fireEvent.changeText(getByTestId('password-input'), 'wrong-password');
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(getByTestId('auth-status').props.children).toBe('error');
    });

    expect(getByTestId('auth-message').props.children).toBe('auth/invalid-credential');
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });

  it('registration with new user data', async () => {
    mockCreateUserWithEmailAndPassword.mockResolvedValueOnce({
      user: {
        uid: 'worker-2',
        email: 'new.worker@mineshield.com',
      },
    });

    const { getByTestId } = render(<AuthHarness />);

    fireEvent.changeText(getByTestId('email-input'), 'new.worker@mineshield.com');
    fireEvent.changeText(getByTestId('password-input'), 'Password123!');
    fireEvent.press(getByTestId('register-button'));

    await waitFor(() => {
      expect(getByTestId('auth-status').props.children).toBe('registered');
    });

    expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(
      mockAuth,
      'new.worker@mineshield.com',
      'Password123!'
    );
    expect(getByTestId('auth-message').props.children).toBe('register-success');
  });

  it('token storage and retrieval', async () => {
    await persistToken('persisted-token-abc');

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY, 'persisted-token-abc');
    expect(await readToken()).toBe('persisted-token-abc');

    await clearToken();
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
    expect(await readToken()).toBeNull();
  });

  it('logout clears session data', async () => {
    mockSignInWithEmailAndPassword.mockResolvedValueOnce({
      user: {
        uid: 'worker-3',
        email: 'worker@mineshield.com',
        getIdToken: jest.fn().mockResolvedValue('token-for-logout'),
      },
    });

    const { getByTestId } = render(<AuthHarness />);

    fireEvent.changeText(getByTestId('email-input'), 'worker@mineshield.com');
    fireEvent.changeText(getByTestId('password-input'), 'Password123!');
    fireEvent.press(getByTestId('login-button'));

    await waitFor(() => {
      expect(getByTestId('auth-status').props.children).toBe('signed-in');
    });

    fireEvent.press(getByTestId('logout-button'));

    await waitFor(() => {
      expect(getByTestId('auth-status').props.children).toBe('logged-out');
    });

    expect(mockSignOut).toHaveBeenCalledWith(mockAuth);
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(AUTH_TOKEN_KEY);
    expect(getByTestId('stored-token').props.children).toBe('');
    expect(await readToken()).toBeNull();
  });
});
