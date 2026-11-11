import Link from 'next/link';
import AuthForm from '@/components/auth/AuthForm';
import { Gamepad2 } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-slate-100">
      <Link href="/" className="mb-8 flex items-center gap-2.5 text-xl font-bold text-white">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <Gamepad2 className="h-6 w-6" />
        </div>
        <span>VN Studio</span>
      </Link>

      <AuthForm />
    </div>
  );
}
