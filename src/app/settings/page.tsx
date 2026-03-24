"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";
import {
  User,
  Lock,
  Bell,
  Palette,
  Loader2,
  Globe,
  Twitter,
  Github,
  MapPin,
  Camera,
} from "lucide-react";

interface ProfileData {
  name: string;
  bio: string;
  image: string;
  website: string;
  twitter: string;
  github: string;
  location: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const [form, setForm] = useState<ProfileData>({
    name: "",
    bio: "",
    image: "",
    website: "",
    twitter: "",
    github: "",
    location: "",
  });

  const [passwords, setPasswords] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setForm({
        name: data.name || "",
        bio: data.bio || "",
        image: data.image || "",
        website: data.website || "",
        twitter: data.twitter || "",
        github: data.github || "",
        location: data.location || "",
      });
    } catch {
      toast({
        title: "Failed to load profile",
        description: "Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    } catch {
      toast({
        title: "Failed to save profile",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match.",
        variant: "destructive",
      });
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwords),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Password updated" });
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch {
      toast({
        title: "Failed to update password",
        description: "Please check your current password.",
        variant: "destructive",
      });
    } finally {
      setSavingPassword(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-foreground" />
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="bg-muted p-1 rounded-xl h-auto gap-1">
          {[
            { value: "profile", label: "Profile", icon: User },
            { value: "account", label: "Account", icon: Lock },
            { value: "notifications", label: "Notifications", icon: Bell },
            { value: "appearance", label: "Appearance", icon: Palette },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile">
          <form onSubmit={handleProfileSave} className="space-y-8">
            {/* Avatar section */}
            <div className="flex items-center gap-6 p-6 bg-muted/20 rounded-2xl border border-border">
              <div className="relative">
                <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                  <AvatarImage src={form.image || ""} />
                  <AvatarFallback className="text-xl bg-muted text-muted-foreground font-bold">
                    {getInitials(form.name || session?.user?.name || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-foreground rounded-full flex items-center justify-center border-2 border-background">
                  <Camera className="h-3 w-3 text-background" />
                </div>
              </div>
              <div className="flex-1">
                <Label
                  htmlFor="image"
                  className="text-sm font-medium text-foreground block mb-1.5"
                >
                  Avatar URL
                </Label>
                <Input
                  id="image"
                  name="image"
                  value={form.image}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Paste a URL to your profile image
                </p>
              </div>
            </div>

            {/* Basic info */}
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-foreground">
                Basic Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">
                    Display Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="location" className="text-sm font-medium text-foreground">
                    Location
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      name="location"
                      value={form.location}
                      onChange={handleChange}
                      placeholder="San Francisco, CA"
                      className="h-10 pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bio" className="text-sm font-medium text-foreground">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell readers about yourself..."
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  {form.bio.length}/160 characters
                </p>
              </div>
            </div>

            <Separator />

            {/* Social links */}
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-foreground">
                Social Links
              </h2>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="website" className="text-sm font-medium text-foreground">
                    Website
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      name="website"
                      value={form.website}
                      onChange={handleChange}
                      placeholder="https://yourwebsite.com"
                      className="h-10 pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="twitter" className="text-sm font-medium text-foreground">
                    Twitter / X
                  </Label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="twitter"
                      name="twitter"
                      value={form.twitter}
                      onChange={handleChange}
                      placeholder="username (without @)"
                      className="h-10 pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="github" className="text-sm font-medium text-foreground">
                    GitHub
                  </Label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="github"
                      name="github"
                      value={form.github}
                      onChange={handleChange}
                      placeholder="username"
                      className="h-10 pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="bg-foreground text-background hover:opacity-90 px-8"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* ACCOUNT TAB */}
        <TabsContent value="account">
          <div className="space-y-8">
            {/* Email section */}
            <div className="p-6 bg-muted/20 rounded-2xl border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Email Address
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground font-medium">
                    {session?.user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Contact support to change your email
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Change password */}
            <form onSubmit={handlePasswordSave} className="space-y-5">
              <h3 className="text-sm font-semibold text-foreground">
                Change Password
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="currentPassword" className="text-sm font-medium text-foreground">
                    Current Password
                  </Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="At least 8 characters"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Repeat new password"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={savingPassword}
                  className="bg-foreground text-background hover:opacity-90 px-8"
                >
                  {savingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        {/* NOTIFICATIONS TAB */}
        <TabsContent value="notifications">
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-foreground">
              Email Notifications
            </h3>

            <div className="space-y-4">
              {[
                {
                  id: "email_notifs",
                  label: "New followers",
                  description: "When someone starts following you",
                  checked: emailNotifications,
                  onChange: setEmailNotifications,
                },
                {
                  id: "comment_notifs",
                  label: "Comments on your posts",
                  description: "When someone comments on your article",
                  checked: true,
                  onChange: () => {},
                },
                {
                  id: "like_notifs",
                  label: "Post likes",
                  description: "When someone likes your article",
                  checked: false,
                  onChange: () => {},
                },
                {
                  id: "weekly_digest",
                  label: "Weekly digest",
                  description: "A weekly summary of your top posts",
                  checked: true,
                  onChange: () => {},
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                  </div>
                  <Switch
                    id={item.id}
                    checked={item.checked}
                    onCheckedChange={item.onChange}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                className="bg-foreground text-background hover:opacity-90 px-8"
                onClick={() =>
                  toast({ title: "Notification preferences saved" })
                }
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* APPEARANCE TAB */}
        <TabsContent value="appearance">
          <div className="space-y-6">
            <h3 className="text-sm font-semibold text-foreground">Appearance</h3>

            <div className="p-5 bg-muted/20 rounded-2xl border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Theme</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Inspire.blog uses a clean light theme optimised for readability.
                  </p>
                </div>
                <span className="text-xs font-medium text-muted-foreground border border-border rounded-full px-3 py-1">Light</span>
              </div>
            </div>

            <div className="p-5 bg-muted/20 rounded-2xl border border-border">
              <h4 className="text-sm font-medium text-foreground mb-3">
                Reading font size
              </h4>
              <div className="flex gap-2">
                {["Small", "Medium", "Large"].map((size) => (
                  <button
                    key={size}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors cursor-pointer ${
                      size === "Medium"
                        ? "border-foreground bg-foreground text-background"
                        : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
