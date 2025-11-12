// Root layout with providers
import { Slot, useRouter, useSegments } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/providers/AuthProvider'
import { ThemeProvider } from '@/theme'
import { useAuthStore } from '@/store/useAuthStore'
import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'

const queryClient = new QueryClient()

function RootLayoutNav() {
  const segments = useSegments()
  const router = useRouter()
  const { session, loading } = useAuthStore()

  useEffect(() => {
    if (loading) return

    const inAuthGroup = segments[0] === '(auth)'

    if (!session && !inAuthGroup) {
      // Redirect to sign in
      router.replace('/sign-in')
    } else if (session && inAuthGroup) {
      // Redirect to app
      router.replace('/(tabs)')
    }
  }, [session, loading, segments])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return <Slot />
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
