import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/PageStates';

function Legal({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <PageHeader title={title} breadcrumbs={[{ label: 'Início', to: '/' }, { label: title }]} />
      <p role="note" className="mb-6 rounded-lg border border-warning/20 bg-warning-muted p-3 text-sm text-warning">
        Texto resumido e provisório. A versão final destes termos ainda será revisada pela equipe jurídica da NEOX.
      </p>
      <div className="space-y-6 text-sm leading-relaxed text-foreground [&_h2]:mb-2 [&_h2]:text-lg [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:text-muted-foreground [&_ul]:space-y-1 [&_ul]:text-muted-foreground">
        {children}
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <Legal title="Termos de uso">
      <section>
        <h2>O que é a NEOX</h2>
        <p>
          A NEOX é uma plataforma que reúne lojas independentes. Cada produto é vendido, enviado e faturado pela loja que o anuncia.
          A NEOX oferece a vitrine, o carrinho, o registro dos pedidos e a conexão com o meio de pagamento.
        </p>
      </section>
      <section>
        <h2>Sua conta</h2>
        <ul>
          <li>Para comprar é preciso criar uma conta de cliente com nome, e-mail e senha.</li>
          <li>Você é responsável por manter sua senha em segredo e pelos dados informados.</li>
          <li>Contas usadas para fraude ou abuso podem ser bloqueadas.</li>
        </ul>
      </section>
      <section>
        <h2>Pedidos e pagamento</h2>
        <ul>
          <li>Um carrinho com produtos de várias lojas gera um pedido separado para cada loja, com o frete daquela loja.</li>
          <li>Quando o pagamento online está ativo, ele é processado pelo Mercado Pago. A NEOX não recebe nem guarda dados do seu cartão.</li>
          <li>Quando o pagamento online não está ativo, a loja combina a forma de pagamento diretamente com você.</li>
          <li>Prazos, trocas e devoluções seguem a política de cada loja e o Código de Defesa do Consumidor.</li>
        </ul>
      </section>
      <section>
        <h2>Lojistas</h2>
        <p>
          Lojas passam por análise antes de aparecer na vitrine. Cada lojista é responsável pelos produtos, preços, estoque e entregas que anuncia.
          Veja como vender em <Link to="/vender" className="text-primary hover:underline">Venda na NEOX</Link>.
        </p>
      </section>
      <section>
        <h2>Privacidade</h2>
        <p>
          O uso dos seus dados está descrito na <Link to="/privacidade" className="text-primary hover:underline">Política de privacidade</Link>.
        </p>
      </section>
    </Legal>
  );
}

export function PrivacyPage() {
  return (
    <Legal title="Política de privacidade">
      <section>
        <h2>Dados que coletamos</h2>
        <ul>
          <li><strong>Conta:</strong> nome, e-mail, telefone e senha (guardada apenas de forma criptografada).</li>
          <li><strong>Pedidos:</strong> endereço de entrega, CPF, telefone, itens comprados e valores.</li>
          <li><strong>Endereços salvos:</strong> quando você escolhe salvar um endereço para compras futuras.</li>
          <li><strong>Navegação:</strong> visitas a lojas e produtos e adições ao carrinho, ligadas a um identificador anônimo do navegador, para gerar estatísticas para os lojistas.</li>
        </ul>
      </section>
      <section>
        <h2>Para que usamos</h2>
        <ul>
          <li>Registrar e acompanhar seus pedidos.</li>
          <li>Repassar à loja os dados necessários para entregar o pedido e emitir a nota (nome, endereço, telefone e CPF).</li>
          <li>Enviar e-mails da sua conta, como a redefinição de senha.</li>
        </ul>
      </section>
      <section>
        <h2>Com quem compartilhamos</h2>
        <ul>
          <li>Com a loja de cada pedido, apenas os dados daquele pedido.</li>
          <li>Com o Mercado Pago, quando você paga online: ele processa o pagamento segundo a política de privacidade dele.</li>
          <li>Não vendemos seus dados.</li>
        </ul>
      </section>
      <section>
        <h2>Armazenamento no seu navegador</h2>
        <p>
          Usamos o armazenamento local do navegador (localStorage) para manter você conectado, guardar o carrinho de quem ainda não entrou
          na conta, lembrar o tema claro/escuro e o identificador anônimo de navegação. Não usamos cookies de publicidade.
        </p>
      </section>
      <section>
        <h2>Seus direitos</h2>
        <p>
          Você pode ver e corrigir seus dados em <Link to="/conta/dados" className="text-primary hover:underline">Minha conta</Link>,
          excluir endereços salvos e pedir a exclusão da conta pelo contato de suporte da plataforma, conforme a LGPD.
        </p>
      </section>
    </Legal>
  );
}
