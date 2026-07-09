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

export function validateAccountForm({ nome, plataforma, instagramId, accessToken }, { isEdit = false } = {}) {
  if (!nome.trim()) return 'Informe o nome da conta.'
  if (!plataforma) return 'Selecione uma plataforma.'
  if (!isEdit && !instagramId.trim()) return 'Informe o Instagram ID.'
  if (!isEdit && !accessToken.trim()) return 'Informe o token de acesso.'
  return null
}
