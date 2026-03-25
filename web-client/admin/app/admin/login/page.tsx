import { LoginForm } from "@/modules/auth/components/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#533afd] rounded-full mix-blend-multiply filter blur-[150px] opacity-[0.15] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500 rounded-full mix-blend-multiply filter blur-[150px] opacity-[0.1] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="w-full max-w-[480px] relative z-10">
        <LoginForm />
      </div>
    </div>
  );
}
