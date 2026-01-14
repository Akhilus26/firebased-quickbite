import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View, FlatList } from 'react-native';

export type Option<T extends string> = { label: string; value: T };

export function Dropdown<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const selected = options.find((o) => o.value === value)?.label ?? '';

  return (
    <View style={{ flex: 1 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable onPress={() => setOpen(true)} style={({pressed}) => [styles.box, pressed && { opacity: 0.9 }]}>
        <Text style={styles.boxText}>{selected}</Text>
        <Text style={styles.chev}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <FlatList
              data={options}
              keyExtractor={(o) => o.value}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => { onChange(item.value); setOpen(false); }}
                  style={({pressed}) => [styles.item, pressed && { backgroundColor: '#fff7ed' }]}
                >
                  <Text style={styles.itemText}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const ORANGE = '#f97316';

const styles = StyleSheet.create({
  label: { marginBottom: 6, color: '#374151', fontWeight: '600' },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fde68a',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  boxText: { color: '#111827', fontWeight: '600' },
  chev: { color: ORANGE, fontSize: 16, marginLeft: 8 },
  backdrop: { flex: 1, backgroundColor: '#00000055', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
  },
  sep: { height: 8 },
  item: { padding: 14, borderRadius: 10, backgroundColor: '#fff' },
  itemText: { color: '#111827', fontWeight: '600' },
});
