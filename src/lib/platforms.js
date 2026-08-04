import { FaInstagram, FaFacebook, FaLinkedin, FaTiktok } from 'react-icons/fa'

export const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: FaInstagram, disabled: false, comingSoon: false },
  { id: 'facebook',  name: 'Facebook',  icon: FaFacebook,  disabled: false, comingSoon: false },
  { id: 'linkedin',  name: 'LinkedIn',  icon: FaLinkedin,  disabled: false, comingSoon: false },
  { id: 'tiktok',    name: 'TikTok',    icon: FaTiktok,    disabled: false, comingSoon: false },
]

// Metadados do campo "platformAccountId" por plataforma — usados no formulário
// de conta (label/placeholder) e na validação. O valor de `plataforma` enviado
// ao backend precisa ser exatamente uma dessas chaves (minúsculo, sem variação)
// — o worker faz switch literal nisso.
export const PLATFORM_ACCOUNT_ID_META = {
  instagram: {
    label: 'Instagram Business Account ID',
    placeholder: 'Ex: 17841413894963850',
  },
  facebook: {
    label: 'Page ID',
    placeholder: 'Ex: 102938475610283',
  },
  linkedin: {
    label: 'URN do LinkedIn',
    placeholder: 'Ex: urn:li:organization:12345678',
  },
  tiktok: {
    label: 'Identificador da conta',
    placeholder: 'Ex: id da conta no TikTok',
  },
}
