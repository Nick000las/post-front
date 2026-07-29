import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PasswordInput from '@/components/PasswordInput'
import { cn } from '@/lib/utils'
import { PLATFORMS, PLATFORM_ACCOUNT_ID_META } from '@/lib/platforms'
import { validateAccountForm } from '@/lib/validators'

function AccountFormSheet({ open, onOpenChange, mode, account, isSubmitting, onCreate, onUpdate }) {
  const isEdit = mode === 'edit'

  const [nome, setNome] = useState('')
  const [plataforma, setPlataforma] = useState('instagram')
  const [instagramId, setInstagramId] = useState('')
  const [accessToken, setAccessToken] = useState('')

  useEffect(() => {
    if (!open) {
      setAccessToken('')
      return
    }

    if (isEdit && account) {
      setNome(account.name ?? '')
      setPlataforma(account.platform ?? 'instagram')
      setInstagramId(account.platform_account_id ?? '')
    } else {
      setNome('')
      setPlataforma('instagram')
      setInstagramId('')
    }
    setAccessToken('')
  }, [open, isEdit, account])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validateAccountForm(
      { nome, plataforma, instagramId, accessToken },
      { isEdit }
    )
    if (validationError) {
      toast.error(validationError)
      return
    }

    if (!isEdit) {
      const ok = await onCreate({
        nome: nome.trim(),
        plataforma,
        platformAccountId: instagramId.trim(),
        access_token: accessToken.trim(),
      })
      if (ok) onOpenChange(false)
      return
    }

    const payload = {}
    if (nome.trim() !== account.name) payload.nome = nome.trim()
    if (plataforma !== account.platform) payload.plataforma = plataforma
    if (instagramId.trim() !== (account.platform_account_id ?? '')) payload.platformAccountId = instagramId.trim()
    if (accessToken.trim() !== '') payload.access_token = accessToken.trim()

    if (Object.keys(payload).length === 0) {
      onOpenChange(false)
      return
    }

    const ok = await onUpdate(account.id, payload)
    if (ok) onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Editar conta' : 'Nova conta'}</SheetTitle>
          <SheetDescription>
            {isEdit ? 'Altere os dados da conta conectada.' : 'Conecte uma nova conta de rede social.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="account-nome">Nome</Label>
            <Input
              id="account-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              disabled={isSubmitting}
              placeholder="Ex: Perfil oficial"
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label>Plataforma</Label>
            <RadioGroup value={plataforma} onValueChange={setPlataforma} className="gap-2">
              {PLATFORMS.map(({ id, name, icon: Icon, disabled }) => (
                <label
                  key={id}
                  htmlFor={`account-platform-${id}`}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors',
                    disabled || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted'
                  )}
                >
                  <RadioGroupItem value={id} id={`account-platform-${id}`} disabled={disabled || isSubmitting} />
                  <Icon className="h-5 w-5 text-foreground shrink-0" />
                  <span className="text-sm font-medium text-foreground flex-1">{name}</span>
                </label>
              ))}
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="account-instagram-id">
              {PLATFORM_ACCOUNT_ID_META[plataforma]?.label ?? 'Identificador da conta'}
            </Label>
            <Input
              id="account-instagram-id"
              value={instagramId}
              onChange={(e) => setInstagramId(e.target.value)}
              disabled={isSubmitting}
              placeholder={PLATFORM_ACCOUNT_ID_META[plataforma]?.placeholder}
            />
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="account-token">Token de acesso</Label>
            <PasswordInput
              id="account-token"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              disabled={isSubmitting}
              placeholder={isEdit ? 'Deixe em branco para manter o token atual' : '••••••••'}
            />
          </div>

          <Button type="submit" className="mt-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                Salvando...
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default AccountFormSheet
