import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

interface ProtectedContentProps {
  children: React.ReactNode;
}

export async function ProtectedContent({ children }: ProtectedContentProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/auth/signin");
  }
  
  return <>{children}</>;
} 