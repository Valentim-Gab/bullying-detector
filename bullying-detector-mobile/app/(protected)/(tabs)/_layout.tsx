import { Tabs } from 'expo-router'
import { TabBarIcon } from '@/components/navigation/TabBarIcon'
import { useTheme } from '@/hooks/useTheme'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export default function TabLayout() {
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarLabelPosition: 'beside-icon',
        tabBarStyle: {
          backgroundColor: colors.backgroundSecondary,
          height: 72 + insets.bottom / 2,
          paddingTop: 8,
          paddingLeft: 12,
          paddingRight: 12,
          paddingBottom: insets.bottom + 8,
        },
        tabBarLabelStyle: {
          marginLeft: 16,
          fontSize: 14,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'home' : 'home-outline'}
              color={color}
              size={20}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: 'Gravar',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'recording' : 'recording-outline'}
              color={color}
              size={20}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="avaliation"
        options={{
          title: 'UFSM',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'school' : 'school-outline'}
              color={color}
              size={20}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'person' : 'person-outline'}
              color={color}
              size={20}
            />
          ),
        }}
      />
    </Tabs>
  )
}
