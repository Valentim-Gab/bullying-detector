import { Tabs } from 'expo-router'
import { TabBarIcon } from '@/components/navigation/TabBarIcon'
import { useTheme } from '@/hooks/useTheme'
import React from 'react'

export default function TabLayout() {
  const { colors } = useTheme()

  return (
    <Tabs
      safeAreaInsets={{ bottom: 8 }}
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
        tabBarLabelPosition: 'beside-icon',
        tabBarStyle: {
          backgroundColor: colors.backgroundSecondary,
          height: 72,
        },
        tabBarLabelStyle: {
          marginLeft: 16,
          fontSize: 16,
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
              size={24}
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
              size={24}
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
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  )
}
