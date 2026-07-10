import MediaDropzone from './components/MediaDropzone'
import CaptionField from './components/CaptionField'
import PlatformSelector from './components/PlatformSelector'
import PublishButton from './components/PublishButton'
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
    ensureAccountsLoaded,
  } = usePublishContext()

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
            <PublishButton
              canPublish={canPublish}
              isPublishing={isPublishing}
              isVideo={isVideo}
              onClick={handlePublish}
            />
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
    </div>
  )
}

export default App
