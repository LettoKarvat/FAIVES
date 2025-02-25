// src/mocks/accesses.js

export const mockAccesses = [
  {
    id: 1,
    clientId: 1, // Ex.: "Cliente ABC"
    ip: "192.168.1.100",
    acesso: "123 456 789",
    senha: "SENHA_EXEMPLO_123",
    userAdm: "Administrador",
    descricao: "Servidor Principal",
  },
  {
    id: 2,
    clientId: 1,
    ip: "192.168.1.101",
    acesso: "987 654 321",
    senha: "SENHA_EXEMPLO_456",
    userAdm: "Servidor-App",
    descricao: "Servidor de Aplicação",
  },
  {
    id: 3,
    clientId: 2,
    ip: "192.168.2.200",
    acesso: "555 666 777",
    senha: "SENHA_EXEMPLO_789",
    userAdm: "TI",
    descricao: "Máquina de TI",
  },
  // Adicione mais acessos conforme necessário
];
