// Lendário — License Gate + Onboarding Tutorial (Bloco 7)

// ── License validation ──
// Validates a code against public JSON on GitHub.
// JSON format: { "codes": ["CODE1", "CODE2", ...] }
// If the fetch fails (offline/network), allow the stored valid code to pass.
const LICENSE_KEY   = 'toga_license';
const LICENSED_CODE = 'toga_licensed_code';

async function validateCode(code) {
  const clean = code.trim().toUpperCase();
  // Stored valid code — offline fallback
  const stored = localStorage.getItem(LICENSED_CODE);
  if (stored && stored === clean) return true;
  // Try remote validation
  try {
    const url = 'https://raw.githubusercontent.com/xuandrade/caminho-ate-a-posse/main/licenses.json';
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('fetch failed');
    const json = await res.json();
    const codes = (json.codes || []).map(c => c.trim().toUpperCase());
    if (codes.includes(clean)) {
      localStorage.setItem(LICENSED_CODE, clean);
      return true;
    }
    return false;
  } catch {
    // Network error — if code looks like valid format (e.g. TOGA-XXXX-XXXX), allow it
    // This prevents locking out legitimate users in flaky networks
    if (/^TOGA-[A-Z0-9]{4,}-[A-Z0-9]{4,}$/.test(clean)) {
      localStorage.setItem(LICENSED_CODE, clean);
      return true;
    }
    return false;
  }
}

function LicenseGate({ onLicensed }) {
  const { useState: useSt, useEffect: useEff } = React;
  const [code, setCode] = useSt('');
  const [loading, setLoading] = useSt(false);
  const [error, setError] = useSt('');
  const [checked, setChecked] = useSt(false);

  useEff(() => {
    // Already licensed
    const stored = localStorage.getItem(LICENSE_KEY);
    if (stored === '1') { onLicensed(); return; }
    setChecked(true);
  }, []);

  const handleActivate = async () => {
    const clean = code.trim().toUpperCase();
    if (!clean) { setError('Digite o código de acesso.'); return; }
    setLoading(true);
    setError('');
    const ok = await validateCode(clean);
    setLoading(false);
    if (ok) {
      localStorage.setItem(LICENSE_KEY, '1');
      onLicensed();
    } else {
      setError('Código inválido ou não encontrado. Verifique o email de compra.');
    }
  };

  if (!checked) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'var(--neblina)',
      display: 'grid', placeItems: 'center',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}><LogoMark size={96} title="Lendário" className="ld-float" /></div>
          <Wordmark size={30} />
          <div className="font-display" style={{ fontSize: 18, fontStyle: 'italic', color: 'var(--text-muted)', marginTop: 8 }}>
            Estude como uma lenda.
          </div>
        </div>

        <div className="glass-strong" style={{ padding: 28, borderRadius: 18 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--text-muted)', fontWeight: 700, fontFamily: 'var(--font-label)', marginBottom: 6 }}>
            ATIVAÇÃO DE LICENÇA
          </div>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
            Ative sua cópia do Lendário
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
            Insira o código de acesso enviado ao seu email após a compra na Hotmart.
          </div>

          <input
            type="text"
            placeholder="TOGA-XXXX-XXXX"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleActivate()}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '12px 14px', borderRadius: 10, marginBottom: 10,
              border: `1px solid ${error ? 'var(--coral)' : 'rgba(243,235,221,0.15)'}`,
              background: 'rgba(22,19,40,0.8)',
              fontSize: 15, fontFamily: 'var(--font-label)',
              fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-heading)',
              outline: 'none',
            }}
          />

          {error && (
            <div style={{ fontSize: 12, color: 'var(--coral)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span><Glyph e="⚠️" /></span> {error}
            </div>
          )}

          <button
            onClick={handleActivate}
            disabled={loading}
            className="btn-neon"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14,
              background: 'var(--grad-primary)',
              borderColor: 'transparent', color: 'var(--on-primary)', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Verificando…' : 'Ativar Lendário'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: 'var(--text-muted)' }}>
            Ainda não tem o Lendário?{' '}
            <span style={{ color: 'var(--ciano)', fontWeight: 600 }}>
              Adquira na Hotmart
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Onboarding Tutorial ──
const ONBOARDING_KEY = 'toga_onboarded_tutorial';
const ONBOARDING_STEPS = [
  {
    icon: '🐉',
    title: 'Bem-vindo(a) ao Lendário',
    body: 'O sistema de estudos dos concurseiros que se aprovam. Em 5 passos rápidos você entende tudo.',
  },
  {
    icon: '📋',
    title: 'Matriz do Edital',
    body: 'Na aba EDITAL, marque os checkboxes conforme você estuda cada tópico: Lei seca, Teoria, Jurisprudência, Questões e Revisão. Cada check vale +1 XP × peso da disciplina.',
  },
  {
    icon: '🏠',
    title: 'Aba HOJE',
    body: 'Aqui você acompanha seu progresso diário, streak, metas e os insights personalizados que o Lendário gera para você.',
  },
  {
    icon: '📊',
    title: 'Estatísticas',
    body: 'Na aba STATS, veja gráficos detalhados de tempo por disciplina, taxa de acerto, curva de evolução e muito mais.',
  },
  {
    icon: '🎯',
    title: 'Seus concursos',
    body: 'Na aba PROVAS, cadastre os concursos que você está mirando para ter contagem regressiva e manter o foco. Boa sorte na posse!',
  },
];

function OnboardingModal({ onDone }) {
  const { useState: useSt } = React;
  const [step, setStep] = useSt(0);
  const s = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;

  const finish = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    onDone();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 150,
      background: 'radial-gradient(ellipse at 50% 30%, rgba(42,31,92,0.55), rgba(7,6,13,0.86))', backdropFilter: 'blur(6px)',
      display: 'grid', placeItems: 'center', padding: 24,
    }}>
      <div className="glass-strong anim-slide-up" style={{
        width: '100%', maxWidth: 420, padding: 32, borderRadius: 22, textAlign: 'center',
      }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}><Glyph e={s.icon} /></div>
        <div className="font-display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 8 }}>
          {s.title}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 28 }}>
          {s.body}
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 24 }}>
          {ONBOARDING_STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 18 : 6, height: 6, borderRadius: 99,
              background: i === step ? 'var(--petroleo)' : 'rgba(243,235,221,0.18)',
              transition: 'all 250ms ease',
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {step > 0 && (
            <button className="btn-ghost" onClick={() => setStep(s => s-1)} style={{ flex: 1 }}>
              Voltar
            </button>
          )}
          {!isLast && (
            <button className="btn-ghost" onClick={finish} style={{ fontSize: 11, color: 'var(--text-dim)' }}>
              Pular
            </button>
          )}
          <button
            className="btn-neon"
            onClick={isLast ? finish : () => setStep(s => s+1)}
            style={{ flex: 2, justifyContent: 'center',
              background: 'var(--grad-primary)',
              borderColor: 'transparent', color: 'var(--on-primary)' }}>
            {isLast ? 'Começar a estudar 🚀' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Legal Modals ──
function LegalModal({ type, onClose }) {
  const title    = type === 'privacy' ? 'Política de Privacidade' : 'Termos de Uso';
  const content  = type === 'privacy' ? PRIVACY_CONTENT : TERMS_CONTENT;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(12,13,18,0.5)', backdropFilter: 'blur(8px)',
      display: 'grid', placeItems: 'center', padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} className="glass-strong" style={{
        width: '100%', maxWidth: 560, maxHeight: '80vh', overflowY: 'auto',
        padding: 28, borderRadius: 18, position: 'relative',
      }}>
        <button onClick={onClose} className="btn-ghost" style={{ position: 'absolute', top: 12, right: 12, padding: '4px 8px' }}>✕</button>
        <div className="font-display" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 16 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{content}</div>
      </div>
    </div>
  );
}

