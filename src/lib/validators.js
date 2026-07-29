const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const MIN_PASSWORD_LENGTH = 6

export function validateLoginForm({ email, password }) {
  if (!email.trim()) return 'Informe o e-mail.'
  if (!EMAIL_REGEX.test(email.trim())) return 'Informe um e-mail válido.'
  if (!password) return 'Informe a senha.'
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`
  }
  return null
}

export function validateRegisterForm({ username, email, password, confirmPassword }) {
  if (!username.trim()) return 'Informe um nome de usuário.'
  if (!email.trim()) return 'Informe o e-mail.'
  if (!EMAIL_REGEX.test(email.trim())) return 'Informe um e-mail válido.'
  if (!password) return 'Informe a senha.'
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`
  }
  if (password !== confirmPassword) return 'As senhas não coincidem.'
  return null
}

const NUMERIC_ID_REGEX = /^\d+$/

// Valida o formato do platformAccountId conforme a plataforma escolhida. O
// backend não valida formato nem token no cadastro — só descobre erro na
// hora de publicar de verdade — então essa checagem existe só para dar
// feedback imediato no front, não substitui a validação real do backend.
function validatePlatformAccountId(plataforma, value) {
  const trimmed = value.trim()
  if (!trimmed) return 'Informe o identificador da conta.'

  if (plataforma === 'instagram' && !NUMERIC_ID_REGEX.test(trimmed)) {
    return 'Instagram Business Account ID deve ser numérico.'
  }
  if (plataforma === 'facebook' && !NUMERIC_ID_REGEX.test(trimmed)) {
    return 'Page ID deve ser numérico.'
  }
  if (plataforma === 'linkedin' && !trimmed.startsWith('urn:li:')) {
    return 'URN do LinkedIn deve começar com "urn:li:".'
  }
  // TikTok: qualquer texto não-vazio já é suficiente.

  return null
}

export function validateAccountForm({ nome, plataforma, instagramId, accessToken }, { isEdit = false } = {}) {
  if (!nome.trim()) return 'Informe o nome da conta.'
  if (!plataforma) return 'Selecione uma plataforma.'

  if (!isEdit || instagramId.trim()) {
    const idError = validatePlatformAccountId(plataforma, instagramId)
    if (idError) return idError
  }

  if (!isEdit && !accessToken.trim()) return 'Informe o token de acesso.'
  return null
}
