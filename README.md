# Instalação

Primeiro, configure as seguintes variáveis de ambiente:

- SECRET: Segredo utilizado para a assinatura dos tokens de login.
- MONGODB_URL: Link para o banco de dados mongodb a ser utilizado.
- ABAKHUS_URL: URL da api do abakhus.
- ABAKHUS_KEY: Key da api do abakhus.
- FILE_DEST: Caminho onde os arquivos serão armazenados

Em seguida, execute os seguintes comandos:

```bash
git clone https://github.com/nicolasduarterj/LearnChain-backend
cd LearnChain-backend
npm install
mkdir -p $FILE_DEST
node index.js (roda o programa)
```

# Rotas

### /api/users

**GET**: Retorna todos os usuários em JSON.

**POST**:

- Cadastra um usuário
- Formato do body: application/json
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
- Formato do body: application/json
- Estrutura:

```JSON
{
    "uName": "username da conta",
    "pass": "senha da conta"
}
```

- Respostas:
  - 200: Sucesso. token de login no body da resposta. O insira como Bearer no header de autorização.
  - 401: Não autorizado. Usuário ou senha errados.

---

### /api/content

**GET**: Retorna todos os cursos em JSON.

**POST**:

- Cria um novo curso.
- Precisa de um token de login Bearer no header de autorização.
- Formato do body: multipart/form-data.
- Estrutura (essa ordem é obrigatória):

| key         | value                                |
|-------------|--------------------------------------|
| title       | título do curso (string)             |
| price       | preço em ETH (number)                |
| description | descrição do curso (string)          |
| material    | arquivos do curso (até 12 arquivos) |


- Respostas:
  - 201: Criado. JSON do curso no body da resposta.
  - 401: Não autorizado. Usuário não está logado.
  - 400: Bad request. Nenhum arquivo anexado.

### /api/content/\[uuid do curso\]
**GET**: Retorna os dados do curso em JSON.

### /api/content/buy/\[uuid do curso\]
**POST**:
- Compra um curso, minta um nft da compra e deposita na conta do usuário.
- Requer um token de login Bearer no header de autorização.
- OBS: O UUID de cada curso pode ser obtido com um GET no /api/content.
- Não precisa de um body.
- Respostas:
  - 200: Token mintado e depositado.
  - 404: Curso inexistente.
  - 500: erro no mint do nft.

---

### /api/tokens
**POST**:
- Retorna os tokens do usuário logado
- Requer um token de login Bearer no header de autorização.
- Formato do body: application/json
- Estrutura:
```JSON
{
  "signature": "Texto base assinado com a chave pública da carteira"
}
```
- Texto base: "Please sign this message to verify your ownership"
- OBS: verifique o frontend-dapp da Hacker House para entender como fazer isso.
- Respostas:
  - 200: OK. JSON dos tokens no body da resposta.
  - 400: Falta de assinatura.
  - 422: Assinatura inválida (?) (não tenho certeza).
- OBS2: isso é um POST (e não um GET) para evitar alguns problemas relacionados ao body do request.