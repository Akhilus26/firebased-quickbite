import React, { useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { CartLine } from '@/stores/cartStore';

export function CartItem({ line, onInc, onDec }: { line: CartLine; onInc: () => void; onDec: () => void }) {
  const fade = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(fade, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  }, [fade]);

  return (
    <Animated.View style={[styles.card, { opacity: fade }]}> 
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{line.name}</Text>
        <Text style={styles.subtitle}>₹{line.price} each</Text>
      </View>
      <View style={styles.qtyWrap}>
        <Pressable onPress={onDec} style={[styles.qtyBtn, { backgroundColor: '#f3f4f6' }]}><Text style={styles.qtyBtnText}>−</Text></Pressable>
        <Text style={styles.qtyText}>{line.qty}</Text>
        <Pressable onPress={onInc} style={styles.qtyBtn}><Text style={[styles.qtyBtnText, { color: '#fff' }]}>＋</Text></Pressable>
      </View>
      <Text style={styles.amount}>₹{line.price * line.qty}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#f1f1f1',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginBottom: 10,
    gap: 10,
  },
  title: { fontWeight: '700', color: '#111827' },
  subtitle: { color: '#6b7280', marginTop: 2, fontSize: 12 },
  qtyWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { backgroundColor: '#111827', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  qtyBtnText: { fontSize: 14, fontWeight: '700' },
  qtyText: { minWidth: 18, textAlign: 'center', fontWeight: '600' },
  amount: { fontWeight: '700', color: '#111827' }
});
