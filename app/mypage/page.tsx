/**
 * S11 マイページ
 */
'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { RequireAuth } from '@/components/RequireAuth'
import { FormError } from '@/components/form/FormError'
import { TextField } from '@/components/form/TextField'
import {
  createTouchedFields,
  focusFirstErrorField,
  type TouchedFields,
} from '@/lib/formValidation'
import { PageLayout } from '@/components/layout/PageLayout'
import { PageTitle } from '@/components/layout/PageTitle'
import { EmptyState, ErrorState, LoadingState } from '@/components/status'
import { useAuth } from '@/contexts/AuthContext'
import { api, ApiRequestError } from '@/lib/apiClient'
import { profileUpdateSchema } from '@/lib/schemas'
import type { User, UserResponse } from '@/lib/types'

type ProfileFormValues = {
  name: string
  postal_code: string
  address: string
  phone: string
}

type ProfileFormErrors = Partial<
  Record<keyof ProfileFormValues, string | undefined>
>

type ProfileUpdatePayload = {
  name: string
  postal_code?: string
  address?: string
  phone?: string
}

type ProfileFieldName = keyof ProfileFormValues & string
type ProfileTouchedFields = TouchedFields<ProfileFieldName>

type ProfileItem = {
  label: string
  value: string | null | undefined
}

// 未登録の任意項目は空欄にせず、閲覧モードで状態が分かる文言に置き換える。
const EMPTY_LABEL = '未登録'

// フォーム上の入力順。送信時のtouched化と、最初のエラー項目へのフォーカス移動に使う。
const FIELD_NAMES: ProfileFieldName[] = [
  'name',
  'postal_code',
  'address',
  'phone',
]

const CLEARED_REGISTERED_FIELD_MESSAGES = {
  postal_code: '登録済みの郵便番号は空欄にできません。',
  address: '登録済みの住所は空欄にできません。',
  phone: '登録済みの電話番号は空欄にできません。',
} as const

function displayValue(value: string | null | undefined): string {
  return value && value.trim().length > 0 ? value : EMPTY_LABEL
}

// APIのnullをフォームで扱いやすい空文字へ変換する。
function createInitialValues(user: User | null): ProfileFormValues {
  return {
    name: user?.name ?? '',
    postal_code: user?.postal_code ?? '',
    address: user?.address ?? '',
    phone: user?.phone ?? '',
  }
}

// zodの検証結果を TextField に渡しやすい「フィールド名 → 先頭エラー文」に整形する。
function validateValues(values: ProfileFormValues): ProfileFormErrors {
  const parsed = profileUpdateSchema.safeParse(values)

  if (parsed.success) {
    return {}
  }

  const errors = parsed.error.flatten().fieldErrors

  return {
    name: errors.name?.[0],
    postal_code: errors.postal_code?.[0],
    address: errors.address?.[0],
    phone: errors.phone?.[0],
  }
}

function validateField(
  field: keyof ProfileFormValues,
  values: ProfileFormValues,
): string | undefined {
  // 項目単体の独自ルールを持たず、送信時と同じ schema から対象項目だけ取り出す。
  return validateValues(values)[field]
}

function optionalValue(value: string): string | undefined {
  const trimmed = value.trim()

  return trimmed.length > 0 ? trimmed : undefined
}

function isClearedRegisteredValue(
  currentValue: string | null | undefined,
  nextValue: string,
): boolean {
  return (
    currentValue !== null &&
    currentValue !== undefined &&
    currentValue.trim().length > 0 &&
    nextValue.trim().length === 0
  )
}

function validateClearedRegisteredField(
  field: keyof ProfileFormValues,
  user: User,
  values: ProfileFormValues,
): string | undefined {
  // nameは必須項目でzod側のmin(1)が検証するため、このチェックの対象外。
  if (field === 'name') {
    return undefined
  }

  return isClearedRegisteredValue(user[field], values[field])
    ? CLEARED_REGISTERED_FIELD_MESSAGES[field]
    : undefined
}

function validateClearedRegisteredFields(
  user: User,
  values: ProfileFormValues,
): ProfileFormErrors {
  return {
    postal_code: validateClearedRegisteredField('postal_code', user, values),
    address: validateClearedRegisteredField('address', user, values),
    phone: validateClearedRegisteredField('phone', user, values),
  }
}

function mergeFieldErrors(
  primary: ProfileFormErrors,
  secondary: ProfileFormErrors,
): ProfileFormErrors {
  return FIELD_NAMES.reduce<ProfileFormErrors>(
    (merged, field) => ({
      ...merged,
      [field]: primary[field] ?? secondary[field],
    }),
    {},
  )
}

function validateFieldForDisplay(
  field: keyof ProfileFormValues,
  values: ProfileFormValues,
  user: User | null,
): string | undefined {
  return (
    validateField(field, values) ??
    (user ? validateClearedRegisteredField(field, user, values) : undefined)
  )
}

