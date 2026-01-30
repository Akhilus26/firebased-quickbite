import React from 'react';
import { View, Text, StyleSheet, ScrollView, ImageBackground, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getReports } from '@/api/owner';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const COLORS = {
    bgOverlay: 'rgba(255,255,255,0.85)',
    glass: 'rgba(255,255,255,0.95)',
    text: '#111827',
    sub: '#6b7280',
    border: '#e5e7eb',
    blue: '#2563eb',
    green: '#16a34a',
    accent: '#f97316',
    white: '#ffffff',
    lightGrey: '#f3f4f6'
};

export default function ReportsScreen() {
    const { data: reports, isLoading } = useQuery({
        queryKey: ['owner:reports'],
        queryFn: getReports
    });

    if (isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.blue} />
            </View>
        );
    }

    const StatCard = ({ label, value, sub, icon, color }: any) => (
        <View style={styles.statCard}>
            <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={styles.statValue}>{value}</Text>
                {sub && <Text style={styles.statSub}>{sub}</Text>}
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
                    <Text style={styles.headerTitle}>Analytics</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.sectionTitle}>Order Statistics</Text>
                    <View style={styles.statsRow}>
                        <StatCard label="Today" value={reports?.orders.today} icon="cart-outline" color={COLORS.blue} />
                        <StatCard label="This Week" value={reports?.orders.week} icon="calendar-outline" color={COLORS.accent} />
                    </View>
                    <View style={styles.statsRow}>
                        <StatCard label="This Month" value={reports?.orders.month} icon="bar-chart-outline" color={COLORS.green} />
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Revenue Statistics</Text>
                    <View style={styles.statsRow}>
                        <StatCard label="Today's Revenue" value={`₹${reports?.revenue.today}`} icon="cash-outline" color={COLORS.green} />
                        <StatCard label="Monthly Revenue" value={`₹${reports?.revenue.month}`} icon="wallet-outline" color={COLORS.blue} />
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Top Selling Items</Text>
                    <View style={styles.card}>
                        {reports?.topSelling.map((item: any, i: number) => (
                            <View key={i} style={[styles.listItem, i === reports.topSelling.length - 1 && { borderBottomWidth: 0 }]}>
                                <Text style={styles.listText}>{item.name}</Text>
                                <Text style={styles.listValue}>{item.qty} sold</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Category-wise Sales</Text>
                    <View style={styles.card}>
                        {reports?.categorySales.map((item: any, i: number) => (
                            <View key={i} style={[styles.listItem, i === reports.categorySales.length - 1 && { borderBottomWidth: 0 }]}>
                                <Text style={styles.listText}>{item.name}</Text>
                                <Text style={styles.listValue}>{item.count} items</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Peak Order Time</Text>
                    <View style={styles.card}>
                        <View style={[styles.listItem, { borderBottomWidth: 0 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Ionicons name="time-outline" size={20} color={COLORS.accent} />
                                <Text style={styles.listText}>Frequency peaks at</Text>
                            </View>
                            <Text style={[styles.listValue, { color: COLORS.accent }]}>{reports?.peakTimeRange}</Text>
                        </View>
                    </View>
                </ScrollView>
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
    scrollContent: { padding: 20, paddingBottom: 100 },
    sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.sub, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    statCard: { flex: 1, backgroundColor: COLORS.glass, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: COLORS.border },
    iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    statLabel: { fontSize: 12, fontWeight: '700', color: COLORS.sub },
    statValue: { fontSize: 20, fontWeight: '900', color: COLORS.text },
    statSub: { fontSize: 11, color: COLORS.sub, marginTop: 2 },
    card: { backgroundColor: COLORS.glass, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: COLORS.border },
    listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    listText: { fontSize: 16, fontWeight: '700', color: COLORS.text },
    listValue: { fontSize: 15, fontWeight: '800', color: COLORS.blue },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bgOverlay }
});
