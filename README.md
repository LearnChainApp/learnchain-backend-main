# Instalação
Primeiro, configure as seguintes variáveis de ambiente:
- SECRET: Segredo utilizado para a assinatura dos tokens de login.
- MONGODB_URL: Link para o banco de dados mongodb a ser utilizado.

Em seguida, execute os seguintes comandos:
```bash
git clone https://github.com/nicolasduarterj/LearnChain-backend
cd LearnChain-backend
npm install
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
    - 200: Sucesso. token no body da resposta.
    - 401: Não autorizado. Usuário ou senha errados.

---