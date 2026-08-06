import { useCallback, useRef, useState } from 'react'
import { toast } from 'sonner'
import { extrairPostsDoPdf, importarPostsExtraidos } from '@/api/aiLab'

// Estado da extração vive só aqui, isolado do Kanban: nada do que o usuário edita nesta lista
// existe no servidor até o "Importar" — cada item ganha um localId só pra key do React.
export function useAiLabExtraction(clientId) {
  const [file, setFile] = useState(null)
  const [items, setItems] = useState([])
  const [extractionStatus, setExtractionStatus] = useState('idle') // idle | extracting | done | error
  const [extractionError, setExtractionError] = useState(null)
  const [isImporting, setIsImporting] = useState(false)
  const localIdRef = useRef(0)

  const selectFile = useCallback((accepted) => {
    setFile(accepted)
    setExtractionStatus('idle')
    setExtractionError(null)
    setItems([])
  }, [])

  const clearFile = useCallback(() => {
    setFile(null)
    setExtractionStatus('idle')
    setExtractionError(null)
    setItems([])
  }, [])

  const extract = useCallback(async () => {
    if (!file) return false

    setExtractionStatus('extracting')
    setExtractionError(null)
    try {
      const posts = await extrairPostsDoPdf(file, clientId)
      setItems(posts.map((post) => ({ ...post, localId: ++localIdRef.current })))
      setExtractionStatus('done')
      return true
    } catch (err) {
      setExtractionError(err.message ?? 'Erro ao extrair posts do PDF')
      setExtractionStatus('error')
      return false
    }
  }, [clientId, file])

  const updateItem = useCallback((localId, patch) => {
    setItems((prev) => prev.map((item) => (item.localId === localId ? { ...item, ...patch } : item)))
  }, [])

  const removeItem = useCallback((localId) => {
    setItems((prev) => prev.filter((item) => item.localId !== localId))
  }, [])

  const importItems = useCallback(async () => {
    setIsImporting(true)
    try {
      const payload = items.map(({ caption, format, suggestedDate }) => ({ caption, format, suggestedDate }))
      const data = await importarPostsExtraidos(clientId, payload)
      toast.success(data.message ?? 'Posts importados com sucesso!')
      clearFile()
      return true
    } catch (err) {
      toast.error('Falha ao importar os posts', { description: err.message })
      return false
    } finally {
      setIsImporting(false)
    }
  }, [clientId, items, clearFile])

  return {
    file,
    items,
    extractionStatus,
    extractionError,
    isImporting,
    selectFile,
    clearFile,
    extract,
    updateItem,
    removeItem,
    importItems,
  }
}
