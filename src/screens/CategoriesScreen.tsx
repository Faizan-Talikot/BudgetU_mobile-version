import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Dimensions, Alert, ActivityIndicator, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../theme';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';
import { categoryAPI } from '../services/api';
import { Category, DBCategory } from '../types/category';

// Available icons for categories
const availableIcons = [
    // Essential icons
    'wallet', 'cash', 'card', 'calculator', 'receipt', 'pricetag',
    // Transportation
    'car', 'bus', 'airplane', 'bicycle', 'boat', 'train',
    // Food & Dining
    'restaurant', 'fast-food', 'cafe', 'pizza', 'beer', 'wine',
    // Shopping & Entertainment
    'cart', 'bag', 'basket', 'gift', 'game-controller', 'film',
    // Home & Utilities
    'home', 'bed', 'build', 'hammer', 'construct', 'bulb',
    // Health & Education
    'medical', 'fitness', 'school', 'library', 'book',
    // Technology
    'laptop', 'desktop', 'phone-portrait', 'tablet-portrait', 'tv',
    // Personal
    'person', 'shirt', 'glasses', 'umbrella', 'brush',
    // Business
    'briefcase', 'business', 'trending-up', 'stats-chart',
    // Media
    'headset', 'musical-notes', 'mic', 'camera', 'videocam'
].map(icon => `${icon}-outline`);

// Available colors for categories
const availableColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#D4A5A5', 
    '#FF9999', '#9DC8C8', '#58B19F', '#4CAF50', '#2196F3',
    '#9C27B0', '#E91E63', '#FF9800', '#795548', '#607D8B',
    '#3F51B5', '#009688', '#FFC107', '#8BC34A', '#CDDC39'
];

