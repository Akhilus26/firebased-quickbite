import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { router } from 'expo-router';
import { getFirestore, setDoc, doc } from 'firebase/firestore';
import { auth } from '@/config/firebase';
import { Ionicons } from '@expo/vector-icons';

const db = getFirestore();
const ORANGE = '#f97316';

type UserType = 'student' | 'teacher' | 'others';

export default function CompleteProfile() {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // Form States
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [teacherId, setTeacherId] = useState('');

  const validatePhone = (num: string) => {
    return /^\d{10}$/.test(num);
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Error', 'No user found. Please login again.');
      router.replace('/(auth)/login');
      return;
    }

    if (!userType) {
      Alert.alert('Required', 'Please select who you are.');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number.');
      return;
    }



    if (userType === 'student' && !/^\d{4}$/.test(admissionNumber)) {
      Alert.alert('Invalid Admission No.', 'Please enter a valid 4-digit admission number.');
      return;
    }

    if (userType === 'teacher' && !teacherId.trim()) {
      Alert.alert('Required', 'Please enter your Teacher ID.');
      return;
    }

    try {
      setLoading(true);

      // Check for unique phone number
      const { collection, query, where, getDocs } = require('firebase/firestore');
      const phoneQuery = query(collection(db, 'users'), where('phoneNumber', '==', phone));
      const phoneSnap = await getDocs(phoneQuery);

      let isPhoneTaken = false;
      phoneSnap.forEach((d: any) => {
        if (d.id !== user.uid) isPhoneTaken = true;
      });

      if (isPhoneTaken) {
        Alert.alert('Phone Number Taken', 'This phone number is already registered with another account.');
        setLoading(false);
        return;
      }

      // Check for unique admission number (Student only)
      if (userType === 'student' && admissionNumber) {
        const admissionQuery = query(collection(db, 'users'), where('admissionNumber', '==', admissionNumber));
        const admissionSnap = await getDocs(admissionQuery);

        let isAdmissionTaken = false;
        admissionSnap.forEach((d: any) => {
          if (d.id !== user.uid) isAdmissionTaken = true;
        });

        if (isAdmissionTaken) {
          Alert.alert('ID Already Taken', 'This Admission Number is already registered with another account.');
          setLoading(false);
          return;
        }
      }

      const userData: any = {
        uid: user.uid,
        email: user.email,
        displayName: name,
        phoneNumber: phone,
        role: 'user',
        userType: userType,
        createdAt: new Date().toISOString(),
      };


      if (userType === 'student') userData.admissionNumber = admissionNumber;
      if (userType === 'teacher') userData.teacherId = teacherId;

      await setDoc(doc(db, 'users', user.uid), userData);

      // Update local store
      useAuthStore.getState().setUser(user);
      // Force reload or navigation
      router.replace('/');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    router.replace('/(auth)/login');
    return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Pressable
          onPress={async () => {
            await logout();
            router.replace('/(auth)/login');
          }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text style={styles.title}>Complete Your Profile</Text>
        <Text style={styles.subtitle}>Please tell us a bit more about yourself</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>I am a...</Text>
        <View style={styles.typeContainer}>

          <TypeButton
            selected={userType === 'student'}
            onPress={() => setUserType('student')}
            label="Student"
            icon="school-outline"
          />
          <TypeButton
            selected={userType === 'teacher'}
            onPress={() => setUserType('teacher')}
            label="Teacher"
            icon="briefcase-outline"
          />
          <TypeButton
            selected={userType === 'others'}
            onPress={() => setUserType('others')}
            label="Others"
            icon="person-outline"
          />
        </View>

        {userType && (
          <View style={styles.form}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
              />
            </View>

            <Text style={styles.inputLabel}>Phone Number (10 digits)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={20} color="#6b7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="9876543210"
                keyboardType="number-pad"
                maxLength={10}
              />
            </View>



            {userType === 'student' && (
              <>
                <Text style={styles.inputLabel}>Admission Number</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="document-text-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={admissionNumber}
                    onChangeText={setAdmissionNumber}
                    placeholder="Enter Admission No."
                  />
                </View>
              </>
            )}

            {userType === 'teacher' && (
              <>
                <Text style={styles.inputLabel}>Teacher ID</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="card-outline" size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={teacherId}
                    onChangeText={setTeacherId}
                    placeholder="Enter Teacher ID"
                  />
                </View>
              </>
            )}

            <Pressable
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Save & Continue</Text>
              )}
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const TypeButton = ({ selected, onPress, label, icon }: { selected: boolean; onPress: () => void; label: string; icon: any }) => (
  <Pressable
    style={[styles.typeButton, selected && styles.typeButtonSelected]}
    onPress={onPress}
  >
    <Ionicons name={icon} size={24} color={selected ? '#fff' : '#666'} />
    <Text style={[styles.typeText, selected && styles.typeTextSelected]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
  },
  header: {
    marginBottom: 30,
    position: 'relative',
    paddingTop: 10,
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#111827',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    color: '#374151',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  typeButtonSelected: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
    shadowColor: ORANGE,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  typeText: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
  },
  typeTextSelected: {
    color: '#fff',
  },
  form: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    color: '#4b5563',
    marginTop: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  submitButton: {
    backgroundColor: ORANGE,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: ORANGE,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
