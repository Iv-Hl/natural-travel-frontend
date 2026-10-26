"use client";

import TravellerInfo from "@/components/profile/TravellerInfo/TravellerInfo";
import { useAuth } from "@/components/providers/AuthProvider";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Завантаження профілю...</p>;
  }

  if (!user) {
    return <p role="alert">Не вдалося завантажити дані користувача.</p>;
  }

  return <TravellerInfo userId={user._id} />;
}
