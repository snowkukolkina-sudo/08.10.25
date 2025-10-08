import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#0b5c3b', // DANDY Green
    accent: '#ffd24d', // DANDY Yellow
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#333333',
    placeholder: '#999999',
    disabled: '#cccccc',
    error: '#ff4444',
    success: '#00aa00',
    warning: '#ff8800',
    info: '#0088ff',
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
  },
  roundness: 8,
};
