import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema, type RegisterFormData } from '@/lib/schemas/auth';
import { useAuth } from '@/hooks/useAuth';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerMutation, login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await registerMutation.mutateAsync(data);
      // Auto-login after successful registration
      await login.mutateAsync({ email: data.email, password: data.password });
      navigate('/onboarding', { replace: true });
    } catch (err: any) {
      const message =
        err?.response?.data?.message || 'Erro ao criar conta. Tente novamente.';
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
            Crie sua conta e comece a explorar o c&eacute;u
          </p>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-custom">
              Nome
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Seu nome"
              className={`w-full rounded-lg border px-4 py-2.5 text-sm text-midnight outline-none transition focus:border-skyblue focus:ring-2 focus:ring-skyblue/20 ${
                errors.name ? 'border-red-400' : 'border-gray-300'
              }`}
              {...register('name')}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

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
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
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
            {isSubmitting ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-slate-custom">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-medium text-skyblue hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
