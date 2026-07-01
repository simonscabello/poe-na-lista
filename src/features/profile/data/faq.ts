export type FaqItem = {
  question: string
  answer: string
}

export const faqItems: FaqItem[] = [
  {
    question: "Como faço para entrar no app?",
    answer: "O acesso é feito com sua conta Google na tela de login. Não é preciso criar senha.",
  },
  {
    question: "O que é um grupo?",
    answer:
      "Um grupo é um espaço compartilhado com seus membros, produtos e listas próprias. Tudo o que acontece nas listas fica visível para todos do grupo.",
  },
  {
    question: "Como convido alguém para o meu grupo?",
    answer:
      'Na aba Grupo, toque em "Gerar link de convite" e compartilhe o link. Só donos e administradores podem gerar convites.',
  },
  {
    question: "Como entro em um grupo com um convite?",
    answer:
      'Cole o link ou o código do convite na seção "Entrar com convite" desta página. No primeiro acesso, você também pode fazer isso na tela inicial.',
  },
  {
    question: "O convite expirou ou já foi usado. E agora?",
    answer:
      "Os links de convite são de uso único e valem por 1 dia. Se o seu não funcionar, peça um novo link a um administrador do grupo.",
  },
  {
    question: "Posso participar de mais de um grupo?",
    answer:
      "Sim. Você pode fazer parte de vários grupos e alternar entre eles pelo seletor no topo da tela.",
  },
  {
    question: "Qual a diferença entre Dono, Administrador e Membro?",
    answer:
      "Donos e administradores podem gerenciar membros e convites do grupo. Membros podem usar as listas e os produtos normalmente.",
  },
  {
    question: "Como crio e organizo minhas listas?",
    answer:
      "Crie uma nova lista pelo botão na tela inicial. Dentro da lista, use o menu para renomear ou excluir.",
  },
  {
    question: "Como adiciono produtos a uma lista?",
    answer:
      'Abra a lista e use o botão "Adicionar produtos" para buscar no catálogo do grupo e adicionar itens.',
  },
  {
    question: "Posso adicionar um produto que não está no catálogo?",
    answer:
      "Sim. Digite pelo menos duas letras na busca de produtos e, se não houver correspondência, você pode criá-lo na hora.",
  },
  {
    question: "Como marco um item como comprado?",
    answer:
      "Toque na caixa de seleção ou no nome do item. No celular, você também pode deslizar o item para a direita.",
  },
  {
    question: "Como instalo o app no celular?",
    answer:
      'Quando aparecer o aviso de instalação, toque em "Instalar". No iPhone, use Compartilhar e depois "Adicionar à Tela de Início".',
  },
  {
    question: "Meus dados sincronizam entre dispositivos?",
    answer:
      "Sim. Basta entrar com a mesma conta Google em qualquer aparelho para ver suas listas atualizadas.",
  },
]
