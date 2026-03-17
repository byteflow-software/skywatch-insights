import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      await login.mutateAsync(data);
      navigate(from, { replace: true });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Credenciais inválidas. Tente novamente.';
      setServerError(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-midnight px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-midnight">
            SkyWatch <span className="text-skyblue">Insights</span>
          </h1>
          <p className="mt-2 text-sm text-slate-custom">
            Entre na sua conta para continuar
          </p>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-custom">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="seu@email.com"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-midnight outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 ${
                errors.email ? 'border-red-400' : 'border-gray-300'
              }`}
              {...register('email')}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-custom">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="********"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-midnight outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 ${
                errors.password ? 'border-red-400' : 'border-gray-300'
              }`}
              {...register('password')}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-skyblue py-2.5 text-sm font-semibold text-white transition hover:bg-skyblue/90 disabled:opacity-50"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Register link */}
        <p className="mt-6 text-center text-sm text-slate-custom">
          Não tem uma conta?{' '}
          <Link to="/register" className="font-medium text-skyblue hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
