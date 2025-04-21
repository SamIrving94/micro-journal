import { ProtectedContent } from "@/components/auth/ProtectedContent";
import { UserInfo } from "@/components/auth/UserInfo";
import { Navbar } from "@/components/ui/Navbar";

export default function ProfilePage() {
  return (
    <ProtectedContent>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-4xl mx-auto p-4 mt-8">
          <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
          <UserInfo />
          
          <div className="mt-8 p-4 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Server-Side Authentication</h2>
            <p className="text-gray-700 mb-4">
              This page demonstrates server-side authentication using Clerk with Next.js.
            </p>
            <p className="text-gray-700 mb-4">
              The <code className="bg-gray-100 px-1 py-0.5 rounded">ProtectedContent</code> component uses the <code className="bg-gray-100 px-1 py-0.5 rounded">auth()</code> function 
              from <code className="bg-gray-100 px-1 py-0.5 rounded">@clerk/nextjs/server</code> to protect this route.
            </p>
            <p className="text-gray-700">
              The <code className="bg-gray-100 px-1 py-0.5 rounded">UserInfo</code> component uses the <code className="bg-gray-100 px-1 py-0.5 rounded">currentUser()</code> function 
              to display information about the authenticated user.
            </p>
          </div>
        </main>
      </div>
    </ProtectedContent>
  );
} 