import { LoginForm } from "@/modules/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Cake Shop
          </h1>
          <p className="text-sm text-gray-500 mt-2 font-medium">Bánh ngon giao tận tay bạn</p>
        </div>
        
        <LoginForm mode="user" />
      </div>
    </div>
  );
}
