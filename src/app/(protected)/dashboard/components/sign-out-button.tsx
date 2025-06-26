"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const SignOutButton = () => {
  const router = useRouter();
  const handleSignOutClick = () => {
    authClient.signOut();
    router.push("/authentication");
  };

  return (
    <Button onClick={() => handleSignOutClick()}>
      <LogOut className="h-4 w-4" />
      Sair
    </Button>
  );
};

export default SignOutButton;
