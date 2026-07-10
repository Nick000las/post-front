import { useState } from 'react'
import MediaDropzone from './components/MediaDropzone'
import CaptionField from './components/CaptionField'
import PlatformSelector from './components/PlatformSelector'
import PublishButton from './components/PublishButton'
import SaveDraftButton from './components/SaveDraftButton'
import ConfirmActionSheet from './components/ConfirmActionSheet'
import AccountDrawer from './components/AccountDrawer'
import { usePublishContext } from '@/contexts/PublishContext'

function App() {
  const {
    file,
    previewUrl,
    caption,
    setCaption,
    selectedPlatforms,
    isPublishing,
    isSavingDraft,
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
    ensureAccountsLoaded,
  } = usePublishContext()

  const [showPublishConfirm, setShowPublishConfirm] = useState(false)
  const accountCount = Object.values(selectedAccounts).flat().length

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 md:px-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Publicar Post
          </h1>
          <p className="text-muted-foreground mt-1">
            Selecione uma imagem ou vídeo, escreva a legenda e publique nas suas redes sociais.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <MediaDropzone
              file={file}
              previewUrl={previewUrl}
              onFileAccepted={handleFileAccepted}
              onClear={handleClear}
            />
            <CaptionField value={caption} onChange={setCaption} />
          </div>

          <div className="flex flex-col gap-4">
            <PlatformSelector
              selectedPlatforms={selectedPlatforms}
              onToggle={handlePlatformToggle}
              onOpenDrawer={handleOpenAccountDrawer}
              accountLabels={accountLabels}
            />
            <div className="flex gap-2">
              <SaveDraftButton
                canSave={canPublish}
                isSavingDraft={isSavingDraft}
                onClick={handleSaveDraft}
              />
              <PublishButton
                canPublish={canPublish}
                isPublishing={isPublishing}
                isVideo={isVideo}
                onClick={() => setShowPublishConfirm(true)}
              />
            </div>
          </div>
        </div>
      </div>

      <AccountDrawer
        open={activeDrawerPlatform !== null}
        onOpenChange={handleDrawerOpenChange}
        platformName={activeDrawerPlatformMeta?.name ?? ''}
        accounts={activeDrawerAccounts}
        status={accountsStatus}
        error={accountsError}
        selectedAccountIds={activeDrawerPlatform ? (selectedAccounts[activeDrawerPlatform] ?? []) : []}
        onToggleAccount={handleToggleAccount}
        onRetry={ensureAccountsLoaded}
      />

      <ConfirmActionSheet
        open={showPublishConfirm}
        onOpenChange={setShowPublishConfirm}
        title="Confirmar publicação"
        description="Revise os detalhes antes de publicar."
        confirmText="Confirmar publicação"
        loadingText={isVideo ? 'Publicando vídeo, isso pode levar alguns minutos...' : 'Publicando...'}
        isLoading={isPublishing}
        onConfirm={handlePublish}
      >
        <div className="rounded-lg border px-3 py-2.5 flex flex-col gap-2 text-sm">
          <p className="text-foreground">
            <span className="font-medium">Legenda: </span>
            {caption.trim() ? (
              <span className="line-clamp-3">{caption}</span>
            ) : (
              <span className="text-muted-foreground">Sem legenda</span>
            )}
          </p>
          <p className="text-foreground">
            <span className="font-medium">Contas selecionadas: </span>
            {accountCount}
          </p>
          {isVideo && (
            <p className="text-xs text-muted-foreground">
              Vídeos podem levar alguns minutos para publicar.
            </p>
          )}
        </div>
      </ConfirmActionSheet>
    </div>
  )
}

export default App
