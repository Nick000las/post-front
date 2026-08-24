import { useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import MediaDropzone from './components/MediaDropzone'
import CaptionField from './components/CaptionField'
import PlatformSelector from './components/PlatformSelector'
import PublishButton from './components/PublishButton'
import SaveDraftButton from './components/SaveDraftButton'
import ScheduleButton from './components/ScheduleButton'
import PublishAsClientSelect from './components/PublishAsClientSelect'
import ConfirmActionSheet from './components/ConfirmActionSheet'
import AccountDrawer from './components/AccountDrawer'
import WarningBanner from './components/WarningBanner'
import PostFormatToggle from './components/PostFormatToggle'
import StorySchedulePicker from './components/StorySchedulePicker'
import { usePublishContext } from '@/contexts/PublishContext'
import {
  formatCarouselVideoConflictMessage,
  formatStoryPlatformConflictMessage,
} from '@/lib/platformCompat'

function App() {
  const {
    mediaItems,
    postFormat,
    formatBehavior,
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
    storyPlatformConflicts,
    captionLimit,
    captionOverLimit,
    accountLabels,
    activeDrawerPlatformMeta,
    activeDrawerAccounts,
    handleFormatChange,
    handleFilesAdded,
    handleRemoveFile,
    handlePlatformToggle,
    handleOpenAccountDrawer,
    handleDrawerOpenChange,
    handleToggleAccount,
    handlePublish,
    handleSaveDraft,
    handleSchedule,
    handleScheduleStory,
    ensureAccountsLoaded,
  } = usePublishContext()

  const noClientSelected = selectedClientId === null

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

        <div className="mb-6 max-w-sm">
          <PublishAsClientSelect
            clients={clients}
            clientsStatus={clientsStatus}
            selectedClientId={selectedClientId}
            onChange={setSelectedClientId}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <PostFormatToggle
              value={postFormat}
              onChange={handleFormatChange}
              disabled={isPublishing || isSavingDraft || isScheduling}
            />
            <MediaDropzone
              items={mediaItems}
              onFilesAdded={handleFilesAdded}
              onRemoveItem={handleRemoveFile}
              maxFiles={formatBehavior.maxFiles}
            />
            {/* Story não tem legenda — o campo some, não vira "nota interna". */}
            {formatBehavior.showCaptionField && (
              <CaptionField value={caption} onChange={setCaption} selectedPlatforms={selectedPlatforms} />
            )}
          </div>

          <div className="flex flex-col gap-4">
            <PlatformSelector
              selectedPlatforms={selectedPlatforms}
              onToggle={handlePlatformToggle}
              onOpenDrawer={handleOpenAccountDrawer}
              accountLabels={accountLabels}
              disabled={noClientSelected}
              disabledPlatformIds={formatBehavior.disabledPlatforms}
            />
            {noClientSelected && (
              <p className="text-sm text-muted-foreground">
                Selecione um cliente para escolher as contas e publicar.
              </p>
            )}
            {carouselVideoConflicts.length > 0 && (
              <WarningBanner icon={AlertTriangle}>
                {formatCarouselVideoConflictMessage(carouselVideoConflicts)}
              </WarningBanner>
            )}
            {storyPlatformConflicts.length > 0 && (
              <WarningBanner icon={AlertTriangle}>
                {formatStoryPlatformConflictMessage(storyPlatformConflicts)}
              </WarningBanner>
            )}
            {captionOverLimit && (
              <WarningBanner icon={AlertTriangle}>
                A legenda passa do limite de {captionLimit} caracteres da rede mais restrita selecionada.
              </WarningBanner>
            )}
            <div className="flex flex-wrap gap-2">
              <SaveDraftButton
                canSave={canPublish}
                isSavingDraft={isSavingDraft}
                onClick={handleSaveDraft}
              />
              {/* Story agenda uma LISTA de datas (avulsa ou série recorrente) — picker e
                  handler próprios, em vez de um handleSchedule que adivinha o tipo do argumento. */}
              {formatBehavior.showRecurrencePanel ? (
                <StorySchedulePicker
                  disabled={!canPublish}
                  isScheduling={isScheduling}
                  onConfirm={handleScheduleStory}
                />
              ) : (
                <ScheduleButton
                  disabled={!canPublish}
                  isScheduling={isScheduling}
                  onConfirm={handleSchedule}
                />
              )}
              <PublishButton
                canPublish={canPublish}
                isPublishing={isPublishing}
                hasVideo={hasVideo}
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
        loadingText={hasVideo ? 'Publicando vídeo, isso pode levar alguns minutos...' : 'Publicando...'}
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
          {hasVideo && (
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
