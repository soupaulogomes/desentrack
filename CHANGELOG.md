# DesenTrack Changelog

Todos os registros de mudanças, melhorias e correções no sistema de telemetria DesenTrack serão documentados neste arquivo, seguindo o padrão de versionamento semântico (SemVer).

---

## [0.0.1] - 2024-10-XX (MVP)

### ✨ Funcionalidades Adicionadas (Added)
- **Rastreamento Geolocation API**: Captura de coordenadas GPS, velocidade e nível de precisão em tempo real.
- **Integração Realtime (Supabase)**: Inserção de dados validados e escuta em tempo real para sincronização instantânea do mapa.
- **HUD Telemetry Panel (Estilo Cyberpunk/Ficção Científica)**: 
  - Painel de instrumentos em roxo e branco puro focado em altíssima visibilidade.
  - Velocímetro digital (em km/h) com glow reativo.
  - Indicador de status (ONLINE/OFFLINE) e qualidade do sinal GPS (Ótimo/Regular/Fraco).
- **Controle de Rastreamento (Toggle)**: Botão flutuante estilo chave de segurança de painel (ON/OFF).
- **Mapa Dinâmico (Leaflet)**:
  - Base de dados CartoDB DarkMatter (tema escuro com máximo contraste).
  - Marcador da posição local (Pin roxo pulsante com bordas brancas).
  - Círculo translúcido (com 3 níveis de cor) delimitando visualmente o raio de precisão do GPS.
  - Linha de traço histórico (Polyline) mapeando todo o trajeto recebido via Socket Supabase.
- **Lógica de Qualidade de GPS**: Rejeição de posições esporádicas e imprecisas (ex: triangulação de roteadores no Desktop - erro > 500m), com aviso visual no log do painel.
- **Autolimpeza**: Zeramento de rastro, trajetos, HUD e componentes quando o sistema entra em stand-by (OFFLINE).
- **Tema Customizado**: Nova paleta estabelecida `brand-core` em base de roxos e cinzas na folha `globals.css`.
- **Rebranding**: Nome alterado de UI de "Desenapp" para "DesenTrack v0.0.1".

### 🔧 Configurações Técnicas
- Setup inicial via `create-next-app` com TypeScript, Tailwind CSS, e `src/` directory.
- Módulos `react-leaflet`, `leaflet` injetados dinamicamente via `next/dynamic` bypassando erros de SSR nativos do framework.
- Supabase Key/URL blindados em `.env.local`.
