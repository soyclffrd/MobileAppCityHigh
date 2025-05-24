import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

interface AdminSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const AdminSidebar = ({ isCollapsed, toggleSidebar }: AdminSidebarProps) => {
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigateTo = (route: string) => {
    router.push(route as any);
    if (!isCollapsed) toggleSidebar();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await logout();
              router.replace('/login');
              if (!isCollapsed) toggleSidebar();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={[styles.sidebar, isCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded]}>
      <TouchableOpacity onPress={toggleSidebar} style={styles.toggleButton}>
        <Text style={styles.toggleButtonText}>{isCollapsed ? '>' : '<'}</Text>
      </TouchableOpacity>

      {!isCollapsed && (
        <View style={styles.sidebarContent}>
          <View style={styles.schoolInfo}>
            <Image
              source={require('../../assets/images/logosacityhigh.png')}
              style={styles.schoolLogo}
            />
            <Text style={styles.schoolName}>Surigao City NHS</Text>
          </View>

          <View style={styles.menu}>
            {[
              { icon: '🏠', text: 'Dashboard', route: '/admin/dashboardoverview' },
              { icon: '👨‍🏫', text: 'Teachers', route: '/admin/teachers' },
              { icon: '🎓', text: 'Students', route: '/admin/students' },
              { icon: '📚', text: 'Subjects', route: '/admin/subjects' },
              { icon: '📊', text: 'Strands', route: '/admin/strands' },
              { icon: '📈', text: 'Grades Level', route: '/admin/gradelevels' },
              { icon: '🗂️', text: 'Section', route: '/admin/section' },
              { icon: '👤', text: 'Users', route: '/admin/users' },
              { icon: '⚙️', text: 'Settings', route: '/admin/settings' },
            ].map(({ icon, text, route }) => (
              <TouchableOpacity key={text} style={styles.menuItem} onPress={() => navigateTo(route)}>
                <Text style={styles.menuIcon}>{icon}</Text>
                <Text style={styles.menuText}>{text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {isCollapsed && (
        <View style={styles.collapsedMenu}>
          {[
            '🏠', '👨‍🏫', '🎓', '📚', '📊', '📈', '🗂️', '👤', '⚙️',
          ].map((icon, index) => (
            <TouchableOpacity
              key={icon}
              style={styles.collapsedMenuItem}
              onPress={() => navigateTo([
                '/admin/dashboardoverview',
                '/admin/teachers',
                '/admin/students',
                '/admin/subjects',
                '/admin/strands',
                '/admin/gradelevels',
                '/admin/section',
                '/admin/users',
                '/admin/settings',
              ][index])}
            >
              <Text style={styles.menuIcon}>{icon}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.logoutButton, isCollapsed ? styles.collapsedLogoutButton : null, isLoggingOut && styles.logoutButtonDisabled]}
        onPress={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <ActivityIndicator color="#FF3B30" />
        ) : (
          <View style={styles.logoutContent}>
            <MaterialIcons name="logout" size={24} color="#FF3B30" />
            {!isCollapsed && <Text style={styles.logoutText}>Logout</Text>}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 20,
    borderRightWidth: 1,
    borderColor: '#ddd',
    position: 'relative',
    height: '100%',
  },
  sidebarExpanded: {
    width: 200,
  },
  sidebarCollapsed: {
    width: 60,
    alignItems: 'center',
  },
  toggleButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 1,
  },
  toggleButtonText: {
    fontSize: 18,
  },
  sidebarContent: {
    paddingHorizontal: 10,
  },
  schoolInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  schoolLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
  },
  schoolName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  menu: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginBottom: 5,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  menuText: {
    fontSize: 16,
  },
  collapsedMenu: {
    marginTop: 20,
    alignItems: 'center',
  },
  collapsedMenuItem: {
    paddingVertical: 10,
    marginBottom: 5,
  },
  logoutButton: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  collapsedLogoutButton: {
    left: 0,
    right: 0,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    elevation: 0,
  },
  logoutButtonDisabled: {
    opacity: 0.7,
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    marginLeft: 8,
  },
});

export default AdminSidebar;