const CategoriesScreen = () => {
    const [activeType, setActiveType] = useState<'income' | 'expense'>('expense');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(availableIcons[0]);
    const [selectedColor, setSelectedColor] = useState(availableColors[0]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const allCategories = await categoryAPI.getAll();
            
            // Process categories to ensure valid data
            const processedCategories = allCategories.map((cat: Category | DBCategory) => {
                const id = 'id' in cat ? cat.id : ('_id' in cat ? cat._id : '');
                
                // Check if name is actually an ID or is invalid
                const isInvalidName = !cat.name || /^\d/.test(cat.name) && cat.name.length > 20;
                
                // Ensure icon is valid
                let icon = cat.icon;
                if (icon === 'default-icon' || !icon) {
                    icon = 'wallet-outline';
                } else if (!icon.endsWith('-outline')) {
                    icon = `${icon}-outline`;
                }
                
                // If icon is not in availableIcons, use wallet-outline
                if (!availableIcons.includes(icon)) {
                    icon = 'wallet-outline';
                }

                return {
                    ...cat,
                    id,
                    name: isInvalidName ? 'Unnamed Category' : cat.name,
                    icon,
                    color: cat.color || colors.primary
                } as Category;
            });

            setCategories(processedCategories);
        } catch (error) {
            console.error('Error loading categories:', error);
            Alert.alert('Error', 'Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryPress = (category: Category) => {
        if (category.isDefault) {
            Alert.alert(
                'Default Category',
                'Default categories cannot be modified. You can create custom categories for your specific needs.',
                [{ text: 'OK' }]
            );
            return;
        }

        setEditingCategory(category);
        setNewCategoryName(category.name);
        setSelectedIcon(category.icon);
        setSelectedColor(category.color);
        setActiveType(category.type);
        setIsEditModalVisible(true);
    };

    const handleAddCategory = async () => {
        const trimmedName = newCategoryName.trim();
        if (!trimmedName) return;

        // Validate name is not an ID
        if (/^\d/.test(trimmedName) && trimmedName.length > 20) {
            Alert.alert('Invalid Name', 'Please enter a valid category name');
            return;
        }

        try {
            setLoading(true);
            // Ensure we're using a valid icon from our list
            const icon = availableIcons.includes(selectedIcon) ? selectedIcon : availableIcons[0];
            
            const newCategory = await categoryAPI.create({
                name: trimmedName,
                icon,
                color: selectedColor,
                type: activeType
            });
            
            // Process the new category to ensure it has valid data
            const processedCategory: Category = {
                id: newCategory._id || newCategory.id || '',
                name: newCategory.name,
                icon: icon,  // Use our validated icon
                color: newCategory.color,
                type: newCategory.type,
                isDefault: newCategory.isDefault || false
            };
            
            setCategories(prev => [...prev, processedCategory]);
            resetModalState();
            Alert.alert('Success', 'Category created successfully');
        } catch (error) {
            console.error('Error creating category:', error);
            Alert.alert('Error', 'Failed to create category');
        } finally {
            setLoading(false);
        }
    };

    const handleEditCategory = async () => {
        if (!editingCategory || !newCategoryName.trim()) return;

        try {
            setLoading(true);
            // Ensure we're using a valid icon
            const icon = selectedIcon.endsWith('-outline') ? selectedIcon : `${selectedIcon}-outline`;
            
            const updatedCategory = await categoryAPI.update(
                editingCategory.id, 
                {
                    name: newCategoryName.trim(),
                    icon,
                    color: selectedColor,
                    type: activeType
                }
            );

            // Process the updated category to ensure it has the correct shape
            const processedCategory: Category = {
                id: (updatedCategory as any)._id || (updatedCategory as any).id || '',
                name: updatedCategory.name,
                icon,  // Use our validated icon
                color: updatedCategory.color,
                type: updatedCategory.type,
                isDefault: updatedCategory.isDefault || false
            };

            setCategories(prev => 
                prev.map(cat => 
                    cat.id === editingCategory.id
                        ? processedCategory
                        : cat
                )
            );
            resetModalState();
            Alert.alert('Success', 'Category updated successfully');
        } catch (error) {
            console.error('Error updating category:', error);
            Alert.alert('Error', 'Failed to update category');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCategory = async () => {
        if (!editingCategory) return;

        Alert.alert(
            'Delete Category',
            'Are you sure you want to delete this category? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await categoryAPI.delete(editingCategory.id);
                            setCategories(prev => prev.filter(cat => cat.id !== editingCategory.id));
                            resetModalState();
                            Alert.alert('Success', 'Category deleted successfully');
                        } catch (error) {
                            console.error('Error deleting category:', error);
                            Alert.alert(
                                'Error',
                                'Failed to delete category. Please try again later.'
                            );
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const resetModalState = () => {
        setNewCategoryName('');
        setSelectedIcon(availableIcons[0]);
        setSelectedColor(availableColors[0]);
        setIsModalVisible(false);
        setIsEditModalVisible(false);
        setEditingCategory(null);
    };

    const filteredCategories = categories.filter(cat => cat.type === activeType);

    if (loading && categories.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.subtitle}>
                        Manage your {activeType} categories
                    </Text>
                </View>

                {/* Type Selector */}
                <View style={styles.typeSelector}>
                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            activeType === 'expense' && styles.activeTypeButton,
                        ]}
                        onPress={() => setActiveType('expense')}
                    >
                        <Text style={[
                            styles.typeButtonText,
                            activeType === 'expense' && styles.activeTypeButtonText,
                        ]}>
                            Expense
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.typeButton,
                            activeType === 'income' && styles.activeTypeButton,
                        ]}
                        onPress={() => setActiveType('income')}
                    >
                        <Text style={[
                            styles.typeButtonText,
                            activeType === 'income' && styles.activeTypeButtonText,
                        ]}>
                            Income
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.categoriesGrid}>
                    {filteredCategories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            onPress={() => handleCategoryPress(category)}
                            activeOpacity={0.7}
                        >
                            <Card style={styles.categoryCard}>
                                <View
                                    style={[
                                        styles.iconContainer,
                                        { backgroundColor: category.color },
                                    ]}
                                >
                                    <Ionicons
                                        name={category.icon as any}
                                        size={24}
                                        color={colors.background}
                                    />
                                </View>
                                <Text style={styles.categoryName}>{category.name}</Text>
                                {category.isDefault && (
                                    <View style={styles.defaultBadge}>
                                        <Text style={styles.defaultBadgeText}>Default</Text>
                                    </View>
                                )}
                            </Card>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setIsModalVisible(true)}
                    activeOpacity={0.7}
                >
                    <Card style={styles.addCategoryCard}>
                        <View style={styles.addIconContainer}>
                            <Ionicons
                                name="add-outline"
                                size={24}
                                color={colors.primary}
                            />
                        </View>
                        <Text style={styles.addCategoryText}>Add Custom {activeType} Category</Text>
                    </Card>
                </TouchableOpacity>
            </ScrollView>

            {/* Edit Category Modal - Only shown for custom categories */}
            {!editingCategory?.isDefault && (
                <Modal
                    visible={isEditModalVisible}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={resetModalState}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Edit category</Text>
                                <TouchableOpacity 
                                    onPress={resetModalState}
                                    style={styles.closeButton}
                                >
                                    <Ionicons name="close" size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>

                            {/* Category Name Input */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.modalLabel}>Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter category name"
                                    value={newCategoryName}
                                    onChangeText={setNewCategoryName}
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>

                            {/* Icon Selection */}
                            <View style={styles.iconSection}>
                                <Text style={styles.modalLabel}>Icon</Text>
                                <ScrollView 
                                    horizontal 
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.iconScroll}
                                >
                                    {availableIcons.map((icon, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.iconOption,
                                                selectedIcon === icon && styles.selectedIconOption
                                            ]}
                                            onPress={() => setSelectedIcon(icon)}
                                        >
                                            <Ionicons
                                                name={icon as any}
                                                size={24}
                                                color={selectedIcon === icon ? colors.background : colors.text}
                                            />
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Color Selection */}
                            <View style={styles.colorSection}>
                                <Text style={styles.modalLabel}>Color</Text>
                                <ScrollView 
                                    horizontal 
                                    showsHorizontalScrollIndicator={false}
                                    style={styles.colorScroll}
                                >
                                    {availableColors.map((color, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            style={[
                                                styles.colorOption,
                                                { backgroundColor: color },
                                                selectedColor === color && styles.selectedColorOption
                                            ]}
                                            onPress={() => setSelectedColor(color)}
                                        />
                                    ))}
                                </ScrollView>
                            </View>

                            {/* Delete Button */}
                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={handleDeleteCategory}
                            >
                                <Ionicons name="trash-outline" size={20} color={colors.error} />
                                <Text style={styles.deleteButtonText}>Delete Category</Text>
                            </TouchableOpacity>

                            {/* Action Buttons */}
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={resetModalState}
                                >
                                    <Text style={styles.cancelButtonText}>CANCEL</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton]}
                                    onPress={handleEditCategory}
                                    disabled={!newCategoryName.trim()}
                                >
                                    <Text style={styles.saveButtonText}>SAVE</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            )}

            {/* Add Category Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={resetModalState}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Add new category</Text>
                            <TouchableOpacity 
                                onPress={resetModalState}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Type Selection */}
                        <View style={styles.modalTypeSelector}>
                            <Text style={styles.modalLabel}>Type:</Text>
                            <View style={styles.typeToggle}>
                                <TouchableOpacity
                                    style={[
                                        styles.typeToggleButton,
                                        activeType === 'income' && styles.activeTypeToggleButton
                                    ]}
                                    onPress={() => setActiveType('income')}
                                >
                                    <Text style={[
                                        styles.typeToggleText,
                                        activeType === 'income' && styles.activeTypeToggleText
                                    ]}>INCOME</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.typeToggleButton,
                                        activeType === 'expense' && styles.activeTypeToggleButton
                                    ]}
                                    onPress={() => setActiveType('expense')}
                                >
                                    <Text style={[
                                        styles.typeToggleText,
                                        activeType === 'expense' && styles.activeTypeToggleText
                                    ]}>EXPENSE</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Category Name Input */}
                        <View style={styles.inputContainer}>
                            <Text style={styles.modalLabel}>Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter category name"
                                value={newCategoryName}
                                onChangeText={setNewCategoryName}
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        {/* Icon Selection */}
                        <View style={styles.iconSection}>
                            <Text style={styles.modalLabel}>Icon</Text>
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false}
                                style={styles.iconScroll}
                            >
                                {availableIcons.map((icon, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.iconOption,
                                            selectedIcon === icon && styles.selectedIconOption
                                        ]}
                                        onPress={() => setSelectedIcon(icon)}
                                    >
                                        <Ionicons
                                            name={icon as any}
                                            size={24}
                                            color={selectedIcon === icon ? colors.background : colors.text}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Color Selection */}
                        <View style={styles.colorSection}>
                            <Text style={styles.modalLabel}>Color</Text>
                            <ScrollView 
                                horizontal 
                                showsHorizontalScrollIndicator={false}
                                style={styles.colorScroll}
                            >
                                {availableColors.map((color, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.colorOption,
                                            { backgroundColor: color },
                                            selectedColor === color && styles.selectedColorOption
                                        ]}
                                        onPress={() => setSelectedColor(color)}
                                    />
                                ))}
                            </ScrollView>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={resetModalState}
                            >
                                <Text style={styles.cancelButtonText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleAddCategory}
                                disabled={!newCategoryName.trim()}
                            >
                                <Text style={styles.saveButtonText}>SAVE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: spacing.lg,
    },
    subtitle: {
        fontSize: typography.sizes.base,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    typeSelector: {
        flexDirection: 'row',
        marginHorizontal: spacing.lg,
        marginBottom: spacing.lg,
        backgroundColor: colors.secondary,
        borderRadius: 8,
        padding: spacing.xs,
    },
    typeButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTypeButton: {
        backgroundColor: colors.background,
    },
    typeButtonText: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.textSecondary,
    },
    activeTypeButtonText: {
        color: colors.primary,
    },
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: spacing.md,
        justifyContent: 'space-between',
    },
    categoryCard: {
        width: 160,
        marginBottom: spacing.md,
        alignItems: 'center',
        padding: spacing.lg,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    categoryName: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.text,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    addButton: {
        padding: spacing.md,
    },
    addCategoryCard: {
        alignItems: 'center',
        padding: spacing.lg,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: colors.border,
    },
    addIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
        backgroundColor: colors.secondary,
    },
    addCategoryText: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.primary,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: spacing.lg,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    modalTitle: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.text,
    },
    closeButton: {
        padding: spacing.xs,
    },
    modalTypeSelector: {
        marginBottom: spacing.lg,
    },
    modalLabel: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    typeToggle: {
        flexDirection: 'row',
        backgroundColor: colors.secondary,
        borderRadius: 8,
        padding: 4,
    },
    typeToggleButton: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTypeToggleButton: {
        backgroundColor: colors.background,
    },
    typeToggleText: {
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.medium,
        color: colors.textSecondary,
    },
    activeTypeToggleText: {
        color: colors.primary,
    },
    inputContainer: {
        marginBottom: spacing.lg,
    },
    input: {
        backgroundColor: colors.secondary,
        borderRadius: 8,
        padding: spacing.md,
        fontSize: typography.sizes.base,
        color: colors.text,
    },
    iconSection: {
        marginBottom: spacing.lg,
    },
    iconScroll: {
        flexGrow: 0,
    },
    iconOption: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    selectedIconOption: {
        backgroundColor: colors.primary,
    },
    colorSection: {
        marginBottom: spacing.xl,
    },
    colorScroll: {
        flexGrow: 0,
    },
    colorOption: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: spacing.sm,
    },
    selectedColorOption: {
        borderWidth: 3,
        borderColor: colors.text,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.md,
    },
    modalButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: colors.secondary,
    },
    saveButton: {
        backgroundColor: colors.primary,
    },
    cancelButtonText: {
        color: colors.text,
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
    },
    saveButtonText: {
        color: colors.background,
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        marginBottom: spacing.lg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.error,
    },
    deleteButtonText: {
        color: colors.error,
        marginLeft: spacing.sm,
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    defaultBadge: {
        position: 'absolute',
        top: spacing.xs,
        right: spacing.xs,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.xs,
        paddingVertical: 2,
        borderRadius: 4,
    },
    defaultBadgeText: {
        color: colors.background,
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.medium,
    },
});

export default CategoriesScreen; 