import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Switch, TouchableOpacity, Alert, ImageBackground, ScrollView, Image, Pressable, Platform, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { addMenuItem, updateMenuItem } from '@/api/menu';
import { OwnerHeader, COLORS } from '@/components/OwnerUI';
import { Ionicons } from '@expo/vector-icons';

export default function AddItem() {
  const params = useLocalSearchParams();
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [madeWith, setMadeWith] = useState('');
  const [price, setPrice] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState<'Snacks' | 'Meals' | 'Hot Beverages' | 'Cold Beverages'>('Snacks');
  const [counter, setCounter] = useState<'Snacks & Hot Beverages' | 'Meals' | 'Cold Beverages'>('Snacks & Hot Beverages');
  const [veg, setVeg] = useState(true);
  const [available, setAvailable] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (params.item) {
      try {
        const item = JSON.parse(params.item as string);
        setIsEdit(true);
        setEditId(item.id);
        setName(item.name || '');
        setDescription(item.description || '');
        setMadeWith(item.madeWith || '');
        setPrice(item.price ? String(item.price) : '');
        setCalories(item.calories ? String(item.calories) : '');
        setProtein(item.protein ? String(item.protein) : '');
        setPrepTime(item.prepTime ? String(item.prepTime) : '');
        setQuantity(item.quantity ? String(item.quantity) : '');
        setCategory(item.category || 'Snacks');
        setCounter(item.counter || 'Snacks & Hot Beverages');
        setVeg(item.veg ?? true);
        setAvailable(item.available ?? true);
        if (typeof item.image === 'string') {
          setImageUri(item.image);
        }
      } catch (e) {
        console.error("Failed to parse item for editing", e);
      }
    }
  }, [params.item]);

  const uploadToCloudinary = async (uri: string) => {
    try {
      const data = new FormData();
      const filename = uri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename || '');
      const type = match ? `image/${match[1]}` : `image`;

      // React Native FormData requires an object for files
      data.append('file', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: filename || 'upload.jpg',
        type,
      } as any);
      data.append('upload_preset', 'mlchklbu');
      data.append('cloud_name', 'dvaahhisn');
      data.append('api_key', '669284443773523');

      const response = await fetch('https://api.cloudinary.com/v1_1/dvaahhisn/image/upload', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      if (result.secure_url) {
        return result.secure_url;
      } else {
        throw new Error(result.error?.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    const p = Number(price);
    if (!name.trim() || !Number.isFinite(p) || p <= 0) {
      Alert.alert('Invalid Data', 'Please enter a valid name and price');
      return;
    }

    try {
      setIsUploading(true);
      let finalImageUrl = imageUri;

      // Check if imageUri is a local file that needs uploading
      if (imageUri && (imageUri.startsWith('file://') || imageUri.startsWith('content://'))) {
        finalImageUrl = await uploadToCloudinary(imageUri);
      }

      const itemData = {
        name: name.trim(),
        description: description.trim(),
        madeWith: madeWith.trim(),
        price: Math.floor(p),
        calories: calories ? Number(calories) : undefined,
        protein: protein ? Number(protein) : undefined,
        prepTime: prepTime ? Number(prepTime) : undefined,
        quantity: quantity ? Number(quantity) : undefined,
        veg,
        category,
        counter,
        available,
        image: finalImageUrl || undefined
      };

      if (isEdit && editId !== null) {
        await updateMenuItem(editId, itemData);
        Alert.alert('Success', 'Item updated');
      } else {
        await addMenuItem(itemData);
        Alert.alert('Success', 'Item added');
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Dynamically import the module only when needed
      // This prevents Metro from trying to resolve it at build time
      const imagePickerModule = await import('expo-image-picker');
      const ImagePicker = imagePickerModule.default || imagePickerModule;

      if (!ImagePicker) {
        Alert.alert('Image picker not available', 'Install expo-image-picker: npx expo install expo-image-picker');
        return;
      }

      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Allow photo access to upload an image.');
        return;
      }
      // Fixed deprecation warning: Use ImagePicker.MediaType.Images or 'images' string
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        quality: 0.7,
        allowsEditing: true,
        aspect: [4, 3],
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error: any) {
      // Check if it's a module not found error
      if (error?.code === 'MODULE_NOT_FOUND' || error?.message?.includes('expo-image-picker')) {
        Alert.alert('Image picker not available', 'Install expo-image-picker: npx expo install expo-image-picker');
      } else {
        Alert.alert('Error', 'Failed to pick image. Please try again.');
      }
    }
  };

  return (
    <ImageBackground source={require('../../design/owner background.png')} style={{ flex: 1 }} blurRadius={10}>
      <View style={{ flex: 1, backgroundColor: COLORS.bgOverlay }}>
        <View style={styles.headerWrapper}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </Pressable>
          <View style={styles.headerContent}>
            <OwnerHeader title={isEdit ? "Edit Item" : "Add Item"} hideIcons={true} />
          </View>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
          <View style={styles.card}>
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Item name" />

            <Text style={styles.label}>Description</Text>
            <TextInput style={[styles.input, { height: 80 }]} value={description} onChangeText={setDescription} placeholder="Short description" multiline />

            <Text style={styles.label}>Made With</Text>
            <TextInput style={styles.input} value={madeWith} onChangeText={setMadeWith} placeholder="Main ingredients" />

            <Text style={styles.label}>Price</Text>
            <TextInput style={styles.input} value={price} onChangeText={setPrice} placeholder="Price" keyboardType="numeric" />

            <Text style={styles.label}>Image</Text>
            <View style={[styles.row, { alignItems: 'center', justifyContent: 'space-between' }]}>
              <TouchableOpacity onPress={pickImage} style={styles.uploadBtn}>
                <Text style={styles.uploadBtnText}>{imageUri ? 'Change Image' : 'Upload Image'}</Text>
              </TouchableOpacity>
              {imageUri && (
                <Image source={{ uri: imageUri }} style={{ width: 72, height: 72, borderRadius: 10, backgroundColor: '#eee' }} />
              )}
            </View>

            <Text style={styles.label}>Category</Text>
            <View style={styles.row}>
              {(['Snacks', 'Meals', 'Hot Beverages', 'Cold Beverages'] as const).map((c) => (
                <TouchableOpacity key={c} style={[styles.chip, category === c && styles.chipActive]} onPress={() => setCategory(c)}>
                  <Text style={[styles.chipText, category === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Counter Transfer (Pickup Points)</Text>
            <View style={styles.row}>
              {(['Snacks & Hot Beverages', 'Meals', 'Cold Beverages'] as const).map((c) => (
                <TouchableOpacity key={c} style={[styles.chip, counter === c && styles.chipActive]} onPress={() => setCounter(c)}>
                  <Text style={[styles.chipText, counter === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.row, { marginTop: 12, justifyContent: 'space-between' }]}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Calories (kcal)</Text>
                <TextInput style={styles.input} value={calories} onChangeText={setCalories} placeholder="e.g., 250" keyboardType="numeric" />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Protein (g)</Text>
                <TextInput style={styles.input} value={protein} onChangeText={setProtein} placeholder="e.g., 12" keyboardType="numeric" />
              </View>
            </View>

            <View style={[styles.row, { marginTop: 12, justifyContent: 'space-between' }]}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Prep Time (min)</Text>
                <TextInput style={styles.input} value={prepTime} onChangeText={setPrepTime} placeholder="e.g., 15" keyboardType="numeric" />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Quantity</Text>
                <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} placeholder="e.g., 1" keyboardType="numeric" />
              </View>
            </View>

            <View style={[styles.row, { marginTop: 12, justifyContent: 'space-between' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text>Veg</Text>
                <Switch value={veg} onValueChange={setVeg} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text>Available</Text>
                <Switch value={available} onValueChange={setAvailable} />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submit, (isUploading || !name || !price) && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>{isEdit ? "Update Item" : "Add Item"}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  card: { backgroundColor: COLORS.glass, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  label: { color: COLORS.sub, marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { color: COLORS.sub },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  uploadBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.primary },
  uploadBtnText: { color: '#fff', fontWeight: '600' },
  submit: { marginTop: 24, backgroundColor: COLORS.accent, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
