/**
 * S04 会員登録。
 */

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type SubmitEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ApiRequestError } from '@/lib/apiClient'
import { signupSchema, type SignupInput } from '@/lib/schemas'
import { AuthFormLayout } from '@/components/form/AuthFormLayout'
import { AuthFormPanel } from '@/components/form/AuthFormPanel'
import { FormError } from '@/components/form/FormError'
import { TextField } from '@/components/form/TextField'
import { SubmitButton } from '@/components/form/SubmitButton'

// 入力欄ごとのエラーメッセージを持つ型。エラーがない項目は undefined になる。
type SignupFormErrors = Partial<Record<keyof SignupInput, string | undefined>>

// 一度でも検証対象になった入力欄を記録する型。入力途中のエラー表示を出しすぎないために使う。
type TouchedFields = Partial<Record<keyof SignupInput, boolean>>

// useState の初期値。フォームを空の状態から始める。
const INITIAL_VALUES: SignupInput = {
  name: '',
  email: '',
  password: '',
}

// 送信時に全項目を検証済みとして扱うため、フォームの項目名をまとめて管理する。
const FIELD_NAMES: Array<keyof SignupInput> = ['name', 'email', 'password']

// Zodの検証結果を、各入力欄の下に表示しやすい形式へ変換する。
function validateValues(values: SignupInput): SignupFormErrors {
  const parsed = signupSchema.safeParse(values)

  if (parsed.success) {
    return {}
  }

  const errors = parsed.error.flatten().fieldErrors

  return {
    name: errors.name?.[0],
    email: errors.email?.[0],
    password: errors.password?.[0],
  }
}

function validateField(
  field: keyof SignupInput,
  values: SignupInput,
): string | undefined {
  // スキーマを項目ごとに分けず、送信時と同じルールから対象項目の結果だけを取り出す。
  return validateValues(values)[field]
}

export default function SignupPage() {
  const router = useRouter()
  const { signup, isLoggedIn, isReady } = useAuth()

  // values: 入力中の値、fieldErrors: 入力欄ごとのエラー、formError: フォーム全体のエラー。
  const [values, setValues] = useState<SignupInput>(INITIAL_VALUES)
  const [fieldErrors, setFieldErrors] = useState<SignupFormErrors>({})
  const [touchedFields, setTouchedFields] = useState<TouchedFields>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // すでにログイン済みなら、会員登録フォームを見せずトップへ移動する。
  useEffect(() => {
    if (isReady && isLoggedIn) {
      router.replace('/')
    }
  }, [isReady, isLoggedIn, router])

  // 認証状態の復元中・リダイレクト中はフォームを隠す
  if (!isReady || isLoggedIn) {
    return null
  }

  function updateField(field: keyof SignupInput, value: string) {
    // React の state は直接書き換えず、新しいオブジェクトを作って更新する。
    const nextValues: SignupInput = {
      ...values,
      [field]: value,
    }

    setValues(nextValues)
    setFormError(null)

    // 未操作の項目は入力途中にエラーを出さない。一度検証した項目だけ入力に合わせて再検証する。
    if (!touchedFields[field] && !fieldErrors[field]) {
      return
    }

    setFieldErrors((current) => ({
      ...current,
      [field]: validateField(field, nextValues),
    }))
  }

  function handleBlur(field: keyof SignupInput) {
    // フォーカスが外れた時点で、その項目を初めて検証対象にする。
    setTouchedFields((current) => ({
      ...current,
      [field]: true,
    }))

    setFieldErrors((current) => ({
      ...current,
      [field]: validateField(field, values),
    }))
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    // 送信中に Enter 連打などで同じAPIを何度も呼ばないようにする。
    if (isSubmitting) {
      return
    }

    setFormError(null)

    // 未操作の項目も含め、送信時にはすべての入力エラーを表示する。
    const touchedAllFields = FIELD_NAMES.reduce<TouchedFields>(
      (current, field) => ({
        ...current,
        [field]: true,
      }),
      {},
    )

    setTouchedFields(touchedAllFields)

    // APIへ送る前に、フロント側で zod のルールに合っているか確認する。
    const parsed = signupSchema.safeParse(values)

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors
      setFieldErrors({
        name: errors.name?.[0],
        email: errors.email?.[0],
        password: errors.password?.[0],
      })
      // 最初のエラー項目へフォーカスを移し、キーボード・スクリーンリーダー利用者を修正位置へ誘導する。
      const firstErrorField = FIELD_NAMES.find((field) => errors[field]?.[0])
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.focus()
      }
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)

    try {
      // 検証・整形済みの値だけを認証処理へ渡す。
      await signup(
        parsed.data.name,
        parsed.data.email,
        parsed.data.password,
      )

      // 登録に成功すると AuthContext 側でログイン状態になるため、トップへ移動する。
      router.replace('/')
    } catch (error: unknown) {
      if (error instanceof ApiRequestError) {
        // ApiRequestError は apiClient が作るエラー。status / code / details を安全に参照できる。
        const serverErrors = error.fieldErrors()

        // APIから項目別エラーが返された場合は、対応する入力欄の下へ表示する。
        const nextFieldErrors: SignupFormErrors = {
          name: serverErrors.name,
          email: serverErrors.email,
          password: serverErrors.password,
        }

        setFieldErrors(nextFieldErrors)

        const hasFieldError = Object.values(nextFieldErrors).some(Boolean)

        // 項目に紐づかない失敗だけを、フォーム全体のエラーとして案内する。
        if (!hasFieldError) {
          // CONFLICT など、ユーザーへ見せる想定の業務エラーだけ API の message を使う。
          if (error.code === 'CONFLICT' || error.code === 'VALIDATION_ERROR') {
            setFormError(error.message)
          } else {
            setFormError('会員登録に失敗しました。時間をおいて再度お試しください。')
          }
        }
      } else {
        // ApiRequestError 以外は想定外なので、生の例外メッセージは画面に出さない。
        setFormError('通信エラーが発生しました。時間をおいて再度お試しください。')
      }
    } finally {
      // 成功・失敗どちらでも送信中状態を解除する。
      setIsSubmitting(false)
    }
  }

  return (
    <AuthFormLayout
      title="会員登録"
      bottomLink={
        <Link className="font-semibold text-ink underline" href="/login">
          ログインはこちら →
        </Link>
      }
    >
      <AuthFormPanel onSubmit={handleSubmit} noValidate>
        <FormError message={formError} />

        <TextField
          id="name"
          label="氏名"
          type="text"
          value={values.name}
          error={fieldErrors.name}
          onChange={(value) => updateField('name', value)}
          onBlur={() => handleBlur('name')}
          autoComplete="name"
          maxLength={100}
        />

        <TextField
          id="email"
          label="メールアドレス"
          type="email"
          value={values.email}
          error={fieldErrors.email}
          onChange={(value) => updateField('email', value)}
          onBlur={() => handleBlur('email')}
          autoComplete="email"
          maxLength={255}
        />

        <TextField
          id="password"
          label="パスワード"
          type="password"
          value={values.password}
          error={fieldErrors.password}
          helpText="8〜100文字で入力してください。"
          onChange={(value) => updateField('password', value)}
          onBlur={() => handleBlur('password')}
          autoComplete="new-password"
          maxLength={100}
        />

        <SubmitButton
          isSubmitting={isSubmitting}
          submittingLabel="登録中です…"
        >
          登録する
        </SubmitButton>
      </AuthFormPanel>
    </AuthFormLayout>
  )
}
