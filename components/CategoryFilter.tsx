import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown, Option } from './Dropdown';

const categories = ['All','Snacks','Meals','Hot Beverages','Cold Beverages'] as const;

type VegFilter = 'All' | 'Veg' | 'Non-Veg';

export function CategoryFilter({
  active,
  onChange,
  vegFilter,
  onChangeVeg,
}: {
  active: (typeof categories)[number];
  onChange: (c: (typeof categories)[number]) => void;
  vegFilter: VegFilter;
  onChangeVeg: (v: VegFilter) => void;
}) {

  const categoryOptions: Option<(typeof categories)[number]>[] = categories.map((c) => ({ label: c, value: c }));
  const vegOptions: Option<VegFilter>[] = [
    { label: 'All', value: 'All' },
    { label: 'Veg', value: 'Veg' },
    { label: 'Non-Veg', value: 'Non-Veg' },
  ];

  return (
    <View style={styles.wrap}>
      <View style={{ flex: 1 }}>
        <Dropdown label="Category" value={active} options={categoryOptions} onChange={onChange} />
      </View>
      <View style={{ width: 12 }} />
      <View style={{ flex: 1 }}>
        <Dropdown label="Diet" value={vegFilter} options={vegOptions} onChange={onChangeVeg} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 12, paddingHorizontal: 12, paddingVertical: 8 },
});
