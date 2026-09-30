// Lendário — modelo de dados, defaults, helpers

const INITIAL_SUBJECTS_OBJ = [
  {
    "id": "constitucional",
    "name": "Direito Constitucional",
    "shortName": "Const",
    "weight": 1,
    "topics": [
      { "id": "constitucional-1",  "name": "Direitos e Garantias Fundamentais",           "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "constitucional-2",  "name": "Controle de Constitucionalidade",              "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "constitucional-3",  "name": "Organização dos Poderes",                      "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "constitucional-4",  "name": "Processo Legislativo",                         "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "constitucional-5",  "name": "Princípios Fundamentais",                      "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "constitucional-6",  "name": "Organização do Estado e Federação",            "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "constitucional-7",  "name": "Poder Judiciário e Funções Essenciais",        "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "constitucional-8",  "name": "Direitos Sociais",                             "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "constitucional-9",  "name": "Ordem Social (saúde, educação, previdência)",  "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "constitucional-10", "name": "Tributação e Orçamento (CF)",                  "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "constitucional-11", "name": "Ordem Econômica e Financeira",                 "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false }
    ]
  },
  {
    "id": "administrativo",
    "name": "Direito Administrativo",
    "shortName": "Admin",
    "weight": 1,
    "topics": [
      { "id": "administrativo-1",  "name": "Atos Administrativos",                         "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "administrativo-2",  "name": "Licitações e Contratos Administrativos",       "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "administrativo-3",  "name": "Responsabilidade Civil do Estado",              "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "administrativo-4",  "name": "Poderes Administrativos",                       "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "administrativo-5",  "name": "Princípios do Direito Administrativo",          "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "administrativo-6",  "name": "Agentes Públicos e Regime Jurídico",            "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "administrativo-7",  "name": "Serviços Públicos",                             "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "administrativo-8",  "name": "Bens Públicos",                                 "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "administrativo-9",  "name": "Processo Administrativo",                       "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "administrativo-10", "name": "Improbidade Administrativa",                    "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "administrativo-11", "name": "Controle da Administração",                     "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "administrativo-12", "name": "Organização Administrativa",                    "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false }
    ]
  },
  {
    "id": "civil",
    "name": "Direito Civil",
    "shortName": "Civil",
    "weight": 1,
    "topics": [
      { "id": "civil-1",  "name": "Responsabilidade Civil",                "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "civil-2",  "name": "Contratos em Espécie",                  "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "civil-3",  "name": "Obrigações",                            "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "civil-4",  "name": "Direito de Família",                    "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "civil-5",  "name": "Negócio Jurídico",                      "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "civil-6",  "name": "Direito das Sucessões",                 "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "civil-7",  "name": "Direitos Reais e Propriedade",          "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "civil-8",  "name": "Posse",                                 "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "civil-9",  "name": "Pessoas Físicas e Jurídicas",           "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "civil-10", "name": "Prescrição e Decadência",               "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "civil-11", "name": "Contratos em Geral (teoria geral)",     "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false }
    ]
  },
  {
    "id": "proc-civil",
    "name": "Direito Processual Civil",
    "shortName": "ProcCiv",
    "weight": 1,
    "topics": [
      { "id": "proc-civil-1",  "name": "Recursos (CPC)",                          "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "proc-civil-2",  "name": "Tutelas Provisórias",                     "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "proc-civil-3",  "name": "Processo de Conhecimento",                "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "proc-civil-4",  "name": "Execução Civil",                          "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "proc-civil-5",  "name": "Competência",                             "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "proc-civil-6",  "name": "Princípios e Normas Fundamentais (CPC)",  "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "proc-civil-7",  "name": "Provas",                                  "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "proc-civil-8",  "name": "Partes, Procuradores e Litisconsórcio",   "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "proc-civil-9",  "name": "Sentença e Coisa Julgada",                "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "proc-civil-10", "name": "Procedimentos Especiais",                 "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "proc-civil-11", "name": "Cumprimento de Sentença",                 "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false }
    ]
  },
  {
    "id": "penal",
    "name": "Direito Penal",
    "shortName": "Penal",
    "weight": 1,
    "topics": [
      { "id": "penal-1",  "name": "Teoria do Crime (Tipicidade, Ilicitude, Culpabilidade)", "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "penal-2",  "name": "Crimes contra a Pessoa",                                 "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "penal-3",  "name": "Penas (espécies e aplicação)",                           "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "penal-4",  "name": "Crimes contra o Patrimônio",                             "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "penal-5",  "name": "Crimes contra a Administração Pública",                  "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "penal-6",  "name": "Lei Maria da Penha / Violência Doméstica",               "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "penal-7",  "name": "Crimes contra a Dignidade Sexual",                       "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "penal-8",  "name": "Extinção da Punibilidade",                               "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "penal-9",  "name": "Aplicação da Lei Penal (tempo, espaço, pessoa)",         "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "penal-10", "name": "Legislação Penal Especial (tráfico, armas, etc.)",       "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false }
    ]
  },
  {
    "id": "proc-penal",
    "name": "Direito Processual Penal",
    "shortName": "ProcPen",
    "weight": 1,
    "topics": [
      { "id": "proc-penal-1",  "name": "Prisão, Medidas Cautelares e Liberdade Provisória", "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "proc-penal-2",  "name": "Recursos e Ações Autônomas no CPP",                 "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "proc-penal-3",  "name": "Ação Penal e Condições da Ação",                    "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "proc-penal-4",  "name": "Provas (sistema, tipos, produção)",                  "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "proc-penal-5",  "name": "Inquérito Policial",                                 "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "proc-penal-6",  "name": "Competência Penal",                                  "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "proc-penal-7",  "name": "Procedimentos (comum ordinário, sumário, especial)", "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "proc-penal-8",  "name": "Nulidades",                                          "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "proc-penal-9",  "name": "Habeas Corpus e Mandado de Segurança Penal",         "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "proc-penal-10", "name": "Execução Penal (LEP)",                               "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false }
    ]
  },
  {
    "id": "dh",
    "name": "Direitos Humanos",
    "shortName": "DH",
    "weight": 1,
    "topics": [
      { "id": "dh-1",  "name": "Sistema Interamericano de Direitos Humanos",                  "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "dh-2",  "name": "Convenção Americana sobre Direitos Humanos (CADH)",           "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "dh-3",  "name": "Sistema Universal de DH (ONU)",                               "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "dh-4",  "name": "Pacto Internacional de Direitos Civis e Políticos",           "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "dh-5",  "name": "Declaração Universal dos Direitos Humanos",                   "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "dh-6",  "name": "Mecanismos de Proteção Internacional",                        "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "dh-7",  "name": "Grupos Vulneráveis (mulher, criança, migrante, preso)",       "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "dh-8",  "name": "Corte e Comissão Interamericana",                             "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "dh-9",  "name": "Responsabilidade Internacional do Estado",                    "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "dh-10", "name": "Direitos Econômicos, Sociais e Culturais (DESC)",             "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false }
    ]
  },
  {
    "id": "tributario",
    "name": "Direito Tributário",
    "shortName": "Trib",
    "weight": 1,
    "topics": [
      { "id": "tributario-1", "name": "Obrigação e Crédito Tributário",                      "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "tributario-2", "name": "Impostos em Espécie (IR, IPTU, ICMS, ISS, etc.)",     "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "tributario-3", "name": "Princípios Constitucionais Tributários",               "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "tributario-4", "name": "Competência Tributária",                               "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "tributario-5", "name": "Exclusão, Suspensão e Extinção do Crédito",            "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "tributario-6", "name": "Responsabilidade Tributária",                          "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "tributario-7", "name": "Execução Fiscal",                                      "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "tributario-8", "name": "Legislação Tributária (fontes, interpretação)",        "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "tributario-9", "name": "Simples Nacional e Regimes Especiais",                 "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false }
    ]
  },
  {
    "id": "consumidor",
    "name": "Direito do Consumidor",
    "shortName": "CDC",
    "weight": 1,
    "topics": [
      { "id": "consumidor-1", "name": "Responsabilidade pelo Fato e Vício do Produto/Serviço", "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "consumidor-2", "name": "Práticas Comerciais Abusivas",                           "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "consumidor-3", "name": "Proteção Contratual (cláusulas abusivas)",               "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "consumidor-4", "name": "Direitos Básicos do Consumidor",                         "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "consumidor-5", "name": "Conceitos Fundamentais (fornecedor, consumidor, prod.)", "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "consumidor-6", "name": "Defesa do Consumidor em Juízo",                          "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "consumidor-7", "name": "Publicidade",                                             "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "consumidor-8", "name": "Cadastros de Inadimplentes e Bancos de Dados",           "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "consumidor-9", "name": "Desconsideração da Personalidade Jurídica",              "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false }
    ]
  },
  {
    "id": "eca",
    "name": "Estatuto da Criança e do Adolescente",
    "shortName": "ECA",
    "weight": 1,
    "topics": [
      { "id": "eca-1",  "name": "Ato Infracional e Medidas Socioeducativas",            "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "eca-2",  "name": "Direitos Fundamentais da Criança e Adolescente",       "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "eca-3",  "name": "Família Natural, Extensa e Substituta",                "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "eca-4",  "name": "Adoção",                                               "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "eca-5",  "name": "Conselho Tutelar",                                     "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "eca-6",  "name": "Violência contra Criança e Adolescente",               "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "eca-7",  "name": "Medidas de Proteção",                                  "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "eca-8",  "name": "Internação",                                           "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "eca-9",  "name": "Justiça da Infância e Juventude",                      "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "eca-10", "name": "SINASE (Sistema Socioeducativo)",                      "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false }
    ]
  },
  {
    "id": "empresarial",
    "name": "Direito Empresarial",
    "shortName": "Empres",
    "weight": 1,
    "topics": [
      { "id": "empresarial-1", "name": "Títulos de Crédito (cheque, duplicata, nota prom., letra)", "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "empresarial-2", "name": "Falência e Recuperação Judicial",                            "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "empresarial-3", "name": "Sociedades Empresariais (Ltda., S.A.)",                      "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "empresarial-4", "name": "Contratos Empresariais",                                     "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "empresarial-5", "name": "Estabelecimento e Registro Empresarial",                     "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "empresarial-6", "name": "Responsabilidade dos Sócios",                               "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "empresarial-7", "name": "Propriedade Industrial (marcas, patentes)",                  "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "empresarial-8", "name": "Nome Empresarial",                                           "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false }
    ]
  },
  {
    "id": "ambiental",
    "name": "Direito Ambiental",
    "shortName": "Amb",
    "weight": 1,
    "topics": [
      { "id": "ambiental-1", "name": "Política Nacional do Meio Ambiente (Lei 6938/81)",   "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "ambiental-2", "name": "Responsabilidade Ambiental (civil, penal, adm.)",    "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "ambiental-3", "name": "Código Florestal (Lei 12651/12)",                    "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "ambiental-4", "name": "Licenciamento Ambiental",                            "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "ambiental-5", "name": "Crimes Ambientais (Lei 9605/98)",                    "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "ambiental-6", "name": "Unidades de Conservação (SNUC)",                     "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "ambiental-7", "name": "Recursos Hídricos",                                  "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "ambiental-8", "name": "Dano Ambiental e Reparação",                         "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false }
    ]
  },
  {
    "id": "idoso-pcd",
    "name": "Estatuto do Idoso e da PCD",
    "shortName": "Idoso/PCD",
    "weight": 1,
    "topics": [
      { "id": "idoso-pcd-1", "name": "Estatuto da Pessoa com Deficiência (LBI — Lei 13146/15)", "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "idoso-pcd-2", "name": "Direitos Fundamentais do Idoso (Lei 10741/03)",           "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "idoso-pcd-3", "name": "Prioridade no Atendimento",                               "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "idoso-pcd-4", "name": "Violência contra o Idoso",                                "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "idoso-pcd-5", "name": "Inclusão da Pessoa com Deficiência",                      "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "idoso-pcd-6", "name": "Acessibilidade e Mobilidade",                             "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "idoso-pcd-7", "name": "Benefícios Assistenciais (BPC/LOAS)",                     "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "idoso-pcd-8", "name": "Trabalho da Pessoa com Deficiência",                      "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false }
    ]
  },
  {
    "id": "dp-institucional",
    "name": "Princípios Institucionais da Defensoria Pública",
    "shortName": "DP-Inst",
    "weight": 1,
    "topics": [
      { "id": "dp-institucional-1", "name": "Lei Complementar 80/94 (LONDP)",                        "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "dp-institucional-2", "name": "Autonomia Funcional, Administrativa e Orçamentária",     "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "dp-institucional-3", "name": "Garantias e Prerrogativas dos Defensores",               "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "dp-institucional-4", "name": "Atribuições da Defensoria Pública",                      "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "dp-institucional-5", "name": "Assistência Jurídica Gratuita e Acesso à Justiça",       "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "dp-institucional-6", "name": "Organização e Estrutura da DP",                          "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "dp-institucional-7", "name": "Carreira do Defensor Público",                           "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "dp-institucional-8", "name": "Corregedoria e Fiscalização",                            "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "dp-institucional-9", "name": "Atuação Coletiva da Defensoria Pública",                 "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false }
    ]
  },
  {
    "id": "filosofia",
    "name": "Filosofia e Sociologia do Direito",
    "shortName": "FiloSoc",
    "weight": 1,
    "topics": [
      { "id": "filosofia-1",  "name": "Hermenêutica Jurídica e Interpretação",           "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "filosofia-2",  "name": "Teoria Geral do Direito",                         "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "filosofia-3",  "name": "Fontes do Direito",                               "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "filosofia-4",  "name": "Direito e Moral (relações)",                      "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "filosofia-5",  "name": "Teoria da Argumentação Jurídica",                 "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "filosofia-6",  "name": "Justiça e Equidade (Rawls, Dworkin)",             "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "filosofia-7",  "name": "Positivismo Jurídico e Escola Histórica",         "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "filosofia-8",  "name": "Sociologia do Conflito e Acesso à Justiça",       "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "filosofia-9",  "name": "Crítica ao Direito (Escola de Frankfurt)",        "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "filosofia-10", "name": "Funções Sociais do Direito",                      "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false }
    ]
  },
  {
    "id": "portugues",
    "name": "Língua Portuguesa",
    "shortName": "Port",
    "weight": 1,
    "topics": [
      { "id": "portugues-1",  "name": "Interpretação e Compreensão de Texto",            "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "portugues-2",  "name": "Concordância Verbal e Nominal",                   "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "portugues-3",  "name": "Regência Verbal e Nominal",                       "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "portugues-4",  "name": "Crase",                                           "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "portugues-5",  "name": "Sintaxe (coordenação, subordinação, período)",    "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "portugues-6",  "name": "Morfologia (classes de palavras, flexões)",       "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "portugues-7",  "name": "Ortografia e Acentuação",                         "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "portugues-8",  "name": "Pontuação",                                       "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "portugues-9",  "name": "Colocação Pronominal",                            "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false },
      { "id": "portugues-10", "name": "Semântica e Figuras de Linguagem",                "lei": false, "doutrina": false, "juris": false, "questoes": false, "revisao": false }
    ]
  }
];

const INITIAL_SUBJECTS_DISC = [
  { "id": "d-constitucional",   "name": "Direito Constitucional",                            "weight": 1, "simulados": [],
    "topics": [
      { "id": "d-constitucional-1",  "name": "Direitos e Garantias Fundamentais",            "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-constitucional-2",  "name": "Controle de Constitucionalidade",               "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-constitucional-3",  "name": "Organização dos Poderes",                       "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-constitucional-4",  "name": "Processo Legislativo",                          "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-constitucional-5",  "name": "Princípios Fundamentais",                       "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-constitucional-6",  "name": "Organização do Estado e Federação",             "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-constitucional-7",  "name": "Poder Judiciário e Funções Essenciais",         "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-constitucional-8",  "name": "Direitos Sociais",                              "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-constitucional-9",  "name": "Ordem Social",                                  "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-constitucional-10", "name": "Tributação e Orçamento (CF)",                   "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-constitucional-11", "name": "Ordem Econômica e Financeira",                  "estudado": false, "grifado": false, "questoes": false }
    ]
  },
  { "id": "d-administrativo",   "name": "Direito Administrativo",                            "weight": 1, "simulados": [],
    "topics": [
      { "id": "d-administrativo-1",  "name": "Atos Administrativos",                          "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-administrativo-2",  "name": "Licitações e Contratos Administrativos",        "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-administrativo-3",  "name": "Responsabilidade Civil do Estado",               "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-administrativo-4",  "name": "Poderes Administrativos",                        "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-administrativo-5",  "name": "Princípios do Direito Administrativo",           "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-administrativo-6",  "name": "Agentes Públicos e Regime Jurídico",             "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-administrativo-7",  "name": "Serviços Públicos",                              "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-administrativo-8",  "name": "Bens Públicos",                                  "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-administrativo-9",  "name": "Processo Administrativo",                        "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-administrativo-10", "name": "Improbidade Administrativa",                     "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-administrativo-11", "name": "Controle da Administração",                      "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-administrativo-12", "name": "Organização Administrativa",                     "estudado": false, "grifado": false, "questoes": false }
    ]
  },
  { "id": "d-civil",            "name": "Direito Civil",                                     "weight": 1, "simulados": [],
    "topics": [
      { "id": "d-civil-1",  "name": "Responsabilidade Civil",                                 "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-civil-2",  "name": "Contratos em Espécie",                                   "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-civil-3",  "name": "Obrigações",                                             "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-civil-4",  "name": "Direito de Família",                                     "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-civil-5",  "name": "Negócio Jurídico",                                       "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-civil-6",  "name": "Direito das Sucessões",                                  "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-civil-7",  "name": "Direitos Reais e Propriedade",                           "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-civil-8",  "name": "Posse",                                                  "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-civil-9",  "name": "Pessoas Físicas e Jurídicas",                            "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-civil-10", "name": "Prescrição e Decadência",                                "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-civil-11", "name": "Contratos em Geral (teoria geral)",                      "estudado": false, "grifado": false, "questoes": false }
    ]
  },
  { "id": "d-proc-civil",       "name": "Direito Processual Civil",                          "weight": 1, "simulados": [],
    "topics": [
      { "id": "d-proc-civil-1",  "name": "Recursos (CPC)",                                    "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-proc-civil-2",  "name": "Tutelas Provisórias",                               "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-proc-civil-3",  "name": "Processo de Conhecimento",                          "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-proc-civil-4",  "name": "Execução Civil",                                    "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-proc-civil-5",  "name": "Competência",                                       "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-proc-civil-6",  "name": "Princípios e Normas Fundamentais (CPC)",            "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-proc-civil-7",  "name": "Provas",                                            "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-proc-civil-8",  "name": "Partes, Procuradores e Litisconsórcio",             "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-proc-civil-9",  "name": "Sentença e Coisa Julgada",                          "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-proc-civil-10", "name": "Procedimentos Especiais",                           "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-proc-civil-11", "name": "Cumprimento de Sentença",                           "estudado": false, "grifado": false, "questoes": false }
    ]
  },
  { "id": "d-penal",            "name": "Direito Penal",                                     "weight": 1, "simulados": [],
    "topics": [
      { "id": "d-penal-1",  "name": "Teoria do Crime",                                        "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-penal-2",  "name": "Crimes contra a Pessoa",                                 "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-penal-3",  "name": "Penas (espécies e aplicação)",                           "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-penal-4",  "name": "Crimes contra o Patrimônio",                             "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-penal-5",  "name": "Crimes contra a Administração Pública",                  "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-penal-6",  "name": "Lei Maria da Penha / Violência Doméstica",               "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-penal-7",  "name": "Crimes contra a Dignidade Sexual",                       "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-penal-8",  "name": "Extinção da Punibilidade",                               "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-penal-9",  "name": "Aplicação da Lei Penal",                                 "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-penal-10", "name": "Legislação Penal Especial",                              "estudado": false, "grifado": false, "questoes": false }
    ]
  },
  { "id": "d-proc-penal",       "name": "Direito Processual Penal",                          "weight": 1, "simulados": [],
    "topics": [
      { "id": "d-proc-penal-1",  "name": "Prisão, Medidas Cautelares e Liberdade Provisória", "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-proc-penal-2",  "name": "Recursos e Ações Autônomas",                        "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-proc-penal-3",  "name": "Ação Penal",                                        "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-proc-penal-4",  "name": "Provas",                                            "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-proc-penal-5",  "name": "Inquérito Policial",                                "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-proc-penal-6",  "name": "Competência Penal",                                 "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-proc-penal-7",  "name": "Procedimentos",                                     "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-proc-penal-8",  "name": "Nulidades",                                         "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-proc-penal-9",  "name": "Habeas Corpus e MS Penal",                          "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-proc-penal-10", "name": "Execução Penal (LEP)",                              "estudado": false, "grifado": false, "questoes": false }
    ]
  },
  { "id": "d-dh",               "name": "Direitos Humanos",                                  "weight": 1, "simulados": [],
    "topics": [
      { "id": "d-dh-1",  "name": "Sistema Interamericano de Direitos Humanos",                "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-dh-2",  "name": "Convenção Americana sobre Direitos Humanos (CADH)",         "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-dh-3",  "name": "Sistema Universal de DH (ONU)",                             "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-dh-4",  "name": "Pacto Internacional de Direitos Civis e Políticos",         "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-dh-5",  "name": "Declaração Universal dos Direitos Humanos",                 "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-dh-6",  "name": "Mecanismos de Proteção Internacional",                      "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-dh-7",  "name": "Grupos Vulneráveis",                                        "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-dh-8",  "name": "Corte e Comissão Interamericana",                           "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-dh-9",  "name": "Responsabilidade Internacional do Estado",                  "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-dh-10", "name": "Direitos Econômicos, Sociais e Culturais (DESC)",           "estudado": false, "grifado": false, "questoes": false }
    ]
  },
  { "id": "d-tributario",       "name": "Direito Tributário",                                "weight": 1, "simulados": [],
    "topics": [
      { "id": "d-tributario-1", "name": "Obrigação e Crédito Tributário",                     "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-tributario-2", "name": "Impostos em Espécie",                                "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-tributario-3", "name": "Princípios Constitucionais Tributários",              "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-tributario-4", "name": "Competência Tributária",                              "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-tributario-5", "name": "Exclusão, Suspensão e Extinção do Crédito",          "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-tributario-6", "name": "Responsabilidade Tributária",                        "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-tributario-7", "name": "Execução Fiscal",                                    "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-tributario-8", "name": "Legislação Tributária",                              "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-tributario-9", "name": "Simples Nacional",                                   "estudado": false, "grifado": false, "questoes": false }
    ]
  },
  { "id": "d-consumidor",       "name": "Direito do Consumidor",                             "weight": 1, "simulados": [],
    "topics": [
      { "id": "d-consumidor-1", "name": "Responsabilidade pelo Fato e Vício",                 "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-consumidor-2", "name": "Práticas Comerciais Abusivas",                       "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-consumidor-3", "name": "Proteção Contratual",                                "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-consumidor-4", "name": "Direitos Básicos do Consumidor",                     "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-consumidor-5", "name": "Conceitos Fundamentais",                             "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-consumidor-6", "name": "Defesa do Consumidor em Juízo",                      "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-consumidor-7", "name": "Publicidade",                                        "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-consumidor-8", "name": "Cadastros de Inadimplentes",                         "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-consumidor-9", "name": "Desconsideração da Personalidade Jurídica",          "estudado": false, "grifado": false, "questoes": false }
    ]
  },
  { "id": "d-eca",              "name": "Estatuto da Criança e do Adolescente",              "weight": 1, "simulados": [],
    "topics": [
      { "id": "d-eca-1",  "name": "Ato Infracional e Medidas Socioeducativas",                "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-eca-2",  "name": "Direitos Fundamentais da Criança e Adolescente",           "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-eca-3",  "name": "Família Natural, Extensa e Substituta",                    "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-eca-4",  "name": "Adoção",                                                   "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-eca-5",  "name": "Conselho Tutelar",                                         "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-eca-6",  "name": "Violência contra Criança e Adolescente",                   "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-eca-7",  "name": "Medidas de Proteção",                                      "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-eca-8",  "name": "Internação",                                               "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-eca-9",  "name": "Justiça da Infância e Juventude",                          "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-eca-10", "name": "SINASE",                                                   "estudado": false, "grifado": false, "questoes": false }
    ]
  },
  { "id": "d-empresarial",      "name": "Direito Empresarial",                               "weight": 1, "simulados": [],
    "topics": [
      { "id": "d-empresarial-1", "name": "Títulos de Crédito",                               "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-empresarial-2", "name": "Falência e Recuperação Judicial",                  "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-empresarial-3", "name": "Sociedades Empresariais",                          "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-empresarial-4", "name": "Contratos Empresariais",                           "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-empresarial-5", "name": "Estabelecimento e Registro",                       "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-empresarial-6", "name": "Responsabilidade dos Sócios",                      "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-empresarial-7", "name": "Propriedade Industrial",                           "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-empresarial-8", "name": "Nome Empresarial",                                 "estudado": false, "grifado": false, "questoes": false }
    ]
  },
  { "id": "d-ambiental",        "name": "Direito Ambiental",                                 "weight": 1, "simulados": [],
    "topics": [
      { "id": "d-ambiental-1", "name": "Política Nacional do Meio Ambiente",                  "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-ambiental-2", "name": "Responsabilidade Ambiental",                          "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-ambiental-3", "name": "Código Florestal",                                    "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-ambiental-4", "name": "Licenciamento Ambiental",                             "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-ambiental-5", "name": "Crimes Ambientais (Lei 9605/98)",                     "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-ambiental-6", "name": "Unidades de Conservação (SNUC)",                      "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-ambiental-7", "name": "Recursos Hídricos",                                   "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-ambiental-8", "name": "Dano Ambiental e Reparação",                          "estudado": false, "grifado": false, "questoes": false }
    ]
  },
  { "id": "d-idoso-pcd",        "name": "Estatuto do Idoso e da PCD",                        "weight": 1, "simulados": [],
    "topics": [
      { "id": "d-idoso-pcd-1", "name": "Estatuto da Pessoa com Deficiência (LBI)",            "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-idoso-pcd-2", "name": "Direitos Fundamentais do Idoso",                      "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-idoso-pcd-3", "name": "Prioridade no Atendimento",                           "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-idoso-pcd-4", "name": "Violência contra o Idoso",                            "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-idoso-pcd-5", "name": "Inclusão da Pessoa com Deficiência",                  "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-idoso-pcd-6", "name": "Acessibilidade e Mobilidade",                         "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-idoso-pcd-7", "name": "Benefícios Assistenciais (BPC/LOAS)",                 "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-idoso-pcd-8", "name": "Trabalho da Pessoa com Deficiência",                  "estudado": false, "grifado": false, "questoes": false }
    ]
  },
  { "id": "d-dp-institucional", "name": "Princípios Institucionais da Defensoria Pública",   "weight": 1, "simulados": [],
    "topics": [
      { "id": "d-dp-institucional-1", "name": "Lei Complementar 80/94 (LONDP)",               "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-dp-institucional-2", "name": "Autonomia Funcional, Administrativa e Orçam.", "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-dp-institucional-3", "name": "Garantias e Prerrogativas dos Defensores",     "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-dp-institucional-4", "name": "Atribuições da Defensoria Pública",            "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-dp-institucional-5", "name": "Assistência Jurídica Gratuita",                "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-dp-institucional-6", "name": "Organização e Estrutura da DP",                "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-dp-institucional-7", "name": "Carreira do Defensor Público",                 "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-dp-institucional-8", "name": "Corregedoria e Fiscalização",                  "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-dp-institucional-9", "name": "Atuação Coletiva da DP",                       "estudado": false, "grifado": false, "questoes": false }
    ]
  },
  { "id": "d-filosofia",        "name": "Filosofia e Sociologia do Direito",                 "weight": 1, "simulados": [],
    "topics": [
      { "id": "d-filosofia-1",  "name": "Hermenêutica Jurídica e Interpretação",              "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-filosofia-2",  "name": "Teoria Geral do Direito",                            "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-filosofia-3",  "name": "Fontes do Direito",                                  "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-filosofia-4",  "name": "Direito e Moral",                                    "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-filosofia-5",  "name": "Teoria da Argumentação Jurídica",                    "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-filosofia-6",  "name": "Justiça e Equidade",                                 "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-filosofia-7",  "name": "Positivismo Jurídico e Escola Histórica",            "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-filosofia-8",  "name": "Sociologia do Conflito e Acesso à Justiça",          "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-filosofia-9",  "name": "Crítica ao Direito (Escola de Frankfurt)",           "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-filosofia-10", "name": "Funções Sociais do Direito",                         "estudado": false, "grifado": false, "questoes": false }
    ]
  },
  { "id": "d-portugues",        "name": "Língua Portuguesa",                                 "weight": 1, "simulados": [],
    "topics": [
      { "id": "d-portugues-1",  "name": "Interpretação e Compreensão de Texto",               "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-portugues-2",  "name": "Concordância Verbal e Nominal",                      "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-portugues-3",  "name": "Regência Verbal e Nominal",                          "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-portugues-4",  "name": "Crase",                                              "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-portugues-5",  "name": "Sintaxe",                                            "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-portugues-6",  "name": "Morfologia",                                         "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-portugues-7",  "name": "Ortografia e Acentuação",                            "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-portugues-8",  "name": "Pontuação",                                          "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-portugues-9",  "name": "Colocação Pronominal",                               "estudado": false, "grifado": false, "questoes": false },
      { "id": "d-portugues-10", "name": "Semântica e Figuras de Linguagem",                   "estudado": false, "grifado": false, "questoes": false }
    ]
  }
];

const INITIAL_SHARED = {
  streak: 0,
  bestStreak: 0,
  shields: 0,
  dailyLogs: [],
  simulados: [],
  goals: { dailyHours: 4, weeklyHours: 28, dailyQuestions: 40, weeklyQuestions: 250, dailyFlashcards: 30 },
  xp: 0,
  achievements: [],
  petStage: 0,
  petHealth: 'healthy',
  concursos: [],
  historicoProvas: [],
};

const INITIAL_OBJETIVA  = { subjects: INITIAL_SUBJECTS_OBJ,  heatmap: {} };
const INITIAL_DISCURSIVA = { subjects: INITIAL_SUBJECTS_DISC };

// ── Utilities ──
function getSubjectCompletionObj(subject) {
  const total = subject.topics.length * 5;
  if (total === 0) return 0;
  let checks = 0;
  subject.topics.forEach(t => {
    ['lei','doutrina','juris','questoes','revisao'].forEach(f => { if (t[f]) checks++; });
  });
  return (checks / total) * 100;
}
function getSubjectCompletionDisc(subject) {
  const total = subject.topics.length * 3;
  if (total === 0) return 0;
  let checks = 0;
  subject.topics.forEach(t => {
    ['estudado','grifado','questoes'].forEach(f => { if (t[f]) checks++; });
  });
  return (checks / total) * 100;
}
function getTotalStatsObj(subjects) {
  let total = 0, checks = 0;
  subjects.forEach(s => {
    total += s.topics.length * 5;
    s.topics.forEach(t => {
      ['lei','doutrina','juris','questoes','revisao'].forEach(f => { if (t[f]) checks++; });
    });
  });
  return { total, checks, percentage: total === 0 ? 0 : (checks / total) * 100 };
}
function getTotalStatsDisc(subjects) {
  let total = 0, checks = 0;
  subjects.forEach(s => {
    total += s.topics.length * 3;
    s.topics.forEach(t => {
      ['estudado','grifado','questoes'].forEach(f => { if (t[f]) checks++; });
    });
  });
  return { total, checks, percentage: total === 0 ? 0 : (checks / total) * 100 };
}

function getLevelInfo(xp) {
  const tiers = [
    { min: 0,    max: 149,     name: 'Aspirante',        color: '#E2DDE0' },
    { min: 150,  max: 399,     name: 'Estagiário(a)',    color: '#8FB8FF' },
    { min: 400,  max: 899,     name: 'Advogado(a)',      color: '#4FD1A5' },
    { min: 900,  max: 1999,    name: 'Aprovado(a)',      color: '#E8C47A' },
    { min: 2000, max: 3999,    name: 'Nomeado(a)',       color: '#B7AAFF' },
    { min: 4000, max: Infinity, name: 'Empossado(a)',    color: '#FF7A8A' },
  ];
  const tier = tiers.find(t => xp >= t.min && xp <= t.max) || tiers[0];
  const next = tiers[tiers.indexOf(tier) + 1];
  return { tier, next, progress: next ? (xp - tier.min) / (next.min - tier.min) : 1, toNext: next ? next.min - xp : 0 };
}

function daysUntil(iso) {
  if (!iso) return null;
  const now = new Date(); now.setHours(0,0,0,0);
  const then = new Date(iso); then.setHours(0,0,0,0);
  return Math.round((then - now) / (1000 * 60 * 60 * 24));
}

// ── Pet System ──
const PET_STAGES = [
  { stage: 1, name: 'Ovinho Místico',         minXp: 0,    nextXp: 50,
    color: '#fff5e0', accent: '#E8C47A', glow: '#E8C97A', shellColor: '#fff0d8',
    desc: 'Algo místico está adormecido aqui dentro… A jornada começa em silêncio.' },
  { stage: 2, name: 'Ovo Trincando',          minXp: 50,   nextXp: 150,
    color: '#fff0d0', accent: '#B7AAFF', glow: '#C9C1FF', shellColor: '#ffe5b8',
    desc: 'A casca começa a ceder! Sinais de vida pulsam por dentro.' },
  { stage: 3, name: 'Filhote Recém-Eclodido', minXp: 150,  nextXp: 400,
    color: '#e8e0ff', accent: '#C9C1FF', glow: '#B7AAFF',
    desc: 'Eclodiu! Olhos enormes descobrem o mundo pela primeira vez. 🌱' },
  { stage: 4, name: 'Dragãozinho Curioso',    minXp: 400,  nextXp: 900,
    color: '#d8d0f8', accent: '#B7AAFF', glow: '#C9C1FF',
    desc: 'Pequenos chifrinhos despontaram. Já ensaia os primeiros voos curtos.' },
  { stage: 5, name: 'Dragão Jovem',           minXp: 900,  nextXp: 2000,
    color: '#c8b8f8', accent: '#4A37A8', glow: '#C9C1FF',
    desc: 'Asas mais firmes, olhar determinado. Sua jornada se intensifica. ✨' },
  { stage: 6, name: 'Dragão Adulto',          minXp: 2000, nextXp: 4000,
    color: '#a8a0e8', accent: '#3A2780', glow: '#B7AAFF',
    desc: 'Forma plena. Sabedoria nos olhos. Pronto para grandes batalhas jurídicas.' },
  { stage: 7, name: 'Dragão Concurseiro',     minXp: 4000, nextXp: 7000,
    color: '#9488f8', accent: '#2A1860', glow: '#FF7A8A',
    desc: 'Vestiu a toga! Segura o livro da Lei. Pronto para a posse. ⚖️' },
  { stage: 8, name: 'Empossado(a)',           minXp: 7000, nextXp: Infinity,
    color: '#b0a4f8', accent: '#E8C47A', glow: '#E8C97A',
    desc: 'Forma final. Aura de justiça encarnada. A aprovação chegou. 👑' },
];

function getPetStageInfo(xp) {
  const idx = PET_STAGES.findIndex(s => xp >= s.minXp && xp < s.nextXp);
  const stage = idx >= 0 ? PET_STAGES[idx] : PET_STAGES[PET_STAGES.length - 1];
  const realIdx = PET_STAGES.indexOf(stage);
  const next = PET_STAGES[realIdx + 1];
  const span = next ? (next.minXp - stage.minXp) : 1;
  const progress = next ? Math.min(1, (xp - stage.minXp) / span) : 1;
  const xpToNext = next ? next.minXp - xp : 0;
  return { ...stage, progress, next, xpToNext };
}
function getPetStage(xp) { return getPetStageInfo(xp).stage; }

function daysSinceLastStudy(dailyLogs) {
  const studied = dailyLogs.filter(l => (l.hours > 0) || (l.questions > 0) || (l.reviews > 0));
  if (studied.length === 0) return Infinity;
  const last = studied.map(l => l.date).sort().reverse()[0];
  const today = new Date(); today.setHours(0,0,0,0);
  const lastD = new Date(last + 'T00:00:00');
  return Math.max(0, Math.round((today - lastD) / 86400000));
}

function studied2DaysInRow(dailyLogs) {
  const today = new Date(); today.setHours(0,0,0,0);
  const yest = new Date(today); yest.setDate(yest.getDate() - 1);
  const todayISO = today.toISOString().slice(0,10);
  const yestISO  = yest.toISOString().slice(0,10);
  const wasActive = (iso) => {
    const l = dailyLogs.find(d => d.date === iso);
    return l && ((l.hours > 0) || (l.questions > 0) || (l.reviews > 0));
  };
  return wasActive(todayISO) && wasActive(yestISO);
}

function nextPetHealth(currentHealth, dailyLogs) {
  if (currentHealth === 'healthy') {
    if (dailyLogs.length === 0) return 'healthy';
    return daysSinceLastStudy(dailyLogs) >= 3 ? 'sick' : 'healthy';
  }
  return studied2DaysInRow(dailyLogs) ? 'healthy' : 'sick';
}

// ── Constância (streak with weekend pass) ──
const CONSTANCIA_HOURS_MIN = 0.5;

function firstLogDate(dailyLogs) {
  const active = (dailyLogs || []).filter(l => (l.hours || 0) + (l.questions || 0) + (l.reviews || 0) > 0);
  if (active.length === 0) return null;
  return active.map(l => l.date).sort()[0];
}

function calcConstancia(dailyLogs) {
  const logs = dailyLogs || [];
  const firstISO = firstLogDate(logs);
  if (!firstISO) return 0;
  const logMap = new Map(logs.map(l => [l.date, l]));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let streak = 0;
  for (let i = 0; i < 730; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    if (iso < firstISO) break;
    const dow = d.getDay();
    if (dow === 0 || dow === 6) { streak++; continue; } // weekends auto-fulfilled
    const log = logMap.get(iso);
    const hours = log ? (log.hours || 0) : 0;
    if (hours >= CONSTANCIA_HOURS_MIN) {
      streak++;
    } else {
      if (i === 0) continue; // today still counts if not yet studied
      break;
    }
  }
  return streak;
}

function calcConstanciaRecord(dailyLogs) {
  const logs = dailyLogs || [];
  const start = firstLogDate(logs);
  if (!start) return 0;
  const logMap = new Map(logs.map(l => [l.date, l]));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const startDate = new Date(start + 'T00:00:00');
  let best = 0;
  let cur = 0;
  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    if (dow === 0 || dow === 6) { // weekends auto-fulfilled
      cur++;
      if (cur > best) best = cur;
      continue;
    }
    const iso = d.toISOString().slice(0, 10);
    const log = logMap.get(iso);
    const hours = log ? (log.hours || 0) : 0;
    if (hours >= CONSTANCIA_HOURS_MIN) {
      cur++;
      if (cur > best) best = cur;
    } else {
      cur = 0;
    }
  }
  return best;
}

// ── Simulado totals ──
function simuladoTotals(sim) {
  const rows = (sim && sim.disciplinas) || [];
  let questions = 0, correct = 0, wrong = 0;
  rows.forEach(r => {
    questions += Number(r.questions) || 0;
    correct   += Number(r.correct)   || 0;
    wrong     += Number(r.wrong)     || 0;
  });
  const accuracy = questions > 0 ? (correct / questions) * 100 : 0;
  return { questions, correct, wrong, accuracy };
}

// XP awarded for a completed simulado
function simuladoXp(sim) {
  const t = simuladoTotals(sim);
  if (t.questions === 0) return 10;
  return Math.min(120, 10 + t.correct);
}

// Aggregate accuracy combining dailyLogs and simulados.
// dailyLogs already store correct/wrong per entry; simulados store per-disciplina.
function aggregateAcertos(shared) {
  let correct = 0, wrong = 0;
  (shared.dailyLogs || []).forEach(l => {
    const ents = (l.entries && l.entries.length > 0) ? l.entries : [l];
    ents.forEach(e => { correct += e.correct || 0; wrong += e.wrong || 0; });
  });
  (shared.simulados || []).forEach(sim => {
    const t = simuladoTotals(sim);
    correct += t.correct;
    wrong   += t.wrong;
  });
  const total = correct + wrong;
  const pct = total > 0 ? (correct / total) * 100 : 0;
  return { correct, wrong, total, pct };
}

window.DA = {
  INITIAL_SHARED, INITIAL_OBJETIVA, INITIAL_DISCURSIVA,
  getSubjectCompletionObj, getSubjectCompletionDisc,
  getTotalStatsObj, getTotalStatsDisc,
  getLevelInfo, daysUntil, getPetStage,
  PET_STAGES, getPetStageInfo,
  daysSinceLastStudy, studied2DaysInRow, nextPetHealth,
  CONSTANCIA_HOURS_MIN, firstLogDate, calcConstancia, calcConstanciaRecord,
  simuladoTotals, simuladoXp, aggregateAcertos,
};
