/**
 * S05 ログイン。
 */

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type SubmitEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ApiRequestError } from '@/lib/apiClient'
import { loginSchema, type LoginInput } from '@/lib/schemas'
import { AuthFormLayout } from '@/components/form/AuthFormLayout'
import { AuthFormPanel } from '@/components/form/AuthFormPanel'
import { FormError } from '@/components/form/FormError'
import { TextField } from '@/components/form/TextField'
import { SubmitButton } from '@/components/form/SubmitButton'

const INITIAL_VALUES: LoginInput = {
  email: '',
  password: '',
}

// 入力欄ごとのエラーメッセージを持つ型。エラーがない項目は undefined になる。
type LoginFormErrors = Partial<Record<keyof LoginInput, string>>

function getRedirectPath() {
  // RequireAuth から /login?redirect=/checkout のように渡された戻り先を読む。
  const params = new URLSearchParams(window.location.search)
  const redirect = params.get('redirect')

  if (!redirect) return '/'

  try {
    const url = new URL(redirect, window.location.origin)

    // 外部サイトへの不正なリダイレクトを防ぐ
    if (url.origin !== window.location.origin) {
      return '/'
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return '/'
  }
}

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoggedIn, isReady } = useAuth()

  // values: 入力中の値、fieldErrors: 入力欄ごとのエラー、formError: フォーム全体のエラー。
  const [values, setValues] = useState<LoginInput>(INITIAL_VALUES)
  const [fieldErrors, setFieldErrors] = useState<LoginFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // すでにログイン済みなら、ログインフォームを見せず戻り先へ移動する。
  useEffect(() => {
    if (isReady && isLoggedIn) {
      router.replace(getRedirectPath())
    }
  }, [isReady, isLoggedIn, router])

  // 認証状態の復元中・リダイレクト中はフォームを隠す
  if (!isReady || isLoggedIn) {
    return null
  }

  function updateField(field: keyof LoginInput, value: string) {
    // 入力された項目だけを更新し、他の項目の値はそのまま残す。
    setValues((current) => ({
      ...current,
      [field]: value,
    }))

    // 入力し直した項目のエラーは一度消して、再送信時に改めて検証する。
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }))

    setFormError(null)
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    // 送信中に Enter 連打などで同じAPIを何度も呼ばないようにする。
    if (isSubmitting) {
      return
    }

    setFieldErrors({})
    setFormError(null)

    // APIへ送る前に、フロント側で zod のルールに合っているか確認する。
    const parsed = loginSchema.safeParse(values)

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors

      setFieldErrors({
        email: errors.email?.[0],
        password: errors.password?.[0],
      })
      return
    }

    setIsSubmitting(true)

    try {
      await login(parsed.data.email, parsed.data.password)
      const redirectPath = getRedirectPath()
      // ログイン成功後は、元の認証必須ページがあればそこへ、なければトップへ移動する。
      router.replace(redirectPath)
    } catch (error: unknown) {
      if (error instanceof ApiRequestError) {
        // 認証失敗は入力欄ではなく、フォーム全体のエラーとして見せる。
        if (error.code === 'UNAUTHORIZED') {
          setFieldErrors({})
          setFormError('メールアドレスまたはパスワードが正しくありません。')
          return
        }

        const serverErrors = error.fieldErrors()

        // APIから項目別エラーが返された場合は、対応する入力欄の下へ表示する。
        const nextFieldErrors: LoginFormErrors = {
          email: serverErrors.email,
          password: serverErrors.password,
        }

        setFieldErrors(nextFieldErrors)

        const hasFieldError = Object.values(nextFieldErrors).some(Boolean)

        if (!hasFieldError) {
          // VALIDATION_ERROR は入力内容に関するエラーなので、API の message を使う。
          if (error.code === 'VALIDATION_ERROR') {
            setFormError(error.message)
          } else {
            setFormError(
              'ログインに失敗しました。時間をおいて再度お試しください。',
            )
          }
        } else if (error.code !== 'VALIDATION_ERROR') {
          setFormError(
            'ログインに失敗しました。時間をおいて再度お試しください。',
          )
        }
      } else {
        // ApiRequestError 以外は想定外なので、生の例外メッセージは画面に出さない。
        setFormError(
          '通信エラーが発生しました。時間をおいて再度お試しください。',
        )
      }
    } finally {
      // 成功・失敗どちらでも送信中状態を解除する。
      setIsSubmitting(false)
    }
  }

  return (
    <AuthFormLayout
      title="ログイン"
      bottomLink={
        <Link className="font-semibold text-ink underline" href="/signup">
          会員登録はこちら →
        </Link>
      }
    >
      <AuthFormPanel onSubmit={handleSubmit} noValidate>
        <FormError message={formError} />

        <TextField
          id="email"
          label="メールアドレス"
          type="email"
          value={values.email}
          error={fieldErrors.email}
          onChange={(value) => updateField('email', value)}
          autoComplete="email"
        />

        <TextField
          id="password"
          label="パスワード"
          type="password"
          value={values.password}
          error={fieldErrors.password}
          onChange={(value) => updateField('password', value)}
          autoComplete="current-password"
        />

        <SubmitButton
          isSubmitting={isSubmitting}
          submittingLabel="ログイン中です…"
        >
          ログイン
        </SubmitButton>
      </AuthFormPanel>
    </AuthFormLayout>
  )
}
