/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const primary = '#8f3d38'
const primaryDark = '#8f3d38'

export const Colors = {
  light: {
    primary: primary,
    text: '#11181C',
    background: '#fff',
    backgroundSecondary: '#fff',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: primary,
  },
  dark: {
    primary: primaryDark,
    text: '#ECEDEE',
    background: '#151718',
    backgroundSecondary: '#111',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: primaryDark,
  },
  positive: '#2e7d32',
  negative: '#c62828',
  warning: '#f57f17',
}
