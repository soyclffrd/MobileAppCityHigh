import { Redirect, Slot, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import AdminSidebar from '../components/AdminSidebar';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, isLoading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  useEffect(() => {
    if (!isSidebarCollapsed) {
      setIsSidebarCollapsed(true);
    }
  }, [pathname]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      <AdminSidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      <TouchableWithoutFeedback onPress={() => {
        if (!isSidebarCollapsed) {
          setIsSidebarCollapsed(true);
          Keyboard.dismiss();
        }
      }} accessible={false}>
        <View style={styles.mainContent}>
          <Slot />
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
  },
}); 