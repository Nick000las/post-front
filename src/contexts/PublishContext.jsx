import { createContext, useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useClientAccounts } from '@/hooks/useClientAccounts'
import { useClients } from '@/hooks/useClients'
import { publishPost, saveDraft, schedulePost } from '@/api/posts'
import { useAuth } from '@/contexts/AuthContext'
import { PLATFORMS } from '@/lib/platforms'
import { VIDEO_SIZE_LIMIT } from '@/lib/constants'
import { getCarouselVideoConflicts } from '@/lib/platformCompat'

const PublishContext = createContext(null)

export function PublishProvider({ children }) {
  const location = useLocation()
  // Um único array — cada item já carrega seu File e seu preview juntos, pra
  // nunca poder dessincronizar quando um item é removido.
  const [mediaItems, setMediaItems] = useState([])
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

  const hasVideo = mediaItems.some((item) => item.file.type.startsWith('video/'))

  const hasAccountForEverySelectedPlatform = useMemo(
    () => Array.from(selectedPlatforms).every((platformId) => (selectedAccounts[platformId]?.length ?? 0) > 0),
    [selectedPlatforms, selectedAccounts]
  )

  const carouselVideoConflicts = useMemo(
    () => getCarouselVideoConflicts({
      mediaCount: mediaItems.length,
      hasVideo,
      platformIds: Array.from(selectedPlatforms),
    }),
    [mediaItems.length, hasVideo, selectedPlatforms]
  )

  const canPublish = mediaItems.length > 0
    && selectedClientId !== null
    && selectedPlatforms.size > 0
    && hasAccountForEverySelectedPlatform
    && carouselVideoConflicts.length === 0
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

  // Cada arquivo solto vira um item local (File + preview + key estável) —
  // nada é enviado à API aqui, é só estado de UI até o submit.
  const handleFilesAdded = useCallback((newFiles) => {
    const accepted = []
    for (const file of newFiles) {
      if (file.type.startsWith('video/') && file.size > VIDEO_SIZE_LIMIT) {
        toast.error('Vídeo muito grande', { description: `"${file.name}" excede o limite de 300MB e foi ignorado.` })
        continue
      }
      accepted.push({ key: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) })
    }
    if (accepted.length > 0) setMediaItems((prev) => [...prev, ...accepted])
  }, [])

  const handleRemoveFile = useCallback((key) => {
    setMediaItems((prev) => {
      const item = prev.find((m) => m.key === key)
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((m) => m.key !== key)
    })
  }, [])

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

  // Revoga todos os object URLs pendentes e zera o array — chamado nos 3
  // fluxos de submit bem-sucedido, pra não repetir o loop de revoke 3x.
  const resetMedia = () => {
    for (const item of mediaItems) URL.revokeObjectURL(item.previewUrl)
    setMediaItems([])
  }

  const handlePublish = async () => {
    if (mediaItems.length === 0 || selectedPlatforms.size === 0) return false
    const accountIds = Object.values(selectedAccounts).flat()
    if (accountIds.length === 0) return false

    setIsPublishing(true)
    try {
      const data = await publishPost(mediaItems.map((m) => m.file), caption, accountIds, selectedClientId)
      // A publicação é assíncrona (fila): o 202 só confirma que os jobs foram
      // enfileirados, não o resultado por conta — isso só existe depois, via
      // GET /posts/:id/status ou no Feed.
      const total = data.detalhes?.totalContas ?? accountIds.length
      toast.success(data.message ?? 'Publicado com sucesso!', {
        description: `${total} conta(s) em processamento.`,
      })

      // selectedAccounts nunca é limpo aqui — mesmo comportamento de hoje.
      resetMedia()
      setCaption('')
      setSelectedPlatforms(new Set(['instagram']))
      return true
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
    if (mediaItems.length === 0 || selectedPlatforms.size === 0) return false
    const accountIds = Object.values(selectedAccounts).flat()
    if (accountIds.length === 0) return false

    setIsSavingDraft(true)
    try {
      await saveDraft(mediaItems.map((m) => m.file), caption, accountIds, selectedClientId)
      toast.success('Rascunho salvo com sucesso')

      resetMedia()
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
    if (mediaItems.length === 0 || selectedClientId === null || selectedPlatforms.size === 0) return false
    const accountIds = Object.values(selectedAccounts).flat()
    if (accountIds.length === 0) return false

    if (!(date instanceof Date) || Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
      toast.error('Escolha uma data e hora no futuro')
      return false
    }

    setIsScheduling(true)
    try {
      // toISOString() sempre inclui o offset (Z/UTC), exigido pelo backend.
      const data = await schedulePost(mediaItems.map((m) => m.file), caption, accountIds, selectedClientId, date.toISOString())
      const total = data.detalhes?.totalContas ?? accountIds.length
      toast.success(data.message ?? 'Post agendado com sucesso!', {
        description: `Agendado para ${date.toLocaleString('pt-BR')} · ${total} conta(s).`,
      })

      resetMedia()
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
    mediaItems,
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
    hasVideo,
    canPublish,
    carouselVideoConflicts,
    accountLabels,
    activeDrawerPlatformMeta,
    activeDrawerAccounts,
    handleFilesAdded,
    handleRemoveFile,
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
