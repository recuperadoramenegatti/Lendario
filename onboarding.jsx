// TOGA — Onboarding Flow · Apple-like · Ultra Premium
// Step-by-step intro that appears only once, with Skip button on all screens

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao TOGA',
    subtitle: 'Assuma o controle da sua aprovação',
    body: 'Um sistema de estudos verdadeiramente personalizável. Não somos um curso — somos sua ferramenta estratégica.',
    visual: 'welcome',
    icon: '⚖️',
    bullets: null,
  },
  {
    id: 'metas',
    title: 'Metas Personalizadas',
    subtitle: 'Você define seu ritmo',
    body: 'Configure metas diárias e semanais de horas, questões e flashcards. O app se adapta à sua rotina.',
    visual: 'goals',
    icon: '🎯',
    bullets: [
      'Defina metas de horas/dia e horas/semana',
      'Estabeleça quantidade de questões diárias',
      'Ajuste a qualquer momento conforme sua realidade',
      'O sistema calcula seu progresso automaticamente'
    ],
  },
  {
    id: 'modes',
    title: 'Objetiva & Discursiva',
    subtitle: 'Dois modos para a fase certa do concurso',
    body: 'Use o seletor no topo para alternar entre Objetiva e Discursiva. Cada modo tem sua própria matriz, marcadores e métricas — sem misturar fases.',
    visual: 'modes',
    icon: '🎭',
    bullets: [
      'Objetiva: foco em Lei · Doutrina · Juris · Questões · Revisão',
      'Discursiva: foco em Estudado · Grifado · Questões',
      'Cada modo guarda seu próprio progresso',
      'Alterne a qualquer momento pelo botão no cabeçalho'
    ],
  },
  {
    id: 'matriz',
    title: 'Matriz do Edital',
    subtitle: 'Controle cada tópico do seu concurso',
    body: 'Marque o que estudou: lei seca, doutrina, jurisprudência, questões e revisão. Cada check vale XP.',
    visual: 'matriz',
    icon: '📋',
    bullets: [
      'Crie disciplinas e tópicos do seu edital',
      'Marque: Lei · Doutrina · Juris · Questões · Revisão',
      'Arraste para reordenar por prioridade',
      'Acompanhe % de conclusão por disciplina'
    ],
  },
  {
    id: 'peso',
    title: 'Peso Inteligente',
    subtitle: 'Estudo proporcional ao edital',
    body: 'Atribua peso 1x, 2x ou 3x para cada disciplina. O XP e as métricas refletem a importância real de cada matéria.',
    visual: 'weight',
    icon: '⚖️',
    bullets: [
      'Peso 1x para disciplinas de menor pontuação',
      'Peso 2x para disciplinas intermediárias',
      'Peso 3x para disciplinas que valem mais pontos',
      'Sistema calcula XP proporcionalmente'
    ],
  },
  {
    id: 'constancia',
    title: 'Constância & Heatmaps',
    subtitle: 'Visualize sua jornada',
    body: 'Acompanhe seus 30 dias de constância, heatmaps de densidade estilo GitHub e métricas de domínio em tempo real.',
    visual: 'constancia',
    icon: '📊',
    bullets: [
      '30 blocos horizontais = últimos 30 dias',
      'Heatmap de horas e questões com gradiente de cor',
      'Constância de dias consecutivos com fogo 🔥 (fins de semana não quebram)',
      'Métricas: tópicos dominados, revisões pendentes'
    ],
  },
  {
    id: 'pet',
    title: 'Seu Dragãozinho Arcano',
    subtitle: 'Um companheiro mágico que cresce com você',
    body: 'Cada hora de estudo vira XP e cristais. Seu dragão sente o que você faz: horas enchem a Mana, questões o Saber e a constância o Afeto.',
    visual: 'pet',
    icon: '🐉',
    bullets: [
      'Ovo Arcano → Filhote → Sábio → Dragão Lendário (8 fases)',
      'Missões diárias, baú do dia e conquistas para compartilhar',
      'Loja de acessórios e cenários no Covil do Dragão',
      'Adoece se você ficar 3 dias sem estudar — cura com 2 dias seguidos'
    ],
  },
  {
    id: 'final',
    title: 'Você está pronto',
    subtitle: 'Agora é hora de começar',
    body: 'Configure suas metas, monte seu edital e comece a registrar sessões. Cada dia conta. Cada check importa. Vamos nessa.',
    visual: 'final',
    icon: '🚀',
    bullets: [
      'Vá em "Ajustes" → Configurar metas',
      'Monte seu edital na aba "Edital"',
      'Registre sessões de estudo na aba "Hoje"',
      'Acompanhe seu progresso nos dashboards'
    ],
  },
];

