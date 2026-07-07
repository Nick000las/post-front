import { Camera, Globe, Briefcase, Music2 } from 'lucide-react'

export const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', icon: Camera,    disabled: false, comingSoon: false },
  { id: 'facebook',  name: 'Facebook',  icon: Globe,     disabled: true,  comingSoon: true },
  { id: 'linkedin',  name: 'LinkedIn',  icon: Briefcase, disabled: true,  comingSoon: true },
  { id: 'tiktok',    name: 'TikTok',    icon: Music2,    disabled: true,  comingSoon: true },
]
