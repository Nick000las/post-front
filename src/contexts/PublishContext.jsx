import { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useClientAccounts } from '@/hooks/useClientAccounts'
import { useClients } from '@/hooks/useClients'
import { publishPost, saveDraft, schedulePost } from '@/api/posts'
import { useAuth } from '@/contexts/AuthContext'
import { PLATFORMS } from '@/lib/platforms'
import { VIDEO_SIZE_LIMIT } from '@/lib/constants'
import { summarizePublishResult, toastPublishResult } from '@/lib/publishResult'

const PublishContext = createContext(null)

export function PublishProvider({ children }) {
  const location = useLocation()
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [caption, setCaption] = useState(() => location.state?.caption ?? '')
  const [selectedClientId, setSelectedClientId] = useState(() => location.state?.clientId ?? null)
  const [selectedPlatforms, setSelectedPlatforms] = useState(new Set(['instagram']))
  const [isPublishing, setIsPublishing] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)

  // Contas escolhidas por plataforma, ex: { instagram: ['17841413894963850', '1784141...'] }
  const [selectedAccounts, setSelectedAccounts] = useState({})
  const [activeDrawerPlatform, setActiveDrawerPlatform] = useState(null)
  const { accounts, status: accountsStatus, error: accountsError, ensureLoaded: ensureAccountsLoaded } = useClientAccounts(selectedClientId)
  const { clients, status: clientsStatus } = useClients()
  const { logout } = useAuth()
  const navigate = useNavigate()

  // Ao trocar de cliente, limpa as contas escolhidas do cliente anterior
  // (contas são escopadas por cliente e não fazem sentido entre clientes).
  const prevClientRef = useRef(selectedClientId)
  useEffect(() => {
    if (prevClientRef.current !== selectedClientId) {
      prevClientRef.current = selectedClientId
      setSelectedAccounts({})
      setActiveDrawerPlatform(null)
    }
  }, [selectedClientId])

  const isVideo = file ? file.type.startsWith('video/') : false

  const hasAccountForEverySelectedPlatform = useMemo(
    () => Array.from(selectedPlatforms).every((platformId) => (selectedAccounts[platformId]?.length ?? 0) > 0),
    [selectedPlatforms, selectedAccounts]
  )

  const canPublish = file !== null
    && selectedClientId !== null
    && selectedPlatforms.size > 0
    && hasAccountForEverySelectedPlatform
    && !isPublishing
    && !isSavingDraft
    && !isScheduling

  const accountLabels = useMemo(() => {
    const labels = {}
    for (const platformId of selectedPlatforms) {
      const ids = selectedAccounts[platformId]
      if (!ids || ids.length === 0) continue
      if (ids.length === 1) {
        const account = accounts.find((acc) => acc.id === ids[0])
        if (account) labels[platformId] = account.name
      } else {
        labels[platformId] = `${ids.length} contas selecionadas`
      }
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

  const handleToggleAccount = useCallback((accountId) => {
    if (!activeDrawerPlatform) return
    const platformId = activeDrawerPlatform
    const current = selectedAccounts[platformId] ?? []
    const next = current.includes(accountId)
      ? current.filter((id) => id !== accountId)
      : [...current, accountId]

    setSelectedAccounts(prev => {
      const nextAccounts = { ...prev }
      if (next.length === 0) delete nextAccounts[platformId]
      else nextAccounts[platformId] = next
      return nextAccounts
    })

    // Zerou as contas dessa plataforma: desmarca o checkbox em "Publicar em".
    // O drawer permanece aberto (usuário fecha manualmente).
    if (next.length === 0) {
      setSelectedPlatforms(prev => {
        if (!prev.has(platformId)) return prev
        const nextSet = new Set(prev)
        nextSet.delete(platformId)
        return nextSet
      })
    }
  }, [activeDrawerPlatform, selectedAccounts])

  const handlePublish = async () => {
    if (!file || selectedPlatforms.size === 0) return false
    const accountIds = Object.values(selectedAccounts).flat()
    if (accountIds.length === 0) return false

    setIsPublishing(true)
    try {
      const data = await publishPost(file, caption, accountIds, selectedClientId)
      const { successCount, failCount, description } = summarizePublishResult(data.detalhes ?? [], accounts)
      toastPublishResult({ successCount, failCount, description, successMessage: data.message ?? 'Publicado com sucesso!' })

      // Reseta arquivo/legenda/plataformas só se pelo menos uma conta publicou.
      // selectedAccounts nunca é limpo aqui — mesmo comportamento de hoje.
      if (successCount > 0) {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setFile(null)
        setPreviewUrl(null)
        setCaption('')
        setSelectedPlatforms(new Set(['instagram']))
      }
      return successCount > 0
    } catch (err) {
      if (err.status === 401) {
        await logout()
        navigate('/login')
      } else if (err.status === 500) {
        toast.error('Falha ao publicar', { description: 'Erro no servidor. Tente novamente mais tarde.' })
      } else {
        toast.error('Falha ao publicar', { description: err.message })
      }
      return false
    } finally {
      setIsPublishing(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!file || selectedPlatforms.size === 0) return false
    const accountIds = Object.values(selectedAccounts).flat()
    if (accountIds.length === 0) return false

    setIsSavingDraft(true)
    try {
      await saveDraft(file, caption, accountIds, selectedClientId)
      toast.success('Rascunho salvo com sucesso')

      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setFile(null)
      setPreviewUrl(null)
      setCaption('')
      setSelectedPlatforms(new Set(['instagram']))
      setSelectedAccounts({})
      return true
    } catch (err) {
      if (err.status === 401) {
        await logout()
        navigate('/login')
      } else if (err.status === 500) {
        toast.error('Falha ao salvar rascunho', { description: 'Erro no servidor. Tente novamente mais tarde.' })
      } else {
        toast.error('Falha ao salvar rascunho', { description: err.message })
      }
      return false
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleSchedule = async (date) => {
    if (!file || selectedClientId === null || selectedPlatforms.size === 0) return false
    const accountIds = Object.values(selectedAccounts).flat()
    if (accountIds.length === 0) return false

    if (!(date instanceof Date) || Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
      toast.error('Escolha uma data e hora no futuro')
      return false
    }

    setIsScheduling(true)
    try {
      // toISOString() sempre inclui o offset (Z/UTC), exigido pelo backend.
      const data = await schedulePost(file, caption, accountIds, selectedClientId, date.toISOString())
      const total = data.detalhes?.totalContas ?? accountIds.length
      toast.success(data.message ?? 'Post agendado com sucesso!', {
        description: `Agendado para ${date.toLocaleString('pt-BR')} · ${total} conta(s).`,
      })

      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setFile(null)
      setPreviewUrl(null)
      setCaption('')
      setSelectedPlatforms(new Set(['instagram']))
      setSelectedAccounts({})
      return true
    } catch (err) {
      if (err.status === 401) {
        await logout()
        navigate('/login')
      } else {
        toast.error('Falha ao agendar post', { description: err.message })
      }
      return false
    } finally {
      setIsScheduling(false)
    }
  }

  // O value não usa useMemo: irrelevante para performance com poucos componentes numa
  // única tela. Não introduzir memoização/seletores sem um problema real de re-render.
  const value = {
    file,
    previewUrl,
    caption,
    setCaption,
    selectedClientId,
    setSelectedClientId,
    clients,
    clientsStatus,
    selectedPlatforms,
    isPublishing,
    isSavingDraft,
    isScheduling,
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
    handleToggleAccount,
    handlePublish,
    handleSaveDraft,
    handleSchedule,
    ensureAccountsLoaded,
  }

  return <PublishContext.Provider value={value}>{children}</PublishContext.Provider>
}

export function usePublishContext() {
  const ctx = useContext(PublishContext)
  if (!ctx) throw new Error('usePublishContext deve ser usado dentro de <PublishProvider>')
  return ctx
}
