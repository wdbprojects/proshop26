"use client";

import ErrorCard from "@/components/shared/error-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useProfile } from "@/hooks/use-profile";
import ConnectedAccounts from "@/modules/components/profile/connected-accounts";
import PasswordForm from "@/modules/components/profile/password-form";
import ProfileForm from "@/modules/components/profile/profile-form";

const ProfilePage = () => {
  const { data, isLoading, isError } = useProfile();

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }
  if (isError || !data) {
    return <ErrorCard />;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">My profile</h1>
      <ProfileForm profile={data.profile} />
      <PasswordForm hasPassword={data.providers.includes("credential")} />
      <ConnectedAccounts profile={data.profile} providers={data.providers} />
    </div>
  );
};

export default ProfilePage;
