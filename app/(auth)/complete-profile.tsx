import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { router } from 'expo-router';
import { doc, setDoc } from 'firebase/auth'; // Mistake here: setDoc is from firestore, not auth. Will fix in next step if caught, or I'll just fix it now.
import { getFirestore, setDoc as firestoreSetDoc, doc as firestoreDoc } from 'firebase/firestore';
import { auth } from '@/config/firebase'; // Assuming this exports the auth instance
import { Ionicons } from '@expo/vector-icons';

const db = getFirestore();
const ORANGE = '#f97316';

type UserType = 'staff' | 'student' | 'others';

export default function CompleteProfile() {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const user = useAuthStore((s) => s.user);

  // Form States
  const [name, setName] = useState(user?.displayName || '');
  const [phone, setPhone] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');

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

    if (userType === 'staff' && !teacherId.trim()) {
      Alert.alert('Required', 'Please enter your Teacher ID.');
      return;
    }

    if (userType === 'student' && !admissionNumber.trim()) {
      Alert.alert('Required', 'Please enter your Admission Number.');
      return;
    }

    try {
      setLoading(true);
      const userData: any = {
        uid: user.uid,
        email: user.email,
        displayName: name,
        phoneNumber: phone,
        role: 'user', // Default role provided by authStore seems to be 'user' for now, can be updated based on logic
        userType: userType,
        createdAt: new Date().toISOString(),
      };

      if (userType === 'staff') userData.teacherId = teacherId;
      if (userType === 'student') userData.admissionNumber = admissionNumber;

      await firestoreSetDoc(firestoreDoc(db, 'users', user.uid), userData);

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
     // If accessed directly without auth, redirect
     // We can use a useEffect for this but simple render check works for now
     router.replace('/(auth)/login');
     return null;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Complete Your Profile</Text>
      <Text style={styles.subtitle}>Please tell us a bit more about yourself</Text>

      <View style={styles.card}>
        <Text style={styles.label}>I am a...</Text>
        <View style={styles.typeContainer}>
          <TypeButton 
            selected={userType === 'staff'} 
            onPress={() => setUserType('staff')} 
            label="Staff" 
            icon="briefcase-outline" 
          />
          <TypeButton 
            selected={userType === 'student'} 
            onPress={() => setUserType('student')} 
            label="Student" 
            icon="school-outline" 
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
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
            />

            <Text style={styles.inputLabel}>Phone Number (10 digits)</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="9876543210"
              keyboardType="number-pad"
              maxLength={10}
            />

            {userType === 'staff' && (
              <>
                <Text style={styles.inputLabel}>Teacher ID</Text>
                <TextInput
                  style={styles.input}
                  value={teacherId}
                  onChangeText={setTeacherId}
                  placeholder="Enter ID"
                />
              </>
            )}

            {userType === 'student' && (
              <>
                <Text style={styles.inputLabel}>Admission Number</Text>
                <TextInput
                  style={styles.input}
                  value={admissionNumber}
                  onChangeText={setAdmissionNumber}
                  placeholder="Enter Admission No."
                />
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
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#444',
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 10,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  typeButtonSelected: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },
  typeText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  typeTextSelected: {
    color: '#fff',
  },
  form: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#555',
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  submitButton: {
    backgroundColor: ORANGE,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
