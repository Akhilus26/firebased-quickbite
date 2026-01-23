import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Alert, Pressable, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { router } from 'expo-router';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

const db = getFirestore();
const ORANGE = '#f97316';

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const role = useAuthStore((s) => s.role);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setNewPhone(data.phoneNumber || '');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhone = async () => {
    if (!/^\d{10}$/.test(newPhone)) {
      Alert.alert('Invalid Phone', 'Please enter a 10-digit phone number.');
      return;
    }

    try {
      setUpdating(true);
      await updateDoc(doc(db, 'users', user!.uid), {
        phoneNumber: newPhone
      });
      setUserData({ ...userData, phoneNumber: newPhone });
      setIsEditingPhone(false);
      Alert.alert('Success', 'Phone number updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update phone number.');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../../design/background image.jpeg')}
      style={styles.container}
      blurRadius={10}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={60} color={ORANGE} />
          </View>
          <Text style={styles.userName}>{(role === 'owner' || userData?.userType === 'owner' || user?.email === 'akhilus321@gmail.com') ? 'Canteen Owner' : (userData?.displayName || 'User')}</Text>
          <Text style={styles.userRoleText}>Logged in as: {(role === 'owner' || userData?.userType === 'owner' || user?.email === 'akhilus321@gmail.com') ? 'Canteen Owner' : (userData?.displayName || 'User')}</Text>
        </View>

        {(role === 'owner' || userData?.userType === 'owner' || user?.email === 'akhilus321@gmail.com') && (
          <Pressable
            style={styles.adminDashboardButton}
            onPress={() => router.push('/(owner)' as any)}
          >
            <Ionicons name="settings" size={24} color="#fff" />
            <Text style={styles.adminDashboardText}>Go to Owner Dashboard</Text>
          </Pressable>
        )}

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{userData?.email}</Text>
            </View>
            <Ionicons name="mail-outline" size={24} color="#9ca3af" />
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              {isEditingPhone ? (
                <TextInput
                  style={styles.phoneInput}
                  value={newPhone}
                  onChangeText={setNewPhone}
                  keyboardType="number-pad"
                  maxLength={10}
                  autoFocus
                />
              ) : (
                <Text style={styles.infoValue}>{userData?.phoneNumber || 'Not provided'}</Text>
              )}
            </View>
            <Pressable
              onPress={() => isEditingPhone ? handleUpdatePhone() : setIsEditingPhone(true)}
              style={styles.editButton}
            >
              {updating ? (
                <ActivityIndicator size="small" color={ORANGE} />
              ) : (
                <Ionicons
                  name={isEditingPhone ? "checkmark-circle" : "create-outline"}
                  size={24}
                  color={ORANGE}
                />
              )}
            </Pressable>
            {isEditingPhone && (
              <Pressable onPress={() => { setIsEditingPhone(false); setNewPhone(userData.phoneNumber); }} style={{ marginLeft: 10 }}>
                <Ionicons name="close-circle-outline" size={24} color="#ef4444" />
              </Pressable>
            )}
          </View>

          {userData?.userType && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View>
                  <Text style={styles.infoLabel}>User Type</Text>
                  <Text style={[styles.infoValue, { textTransform: 'capitalize' }]}>{userData.userType}</Text>
                </View>
                <Ionicons name="people-outline" size={24} color="#9ca3af" />
              </View>
            </>
          )}



          {userData?.admissionNumber && (
            <>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <View>
                  <Text style={styles.infoLabel}>Admission Number</Text>
                  <Text style={styles.infoValue}>{userData.admissionNumber}</Text>
                </View>
                <Ionicons name="school-outline" size={24} color="#9ca3af" />
              </View>
            </>
          )}
        </View>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 5,
  },
  userRoleText: {
    fontSize: 16,
    color: '#f3f4f6',
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 24,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '700',
  },
  phoneInput: {
    fontSize: 16,
    color: ORANGE,
    fontWeight: '700',
    borderBottomWidth: 1,
    borderBottomColor: ORANGE,
    paddingVertical: 2,
    minWidth: 150,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 4,
  },
  editButton: {
    padding: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 30,
    shadowColor: '#ef4444',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  logoutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  adminDashboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  adminDashboardText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  }
});
