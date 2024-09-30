# Instalação

Primeiro, configure as seguintes variáveis de ambiente:

- SECRET: Segredo utilizado para a assinatura dos tokens de login.
- MONGODB_URL: Link para o banco de dados mongodb a ser utilizado.
- ABAKHUS_URL: URL da api do abakhus.
- ABAKHUS_KEY: Key da api do abakhus.

Em seguida, execute os seguintes comandos:

```bash
git clone https://github.com/nicolasduarterj/LearnChain-backend
cd LearnChain-backend
npm install
mkdir content
node index.js (roda o programa)
```

# Rotas

### /api/users

**GET**: Retorna uma array de usuários em JSON.

**POST**:

- Cadastra um usuário
- Formato: application/json
- Estrutura:
  ```JSON
  {
      "uName": "username único (string)",
      "name": "nome (não único) (string)",
      "pass": "senha (string)",
      "walletAddress": "endereço da carteira Arbitrum (string)"
  }
  ```
- Respostas:
  - 201: Criado. JSON do usuário no body da resposta.
  - 400: Erro de validação de usuário. Verifique a mensagem de erro anexada.

---

### /api/login

**POST**:

- Efetua login.
- Formato: application/json
- Estrutura:

```JSON
{
    "uName": "username da conta",
    "pass": "senha da conta"
}
```

- Respostas:
  - 200: Sucesso. token no body da resposta para ser inserido no Bearer do header de autorização.
  - 401: Não autorizado. Usuário ou senha errados.

---

### /api/content

**GET**: Retorna todos os cursos

**POST**:

- Cria um novo curso.
- Precisa de um token de login Bearer no header de autorização.
- Formato: multipart/form-data
- Estrutura:

```Form-data
title: título do curso. (string)
price: preço em ETH do curso. (número)
description: descrição do curso. (string)
material: arquivos do curso. (até 12 arquivos).
Obs. Essa ordem é obrigatória.
```

- Respostas:
  - 201: Criado. JSON do curso no body da resposta.
  - 403: Não autorizado. Usuário não está logado.
  - 400: Bad request. Nenhum arquivo anexado.

### /api/content/buy/\[uuid do curso\]
**POST**:
- Compra um curso, minta um nft do curso e deposita na conta do usuário.
- Requer um token de login Bearer no header de autorização.
- O UUID de cada curso pode ser obtido com um GET no /api/content
- Não precisa de um body.
- Respostas:
  - 200: Token mintado e depositado.
  - 404: Curso inexistente.
  - 500: erro no mint do nft.