function createUpdatePayload(values: ProfileFormValues): ProfileUpdatePayload {
  // バックエンドのoptional()は「未送信」は許可するが、空文字は min(1) に引っかかるため送信前に除外する。
  return {
    name: values.name,
    postal_code: optionalValue(values.postal_code),
    address: optionalValue(values.address),
    phone: optionalValue(values.phone),
  }
}

function MyPageContent() {
  const { setUser, user } = useAuth()

  // profileUserは画面表示用の最新ユーザー。user は認証ガードと取得IDの起点として使う。
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // formValuesは編集モード専用。キャンセル時にprofileUserから復元する。
  const [formValues, setFormValues] = useState<ProfileFormValues>(() =>
    createInitialValues(user),
  )

  // touchedFieldsは「エラー表示を始めた入力欄」を記録し、未操作の項目に入力中からエラーを出さないために使う。
  const [fieldErrors, setFieldErrors] = useState<ProfileFormErrors>({})
  const [touchedFields, setTouchedFields] = useState<ProfileTouchedFields>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const userId = user?.id

  // ページ表示時にサーバーから最新のユーザー情報を取得し、AuthContext側の保存情報も同期する。
  useEffect(() => {
    if (userId === undefined) {
      setProfileUser(null)
      setLoadError('ユーザー情報を取得できませんでした。再度ログインしてください。')
      setLoading(false)
      return
    }

    let isActive = true

    setLoading(true)
    setLoadError(null)
    setSuccessMessage(null)

    api
      .get<UserResponse>(`/api/users/${userId}`)
      .then((data) => {
        if (!isActive) {
          return
        }

        // localStorageの古い情報ではなく、サーバー取得結果を画面と AuthContext の正にする。
        setProfileUser(data.user)
        setUser(data.user)
        setFormValues(createInitialValues(data.user))
      })
      .catch((caught: unknown) => {
        if (!isActive) {
          return
        }

        if (caught instanceof ApiRequestError) {
          setLoadError(
            caught.code === 'UNAUTHORIZED'
              ? 'ログインが必要です。'
              : 'ユーザー情報の取得に失敗しました。時間をおいて再度お試しください。',
          )
        } else {
          setLoadError('通信エラーが発生しました。時間をおいて再度お試しください。')
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [userId])

  // 保存成功メッセージは簡易トーストとして一定時間後に消す。
  useEffect(() => {
    if (!successMessage) {
      return
    }

    const timerId = window.setTimeout(() => {
      setSuccessMessage(null)
    }, 3000)

    return () => {
      window.clearTimeout(timerId)
    }
  }, [successMessage])

  // 閲覧モードの定義リスト用データ。メールは仕様どおり表示のみで編集対象にしない。
  const profileItems = useMemo<ProfileItem[]>(
    () => [
      { label: '名前', value: profileUser?.name },
      { label: 'メール', value: profileUser?.email },
      { label: '郵便番号', value: profileUser?.postal_code },
      { label: '住所', value: profileUser?.address },
      { label: '電話番号', value: profileUser?.phone },
    ],
    [profileUser],
  )

  function handleEdit() {
    // 編集開始時は最新の表示値からフォームを作り直し、前回のエラー表示を持ち越さない。
    setFormValues(createInitialValues(profileUser))
    setFieldErrors({})
    setTouchedFields({})
    setFormError(null)
    setSuccessMessage(null)
    setIsEditing(true)
  }

  function handleCancel() {
    // キャンセル時は入力内容を破棄し、閲覧モードへ戻る。
    setFormValues(createInitialValues(profileUser))
    setFieldErrors({})
    setTouchedFields({})
    setFormError(null)
    setIsEditing(false)
  }

  function updateField(field: keyof ProfileFormValues, value: string) {
    const nextValues: ProfileFormValues = {
      ...formValues,
      [field]: value,
    }

    setFormValues(nextValues)
    setFormError(null)

    // 未操作の項目は入力中にエラーを出さず、blur 済みまたは送信済みの項目だけ再検証する。
    if (!touchedFields[field] && !fieldErrors[field]) {
      return
    }

    setFieldErrors((current) => ({
      ...current,
      [field]: validateFieldForDisplay(field, nextValues, profileUser),
    }))
  }

  function handleBlur(field: keyof ProfileFormValues) {
    // フォーカスが外れた項目は、以降の入力変更でもリアルタイムに再検証する。
    setTouchedFields((current) => ({
      ...current,
      [field]: true,
    }))

    setFieldErrors((current) => ({
      ...current,
      [field]: validateFieldForDisplay(field, formValues, profileUser),
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting || !profileUser) {
      return
    }

    setFormError(null)
    setSuccessMessage(null)

    // 保存時は未操作の項目も含めて、すべてエラー表示対象にする。
    const touchedAllFields = createTouchedFields(FIELD_NAMES)

    setTouchedFields(touchedAllFields)

    const parsed = profileUpdateSchema.safeParse(formValues)

    const zodFieldErrors = parsed.success ? {} : validateValues(formValues)
    const clearedFieldErrors = validateClearedRegisteredFields(
      profileUser,
      formValues,
    )
    const nextFieldErrors = mergeFieldErrors(zodFieldErrors, clearedFieldErrors)

    if (Object.values(nextFieldErrors).some(Boolean)) {
      setFieldErrors(nextFieldErrors)
      // 最初のエラー項目へフォーカスを移し、キーボード・スクリーンリーダー利用者を修正位置へ誘導する。
      focusFirstErrorField(FIELD_NAMES, nextFieldErrors)
      return
    }

    if (!parsed.success) {
      return
    }

    setFieldErrors({})
    setIsSubmitting(true)

    try {
      const data = await api.put<UserResponse>(
        `/api/users/${profileUser.id}`,
        createUpdatePayload(parsed.data),
      )

      setProfileUser(data.user)
      setUser(data.user)
      setFormValues(createInitialValues(data.user))
      setIsEditing(false)
      setSuccessMessage('保存しました')
    } catch (caught: unknown) {
      if (caught instanceof ApiRequestError) {
        // サーバーの VALIDATION_ERROR details も、フロント検証と同じ表示形式へそろえる。
        const serverErrors = caught.fieldErrors()
        const nextFieldErrors: ProfileFormErrors = {
          name: serverErrors.name,
          postal_code: serverErrors.postal_code,
          address: serverErrors.address,
          phone: serverErrors.phone,
        }
        const hasFieldError = Object.values(nextFieldErrors).some(Boolean)

        setFieldErrors(nextFieldErrors)
        setTouchedFields(touchedAllFields)
        // サーバー由来の項目エラーでも、最初の修正箇所へ誘導する。
        focusFirstErrorField(FIELD_NAMES, nextFieldErrors)

        if (!hasFieldError) {
          setFormError(
            caught.code === 'VALIDATION_ERROR'
              ? caught.message
              : 'ユーザー情報の更新に失敗しました。時間をおいて再度お試しください。',
          )
        }
      } else {
        setFormError('通信エラーが発生しました。時間をおいて再度お試しください。')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingState />
  }

  if (loadError) {
    return (
      <ErrorState
        title="ユーザー情報を読み込めませんでした"
        message={loadError}
        retryLabel="再読み込み"
        reload
      />
    )
  }

  if (!profileUser) {
    return <EmptyState title="ユーザー情報がありません" />
  }

  return (
    <div className="space-y-4">
      {successMessage && (
        <p
          className="rounded border border-line bg-paper-soft p-3 text-sm font-semibold text-ink"
          role="status"
        >
          {successMessage}
        </p>
      )}

      <div className="rounded border border-line bg-paper p-5 sm:p-8">
        {!isEditing ? (
          <div>
            <dl className="divide-y divide-line">
              {profileItems.map((item) => (
                <div
                  className="grid gap-1 py-4 sm:grid-cols-3 sm:gap-6"
                  key={item.label}
                >
                  <dt className="text-sm font-semibold text-muted">
                    {item.label}
                  </dt>
                  <dd className="break-words text-ink sm:col-span-2">
                    {displayValue(item.value)}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 flex justify-end">
              <button
                className="btn-primary w-full sm:w-auto"
                onClick={handleEdit}
                type="button"
              >
                編集する
              </button>
            </div>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <FormError message={formError} />

            <TextField
              id="name"
              label="名前"
              type="text"
              value={formValues.name}
              error={fieldErrors.name}
              onChange={(value) => updateField('name', value)}
              onBlur={() => handleBlur('name')}
              autoComplete="name"
              maxLength={100}
            />

            <TextField
              id="postal_code"
              label="郵便番号"
              type="text"
              value={formValues.postal_code}
              error={fieldErrors.postal_code}
              onChange={(value) => updateField('postal_code', value)}
              onBlur={() => handleBlur('postal_code')}
              autoComplete="postal-code"
              helpText="例: 123-4567"
              maxLength={20}
            />

            <TextField
              id="address"
              label="住所"
              type="text"
              value={formValues.address}
              error={fieldErrors.address}
              onChange={(value) => updateField('address', value)}
              onBlur={() => handleBlur('address')}
              autoComplete="street-address"
              maxLength={500}
            />

            <TextField
              id="phone"
              label="電話番号"
              type="tel"
              value={formValues.phone}
              error={fieldErrors.phone}
              onChange={(value) => updateField('phone', value)}
              onBlur={() => handleBlur('phone')}
              autoComplete="tel"
              helpText="数字とハイフンで入力してください。"
              maxLength={30}
            />

            <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
              <button
                className="btn-secondary w-full sm:w-auto"
                onClick={handleCancel}
                type="button"
                disabled={isSubmitting}
              >
                キャンセル
              </button>
              <button
                className="btn-primary w-full sm:w-auto"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? '保存中です…' : '保存'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function MyPage() {
  return (
    <RequireAuth>
      <PageLayout contentClassName="w-full sm:max-w-2xl lg:max-w-3xl">
        <PageTitle title="マイページ" />
        <MyPageContent />
      </PageLayout>
    </RequireAuth>
  )
}
