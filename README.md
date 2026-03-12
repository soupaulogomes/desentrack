# DesenTrack

O **DesenTrack** é um aplicativo web de rastreamento GPS e telemetria. Ele utiliza mapas interativos para exibir localizações e possui um backend integrado para persistência de dados e autenticação.

## 🚀 Tecnologias e Stack

- **Frontend:** [Next.js](https://nextjs.org/) (App Router), [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/)
- **Mapas:** [Leaflet](https://leafletjs.com/) e [React-Leaflet](https://react-leaflet.js.org/)
- **Backend / Banco de Dados / Auth:** [Supabase](https://supabase.com/)
- **Linguagem:** TypeScript

---

## 🛠️ Pré-requisitos

Para rodar este projeto localmente, você precisará ter instalado em sua máquina:

1. **[Node.js](https://nodejs.org/)** (Recomendado versão 20 ou superior)
2. **Gerenciador de pacotes** (`npm`, `yarn`, `pnpm` ou `bun`)
3. Uma conta e um projeto configurado no **[Supabase](https://supabase.com/)**.

---

## ⚙️ Configuração do Projeto

1. Entre na pasta do projeto web:
   ```bash
   cd web-app
   ```

2. Instale as dependências executando um dos comandos abaixo:
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   # ou
   bun install
   ```

3. Crie ou atualize o arquivo **`.env.local`** na raiz da pasta `web-app` com as credenciais do seu projeto Supabase:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://sua-url-do-supabase.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-do-supabase
   ```
   > **Nota:** As credenciais atuais do seu projeto do Supabase podem ser encontradas no painel do Supabase, em **Project Settings > API**.

---

## 💻 Rodando Localmente

Para iniciar o servidor de desenvolvimento local, execute:

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
# ou
bun dev
```

Abra o seu navegador e acesse [http://localhost:3000](http://localhost:3000) para ver a aplicação rodando. 🎉

---

## 📝 Scripts Disponíveis

No diretório do projeto, você pode executar:

- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Cria a versão de produção otimizada da aplicação.
- `npm run start`: Inicia o servidor de produção localmente (após rodar o build).
- `npm run lint`: Executa a verificação de erros de código (ESLint).
