export type FaqCategory =
  | "primeiros-passos"
  | "grupos"
  | "listas"
  | "mercado"
  | "despensa-gastos"
  | "app-conta"

export type FaqItem = {
  question: string
  answer: string
  category: FaqCategory
}

/** Rótulo de cada seção do FAQ. */
export const faqCategoryLabels: Record<FaqCategory, string> = {
  "primeiros-passos": "Primeiros passos",
  grupos: "Grupo e convites",
  listas: "Listas e produtos",
  mercado: "No mercado",
  "despensa-gastos": "Despensa e gastos",
  "app-conta": "App e conta",
}

/** Ordem em que as seções aparecem na tela. */
export const faqCategoryOrder: FaqCategory[] = [
  "primeiros-passos",
  "grupos",
  "listas",
  "mercado",
  "despensa-gastos",
  "app-conta",
]

export const faqItems: FaqItem[] = [
  // Primeiros passos
  {
    category: "primeiros-passos",
    question: "Como faço para entrar no app?",
    answer: "O acesso é feito com sua conta Google na tela de login. Não é preciso criar senha.",
  },
  {
    category: "primeiros-passos",
    question: "Acabei de entrar. Por onde começo?",
    answer:
      "Primeiro você cria um grupo (ou entra em um com convite). Depois é só criar sua primeira lista e adicionar os produtos. O card de primeiros passos na tela inicial mostra o que ainda falta configurar.",
  },
  {
    category: "primeiros-passos",
    question: "Preciso usar sozinho ou dá para compartilhar?",
    answer:
      "O app foi feito para compartilhar. Tudo o que você cria fica dentro de um grupo, e todos os membros veem e editam as mesmas listas, produtos e gastos em tempo real.",
  },

  // Grupo e convites
  {
    category: "grupos",
    question: "O que é um grupo?",
    answer:
      "Um grupo é um espaço compartilhado com seus membros, produtos e listas próprias. Tudo o que acontece nas listas fica visível para todos do grupo.",
  },
  {
    category: "grupos",
    question: "Como convido alguém para o meu grupo?",
    answer:
      'Na aba Grupo, toque em "Gerar link de convite" e compartilhe o link. Só donos e administradores podem gerar convites.',
  },
  {
    category: "grupos",
    question: "Como entro em um grupo com um convite?",
    answer:
      'Cole o link ou o código do convite na seção "Entrar com convite", disponível no seu perfil. No primeiro acesso, você também pode fazer isso na tela inicial.',
  },
  {
    category: "grupos",
    question: "O convite expirou ou já foi usado. E agora?",
    answer:
      "Os links de convite são de uso único e valem por 1 dia. Se o seu não funcionar, peça um novo link a um administrador do grupo.",
  },
  {
    category: "grupos",
    question: "Posso participar de mais de um grupo?",
    answer:
      "Sim. Você pode fazer parte de vários grupos e alternar entre eles pelo seletor no topo da tela.",
  },
  {
    category: "grupos",
    question: "Qual a diferença entre Dono, Administrador e Membro?",
    answer:
      "Donos e administradores podem gerenciar membros e convites do grupo. Membros podem usar as listas e os produtos normalmente.",
  },
  {
    category: "grupos",
    question: "Como removo alguém do grupo?",
    answer:
      "Na aba Grupo, o dono pode remover um membro pelo botão ao lado do nome dele. A pessoa perde o acesso às listas do grupo, mas o histórico de compras é preservado.",
  },
  {
    category: "grupos",
    question: "Como saio de um grupo?",
    answer:
      "Se você não quer mais participar de um grupo, peça ao dono para remover o seu acesso. As listas e os produtos continuam com o restante do grupo.",
  },

  // Listas e produtos
  {
    category: "listas",
    question: "Como crio e organizo minhas listas?",
    answer:
      'Use o botão "Nova lista" na tela inicial. Ao criar, escolha entre uma lista de compras comum ou um projeto com teto de gasto. Dentro da lista, o menu permite renomear ou excluir.',
  },
  {
    category: "listas",
    question: "Qual a diferença entre lista de compras e projeto com teto?",
    answer:
      "A lista de compras é a compra do dia a dia e entra no orçamento do mês e na despensa. O projeto é uma compra pontual (uma reforma, o enxoval do bebê) com um teto de gasto opcional; ele fica à parte e não afeta o orçamento mensal nem a despensa.",
  },
  {
    category: "listas",
    question: "Como adiciono produtos a uma lista?",
    answer:
      'Abra a lista e use o botão "Adicionar produtos" para buscar no catálogo do grupo e adicionar itens.',
  },
  {
    category: "listas",
    question: "Posso adicionar um produto que não está no catálogo?",
    answer:
      "Sim. Digite pelo menos duas letras na busca de produtos e, se não houver correspondência, você pode criá-lo na hora. Ele passa a fazer parte do catálogo do grupo.",
  },
  {
    category: "listas",
    question: "Como marco um item como comprado?",
    answer:
      "Toque na caixa de seleção ou no nome do item. No celular, você também pode deslizar o item para a direita.",
  },

  // No mercado
  {
    category: "mercado",
    question: "O que é o modo mercado?",
    answer:
      'Na tela da lista, ative "Modo mercado" para focar na compra: os itens ficam agrupados por categoria, os já comprados recolhem e aparece um resumo com o total no carrinho e quanto ainda falta.',
  },
  {
    category: "mercado",
    question: "Como registro os preços enquanto compro?",
    answer:
      "Ao marcar um item no modo mercado, você pode informar o preço pago. O app soma tudo em tempo real e ainda sugere o último preço pago pelo grupo como referência.",
  },
  {
    category: "mercado",
    question: "Como finalizo uma compra?",
    answer:
      'Quando terminar, toque em "Finalizar compra". Você confirma o mercado onde comprou e a compra é registrada no histórico de gastos e no orçamento do mês.',
  },
  {
    category: "mercado",
    question: "E os itens da lista que eu não encontrei no mercado?",
    answer:
      "Ao finalizar, os itens que ficaram sem marcação são listados para você decidir o que fazer: mantê-los para a próxima compra ou removê-los da lista.",
  },
  {
    category: "mercado",
    question: "Como mando a lista para quem vai fazer a compra?",
    answer:
      'Na lista, use "Compartilhar" para enviar os itens por mensagem ou gerar um link público somente leitura. Quem abre o link vê os itens sem precisar entrar no app — e isso não adiciona a pessoa ao grupo.',
  },

  // Despensa e gastos
  {
    category: "despensa-gastos",
    question: "O que é a despensa?",
    answer:
      "A despensa acompanha o que você costuma ter em casa. Conforme você finaliza compras, os produtos vão para lá, e você pode marcar quando algo está acabando.",
  },
  {
    category: "despensa-gastos",
    question: "Como funciona a reposição automática?",
    answer:
      "Quando um item da despensa fica abaixo do mínimo, ele aparece num card na tela inicial para você repor com um toque, já adicionando à lista da vez.",
  },
  {
    category: "despensa-gastos",
    question: "Onde vejo meus gastos?",
    answer:
      "A aba Gastos reúne o total do mês, a evolução ao longo do tempo e a divisão por categoria e por mercado, com base nas compras finalizadas do grupo.",
  },
  {
    category: "despensa-gastos",
    question: "Como defino um orçamento mensal?",
    answer:
      "Na tela inicial ou na aba Gastos, toque no card de orçamento e informe o valor do mês. O app mostra quanto você já gastou e quanto ainda resta. Projetos com teto não entram nessa conta.",
  },

  // App e conta
  {
    category: "app-conta",
    question: "Como instalo o app no celular?",
    answer:
      'Quando aparecer o aviso de instalação, toque em "Instalar". No iPhone, use Compartilhar e depois "Adicionar à Tela de Início".',
  },
  {
    category: "app-conta",
    question: "Como ativo as notificações?",
    answer:
      "No seu perfil, ative as notificações no card de notificações e permita o aviso do navegador. Assim você é avisado sobre novidades nas listas do grupo, mesmo com o app fechado.",
  },
  {
    category: "app-conta",
    question: "Meus dados sincronizam entre dispositivos?",
    answer:
      "Sim. Basta entrar com a mesma conta Google em qualquer aparelho para ver suas listas atualizadas.",
  },
]
