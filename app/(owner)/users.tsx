import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ImageBackground, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllUsers, deleteUser } from '@/api/owner';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const COLORS = {
    bgOverlay: 'rgba(255,255,255,0.85)',
    glass: 'rgba(255,255,255,0.95)',
    text: '#111827',
    sub: '#6b7280',
    border: '#e5e7eb',
    blue: '#2563eb',
    red: '#ef4444',
    lightGrey: '#f3f4f6',
    white: '#ffffff'
};

export default function UserManagement() {
    const queryClient = useQueryClient();
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['owner:users'],
        queryFn: getAllUsers
    });

    const { mutate: removeUser } = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['owner:users'] });
            Alert.alert('Success', 'User deleted permanently.');
        },
        onError: () => {
            Alert.alert('Error', 'Failed to delete user.');
        }
    });

    const handleDelete = (uid: string, name: string) => {
        Alert.alert(
            'Delete User',
            `Are you sure you want to delete ${name} permanently? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => removeUser(uid) }
            ]
        );
    };

    const renderUser = ({ item }: any) => (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <View style={styles.avatar}>
                    <Ionicons name="person" size={24} color={COLORS.blue} />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>{item.displayName || 'Unknown'}</Text>
                    <Text style={styles.userDetail}>{item.phoneNumber || 'No Phone'}</Text>
                    <View style={styles.roleTag}>
                        <Text style={styles.roleText}>{String(item.userType || 'user').toUpperCase()}</Text>
                        {item.admissionNumber && <Text style={styles.idText}> • ID: {item.admissionNumber}</Text>}
                        {item.teacherId && <Text style={styles.idText}> • ID: {item.teacherId}</Text>}
                    </View>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.uid, item.displayName)} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={22} color={COLORS.red} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ImageBackground source={require('../../design/owner background.png')} style={styles.container} blurRadius={10}>
            <View style={styles.overlay}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>User Management</Text>
                </View>

                {isLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={COLORS.blue} />
                    </View>
                ) : (
                    <FlatList
                        data={users}
                        keyExtractor={(item) => item.uid}
                        renderItem={renderUser}
                        contentContainerStyle={styles.list}
                        ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
                    />
                )}
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    overlay: { flex: 1, backgroundColor: COLORS.bgOverlay },
    header: { flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    headerTitle: { fontSize: 24, fontWeight: '900', color: COLORS.text },
    list: { padding: 20, paddingBottom: 100 },
    userCard: { backgroundColor: COLORS.glass, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
    userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' },
    userName: { fontSize: 17, fontWeight: '800', color: COLORS.text },
    userDetail: { fontSize: 14, color: COLORS.sub, fontWeight: '600', marginTop: 2 },
    roleTag: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    roleText: { fontSize: 11, fontWeight: '900', color: COLORS.blue },
    idText: { fontSize: 11, fontWeight: '600', color: COLORS.sub },
    deleteBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { textAlign: 'center', marginTop: 40, color: COLORS.sub, fontWeight: '600' }
});
