import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getUserData } from "@/lib/api";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Validation schema
const profileSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address").min(1, "Email is required"),
    profilePicture: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfileSettings = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("");
    const { toast } = useToast();

    // Initialize form with default values
    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            profilePicture: "",
        },
    });

    // Get user data
    useEffect(() => {
        const userData = getUserData();
        if (userData) {
            form.reset({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                profilePicture: userData.profilePicture || "",
            });

            if (userData.profilePicture) {
                setAvatarUrl(userData.profilePicture);
            }
        }
    }, [form]);

    // Handle avatar change
    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // For now, just create a local URL for preview
            // In a real app, you would upload this to a server
            const url = URL.createObjectURL(file);
            setAvatarUrl(url);
            form.setValue("profilePicture", url);
        }
    };

    // Handle form submission
    const onSubmit = async (data: ProfileFormValues) => {
        setIsLoading(true);
        try {
            // In a real app, you would send this data to the server
            console.log("Profile data to update:", data);

            // Update local storage for demo purposes
            const userData = getUserData();
            if (userData) {
                const updatedUser = {
                    ...userData,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    profilePicture: data.profilePicture,
                };
                localStorage.setItem("budgetu-user", JSON.stringify(updatedUser));
            }

            toast({
                title: "Profile updated",
                description: "Your profile information has been updated successfully.",
            });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({
                title: "Update failed",
                description: "There was an error updating your profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
                <div className="relative">
                    <Avatar className="h-24 w-24">
                        {avatarUrl ? (
                            <AvatarImage src={avatarUrl} alt="Profile picture" />
                        ) : (
                            <AvatarFallback className="bg-budgetu-purple text-white text-2xl">
                                {form.getValues("firstName").charAt(0)}
                                {form.getValues("lastName").charAt(0)}
                            </AvatarFallback>
                        )}
                    </Avatar>
                    <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 p-1 bg-primary text-primary-foreground rounded-full cursor-pointer"
                    >
                        <Camera className="h-4 w-4" />
                        <input
                            id="avatar-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={handleAvatarChange}
                        />
                    </label>
                </div>
                <div>
                    <h3 className="text-lg font-medium">Profile Picture</h3>
                    <p className="text-sm text-muted-foreground">
                        Click the camera icon to upload a new profile picture
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="you@example.com"
                                        {...field}
                                        disabled
                                        title="Email cannot be changed"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default ProfileSettings; 