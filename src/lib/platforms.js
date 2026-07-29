import { Camera, Globe, Briefcase, Music2 } from 'lucide-react'

export const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Camera,    disabled: false, comingSoon: false },
  { id: 'facebook',  name: 'Facebook',  icon: Globe,     disabled: false, comingSoon: false },
  { id: 'linkedin',  name: 'LinkedIn',  icon: Briefcase, disabled: false, comingSoon: false },
  { id: 'tiktok',    name: 'TikTok',    icon: Music2,    disabled: false, comingSoon: false },
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
