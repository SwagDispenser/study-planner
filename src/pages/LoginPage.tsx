import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router'
import { getErrorMessage } from '../api/errors'
import { useAuth } from '../hooks/useAuth'
import { authSchema } from '../schemas/authSchema'
import type { LoginData } from '../schemas/authSchema'
import { getReturnPath } from '../routes/authLoader'
import './LoginPage.scss'

function LoginPage() {
  const { login } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(authSchema), defaultValues: { username: '', password: '' },
  })

  const submit = handleSubmit(async (data) => {
    try {
      await login(data)
      await navigate(getReturnPath(params.get('redirectTo')), { replace: true })
    } catch (error) {
      setError('root', { message: getErrorMessage(error) })
    }
  })

  return (
    <section className="login-page" aria-labelledby="login-heading">
      <h2 className="login-page__heading" id="login-heading">Вхід</h2>
      <p className="login-page__hint">Тестовий акаунт DummyJSON: emilys / emilyspass.</p>
      <form className="login-page__form" onSubmit={submit} noValidate aria-busy={isSubmitting}>
        <div className="login-page__field">
          <label htmlFor="username">Ім’я користувача</label>
          <input className="login-page__control" id="username" autoComplete="username" disabled={isSubmitting}
            {...register('username')} aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? 'username-error' : undefined} />
          {errors.username && <p className="login-page__error" id="username-error" role="alert">{errors.username.message}</p>}
        </div>
        <div className="login-page__field">
          <label htmlFor="password">Пароль</label>
          <input className="login-page__control" id="password" type="password" autoComplete="current-password" disabled={isSubmitting}
            {...register('password')} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} />
          {errors.password && <p className="login-page__error" id="password-error" role="alert">{errors.password.message}</p>}
        </div>
        {errors.root && <p className="login-page__error" role="alert">{errors.root.message}</p>}
        <button className="login-page__submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Вхід…' : 'Увійти'}</button>
      </form>
    </section>
  )
}

export default LoginPage
