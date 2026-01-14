import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMenu, toggleAvailability } from '@/api/owner';
import { OwnerHeader, OwnerTabBar, COLORS } from '@/components/OwnerUI';

export default function OwnerMenu() {
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ['owner:menu'], queryFn: getMenu });
  const { mutate } = useMutation({
    mutationFn: (id: number) => toggleAvailability(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['owner:menu'] }); }
  });

  const renderItem = ({ item }: any) => (
    <View style={styles.rowCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemSub}>₹{item.price} • {item.veg ? 'Veg' : 'Non-Veg'}</Text>
      </View>
      <TouchableOpacity onPress={() => mutate(item.id)} style={[styles.pillBtn, { backgroundColor: item.available ? COLORS.red : COLORS.green }]}>
        <Text style={styles.pillBtnText}>{item.available ? 'Mark OOS' : 'Mark Live'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground source={require('../../design/owner background.png')} style={{ flex: 1 }} blurRadius={10}>
      <View style={styles.overlay}>
        <OwnerHeader title="Menu" />
        <View style={{ padding: 16, paddingBottom: 100 }}>
          <FlatList
            data={data}
            keyExtractor={(i) => String(i.id)}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            ListEmptyComponent={<Text style={{ color: COLORS.sub, textAlign: 'center', marginTop: 20 }}>No items yet</Text>}
          />
        </View>
        <OwnerTabBar active="menu" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: COLORS.bgOverlay },
  rowCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.glass, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2,
    paddingHorizontal: 14, paddingVertical: 12,
  },
  itemName: { fontWeight: '800', color: COLORS.text },
  itemSub: { color: COLORS.sub, marginTop: 2 },
  pillBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999 },
  pillBtnText: { color: '#fff', fontWeight: '800' },
});
