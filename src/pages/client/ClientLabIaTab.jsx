import { Link, useOutletContext } from 'react-router-dom'
import { AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import PdfDropzone from '@/components/PdfDropzone'
import AiLabReviewItem from '@/components/AiLabReviewItem'
import { useAiLabExtraction } from '@/hooks/useAiLabExtraction'

function ClientLabIaTab() {
  const { clientId } = useOutletContext()
  const {
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
  } = useAiLabExtraction(clientId)

  const isReviewing = extractionStatus === 'done'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Importar cronograma
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Envie o cronograma em PDF, revise os posts que a IA identificou e importe todos de uma vez
          como rascunhos na coluna Ideias.
        </p>
      </div>

      {!isReviewing && (
        <div className="flex flex-col gap-3">
          <PdfDropzone
            file={file}
            onFileAccepted={selectFile}
            onClear={clearFile}
            disabled={extractionStatus === 'extracting'}
          />

          {extractionStatus === 'extracting' ? (
            <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              IA lendo o documento...
            </div>
          ) : (
            <Button type="button" className="w-fit" onClick={extract} disabled={!file}>
              <Sparkles className="h-4 w-4 shrink-0" />
              Extrair posts
            </Button>
          )}

          {extractionStatus === 'error' && (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
                <p className="text-sm text-foreground">{extractionError}</p>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" onClick={extract}>
                  Tentar novamente
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={clearFile}>
                  Escolher outro arquivo
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {isReviewing && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {items.length === 0
                ? 'Nenhum post restante para importar.'
                : `${items.length} post(s) encontrado(s). Revise antes de importar.`}
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={clearFile} disabled={isImporting}>
                Cancelar
              </Button>
              <Button type="button" onClick={importItems} disabled={items.length === 0 || isImporting}>
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    Importando...
                  </>
                ) : (
                  `Importar ${items.length} posts`
                )}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <AiLabReviewItem
                key={item.localId}
                item={item}
                onChange={(patch) => updateItem(item.localId, patch)}
                onRemove={() => removeItem(item.localId)}
                disabled={isImporting}
              />
            ))}
          </div>
        </div>
      )}

      {!isReviewing && extractionStatus === 'idle' && !file && (
        <p className="text-sm text-muted-foreground">
          Os posts importados aparecem como rascunhos no{' '}
          <Link to="../workflow" className="font-medium text-primary underline underline-offset-4">
            Workflow
          </Link>
          , prontos para receber a arte e as contas.
        </p>
      )}
    </div>
  )
}

export default ClientLabIaTab