function OnboardingModal({ onDone }) {
  const [step, setStep] = React.useState(0);
  const [exiting, setExiting] = React.useState(false);
  const current = ONBOARDING_STEPS[step];
  const isLast = step === ONBOARDING_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      setExiting(true);
      setTimeout(() => {
        localStorage.setItem('toga_onboarded_tutorial', '1');
        onDone();
      }, 300);
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = () => {
    setExiting(true);
    setTimeout(() => {
      localStorage.setItem('toga_onboarded_tutorial', '1');
      onDone();
    }, 300);
  };

  return (
    <div
      onClick={handleSkip}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(11,61,92,0.50)',
        backdropFilter: 'blur(20px) saturate(120%)',
        WebkitBackdropFilter: 'blur(20px) saturate(120%)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        animation: exiting ? 'fade-out 300ms ease-out forwards' : 'onboarding-backdrop-in 500ms ease-out',
      }}
    >
      <style>{`
        @keyframes onboarding-backdrop-in {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(20px); }
        }
        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes onboarding-card-in {
          from { opacity: 0; transform: scale(0.92) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes onboarding-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes onboarding-pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,184,212,0), 0 20px 60px rgba(11,61,92,0.25); }
          50% { box-shadow: 0 0 0 12px rgba(0,184,212,0.15), 0 20px 60px rgba(11,61,92,0.35); }
        }
        @keyframes onboarding-icon-bounce {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.12); }
        }
        .onboarding-card { padding: 40px 44px 32px; }
        .onboarding-cta { width: 100%; padding: 14px 24px; border-radius: 14px; border: none;
          background: linear-gradient(135deg, var(--petroleo) 0%, var(--ciano) 100%);
          color: white; font-size: 15px; font-weight: 700; cursor: pointer;
          box-shadow: 0 8px 24px rgba(0,184,212,0.30), 0 0 0 1px rgba(255,255,255,0.15) inset;
          transition: transform 200ms cubic-bezier(0.16,1,0.3,1), box-shadow 200ms;
          letter-spacing: 0.02em;
          touch-action: manipulation;
          -webkit-tap-highlight-color: rgba(0,184,212,0.25);
          position: relative;
          z-index: 10;
        }
        .onboarding-cta:active { transform: translateY(0); }
        @media (max-width: 640px) {
          .onboarding-card { padding: 28px 22px 22px; border-radius: 18px; }
          .onboarding-cta { padding: 16px 20px; font-size: 16px; }
        }
        @media (max-width: 400px) {
          .onboarding-card { padding: 22px 16px 18px; }
        }
      `}</style>

      {/* The card */}
      <div
        onClick={e => e.stopPropagation()}
        onTouchStart={e => e.stopPropagation()}
        className="glass-strong onboarding-card"
        style={{
          width: '100%', maxWidth: 560, borderRadius: 24,
          position: 'relative',
          margin: 'auto 0',
          boxShadow: '0 20px 60px rgba(11,61,92,0.25), 0 0 0 1px rgba(255,255,255,0.8) inset',
          animation: exiting ? 'fade-out 300ms ease-out forwards' : `onboarding-card-in 600ms cubic-bezier(0.16,1,0.3,1)`,
        }}
      >
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="btn-ghost"
          style={{
            position: 'absolute', top: 16, right: 16,
            fontSize: 12, fontWeight: 600, color: 'var(--text-muted)',
            padding: '6px 12px',
          }}
        >
          Pular
        </button>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 32 }}>
          {ONBOARDING_STEPS.map((s, i) => (
            <div key={s.id} style={{
              width: i === step ? 28 : 8, height: 8, borderRadius: 99,
              background: i === step
                ? 'linear-gradient(90deg, var(--ciano), var(--petroleo))'
                : 'rgba(30,32,48,0.12)',
              transition: 'all 400ms cubic-bezier(0.16,1,0.3,1)',
              boxShadow: i === step ? '0 0 12px rgba(0,184,212,0.4)' : 'none',
            }} />
          ))}
        </div>

        {/* Icon with float animation */}
        <div style={{
          fontSize: 56, textAlign: 'center', marginBottom: 20,
          animation: 'onboarding-float 3s ease-in-out infinite',
          filter: 'drop-shadow(0 4px 16px rgba(0,184,212,0.25))',
        }}>
          {current.icon}
        </div>

        {/* Title */}
        <div className="font-display" style={{
          fontSize: 28, fontWeight: 700, textAlign: 'center',
          background: 'linear-gradient(135deg, var(--petroleo) 0%, var(--ciano) 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          marginBottom: 8, letterSpacing: '-0.02em',
        }}>
          {current.title}
        </div>

        {/* Subtitle */}
        <div style={{
          fontSize: 15, color: 'var(--text-muted)', textAlign: 'center',
          fontWeight: 600, marginBottom: 24, letterSpacing: '0.01em',
        }}>
          {current.subtitle}
        </div>

        {/* Body */}
        <div style={{
          fontSize: 14, color: 'var(--text-primary)', textAlign: 'center',
          lineHeight: 1.6, marginBottom: current.bullets ? 20 : 32,
          maxWidth: 440, margin: '0 auto',
        }}>
          {current.body}
        </div>

        {/* Bullets */}
        {current.bullets && (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 10,
            marginBottom: 32, paddingLeft: 20, paddingRight: 20,
          }}>
            {current.bullets.map((b, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                animation: `onboarding-card-in 500ms ${200 + i * 80}ms cubic-bezier(0.16,1,0.3,1) both`,
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--ciano), var(--petroleo))',
                  flexShrink: 0,
                  boxShadow: '0 0 6px rgba(0,184,212,0.5)',
                }} />
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>
                  {b}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Visual preview (placeholder for now, could be screenshots) */}
        {current.visual && current.visual !== 'welcome' && (
          <div style={{
            height: 80, borderRadius: 12, marginBottom: 20,
            background: `radial-gradient(ellipse at 50% 30%, rgba(0,184,212,0.08), transparent 70%)`,
            border: '1px solid rgba(0,184,212,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, color: 'var(--text-dim)', fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 600, letterSpacing: '0.12em',
            pointerEvents: 'none',
            userSelect: 'none',
            flexShrink: 0,
          }}>
            PRÉVIA · {current.visual.toUpperCase()}
          </div>
        )}

        {/* Next button — ALWAYS on top, mobile-tap friendly */}
        <button
          type="button"
          onClick={handleNext}
          onTouchEnd={(e) => { e.preventDefault(); handleNext(); }}
          className="onboarding-cta"
        >
          {isLast ? '🚀 Começar jornada' : 'Prosseguir'}
        </button>

        {/* Step counter (subtle) */}
        <div style={{
          textAlign: 'center', marginTop: 16,
          fontSize: 11, color: 'var(--text-dim)',
          fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
          letterSpacing: '0.1em',
        }}>
          {step + 1} DE {ONBOARDING_STEPS.length}
        </div>
      </div>
    </div>
  );
}

window.OnboardingModal = OnboardingModal;
