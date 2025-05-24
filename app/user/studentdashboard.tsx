import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const StudentDashboard = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search subject..."
          placeholderTextColor="white"
        />
        <View style={styles.icons}>
          <Text style={styles.icon}>&#x1F514;<sup>3</sup></Text>
          <Text style={styles.icon}>&#x2192;</Text>
        </View>
      </View>

      <View style={styles.greeting}>
        <Text style={styles.greetingTitle}>Good Evening, Alex!</Text>
        <Text style={styles.greetingText}>Welcome to your student dashboard</Text>
      </View>

      <View style={styles.summaryCards}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Subjects Enrolled</Text>
          <Text style={styles.cardValue}>4</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Current Grade</Text>
          <Text style={styles.cardValue}>Grade 10</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={styles.activeTabText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Classes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Grades</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.profileInfoRow}>
            <Image
                source={{ uri: 'https://via.placeholder.com/100' }}
                style={styles.profileImage}
            />
            <View style={styles.profileTextInfo}>
                <Text style={styles.infoValue}>Alex Chen</Text>
                <Text style={styles.infoValue}>alex chen@student edu</Text>
                <Text style={styles.infoValue}>Gender: Male</Text>
                <Text style={styles.infoValue}>Birthplace: San Francisco, CA</Text>
            </View>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Grade:</Text>
          <Text style={styles.infoValue}>Grade 10</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Section:</Text>
          <Text style={styles.infoValue}>Section A</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Student ID:</Text>
          <Text style={styles.infoValue}>STU001</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Enrollment Date:</Text>
          <Text style={styles.infoValue}>2023-06-15</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Last Login:</Text>
          <Text style={styles.infoValue}>2025-04-01 03:45 PM</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text style={[styles.infoValue, { color: 'green' }]}>Active</Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.button}>
            <Text>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text>Change Password</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Guardian Information</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>Wei Chen</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Contact:</Text>
          <Text style={styles.infoValue}>+1-555-123-4567</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Relationship:</Text>
          <Text style={styles.infoValue}>Father</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  header: {
    backgroundColor: '#4285f4',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchInput: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 5,
    flexGrow: 1,
    marginRight: 10,
    color: 'black',
  },
  icons: {
    flexDirection: 'row',
    gap: 15,
  },
  icon: {
    color: 'white',
    fontSize: 20,
  },
  greeting: {
    padding: 15,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  greetingText: {
    fontSize: 16,
    color: '#555',
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 14,
    color: '#555',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4285f4',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  activeTab: {
    borderColor: '#4285f4',
  },
  tabText: {
    fontSize: 16,
    color: '#555',
  },
  activeTabText: {
    fontSize: 16,
    color: '#4285f4',
  },
  profileSection: {
    backgroundColor: 'white',
    padding: 15,
    margin: 5,
    borderRadius: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  profileInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
  },
  profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginRight: 15,
  },
  profileTextInfo: {
      flex: 1,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  infoLabel: {
    fontWeight: 'bold',
    marginRight: 10,
  },
  infoValue: {
    flexShrink: 1,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  button: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#eee',
    borderRadius: 5,
  },
});

export default StudentDashboard; 