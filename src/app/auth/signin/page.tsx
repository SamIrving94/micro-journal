import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white shadow-md rounded-lg p-6",
              headerTitle: "text-2xl font-bold mb-6 text-center",
              headerSubtitle: "text-center mb-4",
              formButtonPrimary: "w-full bg-primary-600 hover:bg-primary-700 py-2 px-4 rounded text-white",
              formFieldInput: "border rounded py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
              footerAction: "text-primary-600 hover:text-primary-700",
            },
          }}
          routing="path"
          path="/auth/signin"
          signUpUrl="/auth/signup"
          redirectUrl="/dashboard"
        />
      </div>
    </div>
  );
} 