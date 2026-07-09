import { createContext, useContext, useState, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import { useAccounts } from '@/hooks/useAccounts'
import { publishPost } from '@/api/posts'
import { PLATFORMS } from '@/lib/platforms'
import { VIDEO_SIZE_LIMIT } from '@/lib/constants'

const PublishContext = createContext(null)

export function PublishProvider({ children }) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [caption, setCaption] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState(new Set(['instagram']))
  const [isPublishing, setIsPublishing] = useState(false)

  // Conta escolhida por plataforma, ex: { instagram: '17841413894963850' }
  const [selectedAccounts, setSelectedAccounts] = useState({})
  const [activeDrawerPlatform, setActiveDrawerPlatform] = useState(null)
  const { accounts, status: accountsStatus, error: accountsError, ensureLoaded: ensureAccountsLoaded } = useAccounts()

  const isVideo = file ? file.type.startsWith('video/') : false

  const hasAccountForEverySelectedPlatform = useMemo(
    () => Array.from(selectedPlatforms).every((platformId) => Boolean(selectedAccounts[platformId])),
    [selectedPlatforms, selectedAccounts]
  )

  const canPublish = file !== null
    && selectedPlatforms.size > 0
    && hasAccountForEverySelectedPlatform
    && !isPublishing

  const accountLabels = useMemo(() => {
    const labels = {}
    for (const platformId of selectedPlatforms) {
      const accountId = selectedAccounts[platformId]
      if (!accountId) continue
      const account = accounts.find((acc) => acc.id === accountId)
      if (account) labels[platformId] = account.name
    }
    return labels
  }, [selectedPlatforms, selectedAccounts, accounts])

  const activeDrawerPlatformMeta = PLATFORMS.find((p) => p.id === activeDrawerPlatform)
  const activeDrawerAccounts = useMemo(
    () => accounts.filter((acc) => acc.platform === activeDrawerPlatform),
    [accounts, activeDrawerPlatform]
  )

  const handleFileAccepted = useCallback((newFile, url) => {
    if (newFile.type.startsWith('video/') && newFile.size > VIDEO_SIZE_LIMIT) {
      URL.revokeObjectURL(url)
      toast.error('Vídeo muito grande', { description: 'Limite: 300MB' })
      return
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(newFile)
    setPreviewUrl(url)
  }, [previewUrl])

  const handleClear = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(null)
    setPreviewUrl(null)
  }, [previewUrl])

  const handlePlatformToggle = useCallback((id) => {
    const wasChecked = selectedPlatforms.has(id)

    setSelectedPlatforms(prev => {
      const next = new Set(prev)
      if (wasChecked) next.delete(id)
      else next.add(id)
      return next
    })

    if (wasChecked) {
      // Desmarcou: fecha a gaveta (se estava aberta para essa plataforma) e limpa a conta escolhida
      setSelectedAccounts(prev => {
        if (!(id in prev)) return prev
        const next = { ...prev }
        delete next[id]
        return next
      })
      setActiveDrawerPlatform(current => (current === id ? null : current))
    } else {
      // Marcou: abre a gaveta de contas dessa plataforma (busca as contas de forma lazy)
      ensureAccountsLoaded()
      setActiveDrawerPlatform(id)
    }
  }, [selectedPlatforms, ensureAccountsLoaded])

  const handleOpenAccountDrawer = useCallback((id) => {
    ensureAccountsLoaded()
    setActiveDrawerPlatform(id)
  }, [ensureAccountsLoaded])

  const handleDrawerOpenChange = useCallback((open) => {
    if (!open) setActiveDrawerPlatform(null)
  }, [])

  const handleSelectAccount = useCallback((accountId) => {
    if (!activeDrawerPlatform) return
    setSelectedAccounts(prev => ({ ...prev, [activeDrawerPlatform]: accountId }))
  }, [activeDrawerPlatform])

  const handlePublish = async () => {
    if (!file || selectedPlatforms.size === 0) return
    setIsPublishing(true)

    try {
      const data = await publishPost(file, caption)
      toast.success(data.message ?? 'Publicado com sucesso!', {
        description: `Post ID: ${data.postId}`,
      })

      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setFile(null)
      setPreviewUrl(null)
      setCaption('')
      setSelectedPlatforms(new Set(['instagram']))
    } catch (err) {
      const message = err.name === 'AbortError'
        ? 'A requisição excedeu o tempo limite. Tente novamente.'
        : err.message
      toast.error('Falha ao publicar', { description: message })
    } finally {
      setIsPublishing(false)
    }
  }

  // O value não usa useMemo: irrelevante para performance com poucos componentes numa
  // única tela. Não introduzir memoização/seletores sem um problema real de re-render.
  const value = {
    file,
    previewUrl,
    caption,
    setCaption,
    selectedPlatforms,
    isPublishing,
    selectedAccounts,
    activeDrawerPlatform,
    accountsStatus,
    accountsError,
    isVideo,
    canPublish,
    accountLabels,
    activeDrawerPlatformMeta,
    activeDrawerAccounts,
    handleFileAccepted,
    handleClear,
    handlePlatformToggle,
    handleOpenAccountDrawer,
    handleDrawerOpenChange,
    handleSelectAccount,
    handlePublish,
    ensureAccountsLoaded,
  }

  return <PublishContext.Provider value={value}>{children}</PublishContext.Provider>
}

export function usePublishContext() {
  const ctx = useContext(PublishContext)
  if (!ctx) throw new Error('usePublishContext deve ser usado dentro de <PublishProvider>')
  return ctx
}
