import { currentUser } from "@clerk/nextjs/server";

export async function UserInfo() {
  const user = await currentUser();
  
  if (!user) {
    return <div>Not signed in</div>;
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h2 className="text-xl font-semibold mb-2">User Information</h2>
      <div className="grid grid-cols-2 gap-2">
        <div className="text-gray-600">ID:</div>
        <div>{user.id}</div>
        
        <div className="text-gray-600">Name:</div>
        <div>{user.firstName} {user.lastName}</div>
        
        <div className="text-gray-600">Email:</div>
        <div>{user.emailAddresses.map(email => (
          <div key={email.id} className="flex items-center">
            {email.emailAddress}
            {email.id === user.primaryEmailAddressId && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Primary</span>
            )}
          </div>
        ))}</div>
      </div>
    </div>
  );
} 