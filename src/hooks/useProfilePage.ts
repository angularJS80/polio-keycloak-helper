import { useEffect, useState } from 'react';
import { getUserName, getEmail } from 'fast-auth-with-keycloak';

export function useProfilePage() {
  const [profile, setProfile] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const name = getUserName();
        const email = getEmail();
        setProfile({ name: name || undefined, email: email || undefined });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
      }
    };
    fetchProfile();
  }, []);

  return {
    profile
  };
} 