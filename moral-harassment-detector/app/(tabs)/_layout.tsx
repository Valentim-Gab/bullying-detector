import { Tabs } from 'expo-router'
import { TabBarIcon } from '@/components/navigation/TabBarIcon'
import { Colors } from '@/constants/Colors'
import { useColorScheme } from 'nativewind'
import React from 'react'

export default function TabLayout() {
  const { colorScheme } = useColorScheme()

  return (
    <Tabs
      safeAreaInsets={{ bottom: 8 }}
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].primary,
        headerShown: false,
        tabBarLabelPosition: 'beside-icon',
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].backgroundSecondary,
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
        name="config/index"
        options={{
          title: 'Configurar',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? 'settings' : 'settings-outline'}
              color={color}
              size={24}
            />
          ),
        }}
      />
    </Tabs>
  )
}
