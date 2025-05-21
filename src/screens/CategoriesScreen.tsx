import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '../theme';
import { Card } from '../components/Card';
import { Ionicons } from '@expo/vector-icons';
import { storage, StorageKeys } from '../utils/storage';

interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: 'income' | 'expense';
}

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

// Default categories that will always be present
const defaultCategories: Category[] = [
    // Expense Categories
    {
        id: '1',
        name: 'Food & Dining',
        icon: 'restaurant-outline',
        color: '#FF6B6B',
        type: 'expense',
    },
    {
        id: '2',
        name: 'Transportation',
        icon: 'car-outline',
        color: '#4ECDC4',
        type: 'expense',
    },
    {
        id: '3',
        name: 'Shopping',
        icon: 'cart-outline',
        color: '#45B7D1',
        type: 'expense',
    },
    {
        id: '4',
        name: 'Bills & Utilities',
        icon: 'receipt-outline',
        color: '#96CEB4',
        type: 'expense',
    },
    {
        id: '5',
        name: 'Entertainment',
        icon: 'film-outline',
        color: '#D4A5A5',
        type: 'expense',
    },
    {
        id: '6',
        name: 'Healthcare',
        icon: 'medical-outline',
        color: '#FF9999',
        type: 'expense',
    },
    {
        id: '7',
        name: 'Education',
        icon: 'school-outline',
        color: '#9DC8C8',
        type: 'expense',
    },
    {
        id: '8',
        name: 'Personal Care',
        icon: 'person-outline',
        color: '#58B19F',
        type: 'expense',
    },
    // Income Categories
    {
        id: '9',
        name: 'Salary',
        icon: 'cash-outline',
        color: '#4CAF50',
        type: 'income',
    },
    {
        id: '10',
        name: 'Business',
        icon: 'briefcase-outline',
        color: '#2196F3',
        type: 'income',
    },
    {
        id: '11',
        name: 'Investments',
        icon: 'trending-up-outline',
        color: '#9C27B0',
        type: 'income',
    },
    {
        id: '12',
        name: 'Gifts',
        icon: 'gift-outline',
        color: '#E91E63',
        type: 'income',
    },
    {
        id: '13',
        name: 'Rental',
        icon: 'home-outline',
        color: '#FF9800',
        type: 'income',
    },
];

const CategoriesScreen = () => {
    const [activeType, setActiveType] = useState<'income' | 'expense'>('expense');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(availableIcons[0]);
    const [selectedColor, setSelectedColor] = useState(availableColors[0]);
    const [userCategories, setUserCategories] = useState<Category[]>([]);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const savedCategories = await storage.get<Category[]>(StorageKeys.CATEGORIES);
            if (savedCategories) {
                setUserCategories(savedCategories);
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const saveCategories = async (updatedCategories: Category[]) => {
        try {
            await storage.set(StorageKeys.CATEGORIES, updatedCategories);
        } catch (error) {
            console.error('Error saving categories:', error);
        }
    };

    const handleAddCategory = async () => {
        if (newCategoryName.trim()) {
            const newCategory: Category = {
                id: `user_${Date.now()}`,
                name: newCategoryName.trim(),
                icon: selectedIcon,
                color: selectedColor,
                type: activeType
            };
            
            const updatedCategories = [...userCategories, newCategory];
            setUserCategories(updatedCategories);
            await saveCategories(updatedCategories);
            
            resetModalState();
        }
    };

    const handleEditCategory = async () => {
        if (!editingCategory || !newCategoryName.trim()) return;

        const updatedCategory = {
            ...editingCategory,
            name: newCategoryName.trim(),
            icon: selectedIcon,
            color: selectedColor
        };

        // Check if it's a default category
        const isDefaultCategory = defaultCategories.some(cat => cat.id === editingCategory.id);
        
        let updatedCategories: Category[];
        if (isDefaultCategory) {
            // If it's a default category, add/update it in user categories
            const existingIndex = userCategories.findIndex(cat => cat.id === editingCategory.id);
            if (existingIndex >= 0) {
                // Update existing override
                updatedCategories = userCategories.map(cat =>
                    cat.id === editingCategory.id ? updatedCategory : cat
                );
            } else {
                // Create new override with same ID as default
                updatedCategories = [...userCategories, {
                    ...updatedCategory,
                    id: editingCategory.id // Keep the same ID as default category
                }];
            }
        } else {
            // If editing a user category, update it normally
            updatedCategories = userCategories.map(cat =>
                cat.id === editingCategory.id ? updatedCategory : cat
            );
        }

        setUserCategories(updatedCategories);
        await saveCategories(updatedCategories);
        resetModalState();
    };

    const handleDeleteCategory = async () => {
        if (!editingCategory) return;

        // Add the category ID to deleted categories list
        const updatedCategories = userCategories.filter(cat => cat.id !== editingCategory.id);
        
        // If it's a default category, add it to the deleted list
        if (defaultCategories.some(cat => cat.id === editingCategory.id)) {
            const deletedCategory = {
                id: editingCategory.id,
                isDeleted: true,
            };
            updatedCategories.push(deletedCategory as any);
        }

        setUserCategories(updatedCategories);
        await saveCategories(updatedCategories);
        resetModalState();
    };

    const resetModalState = () => {
        setNewCategoryName('');
        setSelectedIcon(availableIcons[0]);
        setSelectedColor(availableColors[0]);
        setIsModalVisible(false);
        setIsEditModalVisible(false);
        setEditingCategory(null);
    };

    const handleCategoryPress = (category: Category) => {
        setEditingCategory(category);
        setNewCategoryName(category.name);
        setSelectedIcon(category.icon);
        setSelectedColor(category.color);
        setIsEditModalVisible(true);
    };

    // Update the filtering logic to exclude deleted categories
    const filteredCategories = [...defaultCategories, ...userCategories]
        .filter(category => category.type === activeType)
        // Filter out deleted categories
        .filter(category => !userCategories.some(uc => uc.id === category.id && (uc as any).isDeleted))
        .reduce((result, current) => {
            const existingIndex = result.findIndex(cat => cat.id === current.id);
            if (existingIndex >= 0) {
                // Replace default with user override if it exists
                result[existingIndex] = current;
            } else {
                result.push(current);
            }
            return result;
        }, [] as Category[]);

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
                        <Text style={styles.addCategoryText}>Add {activeType} Category</Text>
                    </Card>
                </TouchableOpacity>
            </ScrollView>

            {/* Edit Category Modal */}
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
});

export default CategoriesScreen; 