const PRIVACY_CONTENT = `Última atualização: 2026

1. DADOS COLETADOS
O Lendário armazena todos os dados exclusivamente no seu dispositivo (localStorage). Nenhuma informação pessoal é enviada a servidores externos.

Dados armazenados localmente:
• Progresso no edital (checks por tópico)
• Registros de sessões de estudo
• XP, streak e conquistas
• Metas pessoais
• Código de licença (para verificação offline)

2. DADOS NÃO COLETADOS
Não coletamos nome, email, CPF, dados de pagamento, localização ou qualquer dado pessoal identificável.

3. SERVIÇOS DE TERCEIROS
A validação de licença faz uma requisição ao GitHub (raw.githubusercontent.com) somente no momento da ativação. Nenhum dado pessoal é enviado — apenas o código inserido é verificado.

4. SEUS DIREITOS
Como todos os dados ficam no seu dispositivo, você tem controle total. Use a função "Zerar sistema" em Ajustes para apagar todos os dados locais.

5. CONTATO
Para dúvidas, entre em contato pelo suporte da Hotmart.`;

const TERMS_CONTENT = `Última atualização: 2026

1. LICENÇA DE USO
O Lendário é um software licenciado para uso pessoal e intransferível. Cada código de ativação é válido para um usuário e não pode ser compartilhado.

2. USO PERMITIDO
• Uso pessoal para preparação para concursos
• Instalação em até 2 dispositivos do mesmo usuário
• Exportar/importar seus próprios dados de backup

3. USO PROIBIDO
• Compartilhar o código de licença com terceiros
• Modificar, copiar ou redistribuir o software
• Usar o software para fins comerciais ou coletivos

4. LIMITAÇÃO DE RESPONSABILIDADE
O Lendário é uma ferramenta de organização de estudos. Não garantimos aprovação em concursos. O resultado depende exclusivamente do esforço e dedicação do usuário.

5. ATUALIZAÇÕES
O Lendário pode receber atualizações que adicionam ou modificam funcionalidades. Atualizações estão incluídas no preço da licença.

6. CANCELAMENTO
Por ser um produto digital de acesso imediato, não há direito de arrependimento após a ativação da licença, conforme art. 49, §1º do CDC.

7. FORO
Fica eleito o foro da comarca do Rio de Janeiro/RJ para dirimir eventuais conflitos.`;
