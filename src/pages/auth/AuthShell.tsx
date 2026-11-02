import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { IconButton } from '@/components/PageStates';
import { Logo } from '@/components/layouts/shared';

/** Moldura das telas de acesso (fora do layout da loja): logo que volta para a vitrine + cartão central. */
export function AuthShell({ title, description, children, footer }: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <header className="flex h-16 items-center px-4 sm:px-6">
        <Logo />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-10 pt-4 sm:items-center">
        <div className="w-full max-w-md">
          <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            <div className="mt-6">{children}</div>
          </div>
          {footer && <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

/** Campo de senha com botão mostrar/ocultar. */
export const PasswordInput = forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>((props, ref) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input ref={ref} {...props} type={show ? 'text' : 'password'} className="pr-12" />
      <IconButton
        type="button"
        label={show ? 'Ocultar senha' : 'Mostrar senha'}
        icon={show ? EyeOff : Eye}
        className="absolute right-0 top-0 h-full w-11"
        aria-pressed={show}
        onClick={() => setShow((s) => !s)}
      />
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';
