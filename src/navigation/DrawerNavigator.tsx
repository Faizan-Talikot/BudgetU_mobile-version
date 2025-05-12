import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem, DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../theme';
import TabNavigator from './TabNavigator';
import SettingsScreen from '../screens/SettingsScreen';
import { DrawerParamList } from './types';

const Drawer = createDrawerNavigator<DrawerParamList>();

interface CustomDrawerContentProps extends DrawerContentComponentProps {
    // Add any additional props here
}

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = (props) => {
    return (
        <DrawerContentScrollView {...props}>
            <View style={styles.drawerHeader}>
                <Text style={styles.appName}>BudgetU</Text>
                <Text style={styles.versionText}>v1.0.0</Text>
            </View>

            <DrawerItem
                label="Settings"
                icon={({ color, size }) => (
                    <Ionicons name="settings-outline" size={size} color={color} />
                )}
                onPress={() => props.navigation.navigate('Settings')}
                labelStyle={styles.drawerLabel}
            />

            <DrawerItem
                label="Export Records"
                icon={({ color, size }) => (
                    <Ionicons name="download-outline" size={size} color={color} />
                )}
                onPress={() => {/* TODO: Implement export */ }}
                labelStyle={styles.drawerLabel}
            />

            <DrawerItem
                label="Help"
                icon={({ color, size }) => (
                    <Ionicons name="help-circle-outline" size={size} color={color} />
                )}
                onPress={() => {/* TODO: Implement help */ }}
                labelStyle={styles.drawerLabel}
            />

            <DrawerItem
                label="Feedback"
                icon={({ color, size }) => (
                    <Ionicons name="chatbox-outline" size={size} color={color} />
                )}
                onPress={() => {/* TODO: Implement feedback */ }}
                labelStyle={styles.drawerLabel}
            />

            <DrawerItem
                label="Report an Issue"
                icon={({ color, size }) => (
                    <Ionicons name="warning-outline" size={size} color={color} />
                )}
                onPress={() => {/* TODO: Implement report */ }}
                labelStyle={styles.drawerLabel}
            />
        </DrawerContentScrollView>
    );
};

const DrawerNavigator = () => {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={({ navigation }) => ({
                headerShown: true,
                headerTitle: 'BudgetU',
                headerTitleStyle: styles.headerTitle,
                headerTitleAlign: 'center',
                headerLeft: () => (
                    <TouchableOpacity
                        onPress={() => navigation.toggleDrawer()}
                        style={styles.headerButton}
                    >
                        <Ionicons
                            name="menu"
                            size={24}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                ),
                headerRight: () => (
                    <TouchableOpacity
                        onPress={() => {/* TODO: Implement search */ }}
                        style={styles.headerButton}
                    >
                        <Ionicons
                            name="search"
                            size={24}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                ),
                drawerStyle: styles.drawer,
                headerStyle: {
                    backgroundColor: colors.background,
                    elevation: 0,
                    shadowOpacity: 0,
                },
            })}
        >
            <Drawer.Screen
                name="MainTabs"
                component={TabNavigator}
                options={{
                    headerTitle: 'BudgetU',
                    drawerLabel: () => null,
                }}
            />
            <Drawer.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                    headerTitle: 'Settings',
                }}
            />
        </Drawer.Navigator>
    );
};

const styles = StyleSheet.create({
    drawerHeader: {
        padding: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    appName: {
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold,
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    versionText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    drawerLabel: {
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.medium,
        color: colors.text,
    },
    headerTitle: {
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.bold,
        color: colors.text,
    },
    headerButton: {
        padding: spacing.sm,
        marginHorizontal: spacing.sm,
    },
    drawer: {
        backgroundColor: colors.background,
        width: 280,
    },
});

export default DrawerNavigator; 