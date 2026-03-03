/* Waterflows — main.js (vanilla, mínimo)
   - Menu hamburger (mobile)
   - Link ativo por página
   - Formulário: gera mailto com assunto e corpo
   - Processo circular (track + fill, anima 1→5)
*/

(function () {
  const navToggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav]');
  const overlay = document.querySelector('[data-nav-overlay]');

  function closeNav() {
    if (!nav) return;
    nav.classList.remove('open');
    if (overlay) overlay.hidden = true;
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }

  function openNav() {
    if (!nav) return;
    nav.classList.add('open');
    if (overlay) overlay.hidden = false;
    if (navToggle) navToggle.setAttribute('aria-expanded', 'true');
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.contains('open');
      isOpen ? closeNav() : openNav();
    });
  }

  if (overlay) overlay.addEventListener('click', closeNav);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });

  // Link ativo por página
  const current = (document.body.getAttribute('data-page') || '').trim();
  if (current) {
    document.querySelectorAll('.nav-list a[data-page]').forEach((a) => {
      if (a.getAttribute('data-page') === current) a.classList.add('active');
    });
  }

  // Form: mailto
  const mailBtn = document.querySelector('[data-mailto-btn]');
  const form = document.querySelector('[data-contact-form]');

  function encode(str) {
    return encodeURIComponent((str || '').trim());
  }

  if (mailBtn && form) {
    mailBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const nome = form.querySelector('[name="nome"]')?.value || '';
      const empresa = form.querySelector('[name="empresa"]')?.value || '';
      const email = form.querySelector('[name="email"]')?.value || '';
      const telefone = form.querySelector('[name="telefone"]')?.value || '';
      const mensagem = form.querySelector('[name="mensagem"]')?.value || '';

      // Placeholders conforme briefing (sem dados reais)
      const to = 'A_CONFIRMAR@waterflows.com.br';

      const subject = `Contato - Waterflows (${empresa || 'Empresa a confirmar'})`;
      const body =
`Nome: ${nome}
Empresa: ${empresa}
E-mail: ${email}
Telefone: ${telefone}

Mensagem:
${mensagem}

—
Enviado pelo site institucional Waterflows.`;

      const href = `mailto:${encode(to)}?subject=${encode(subject)}&body=${encode(body)}`;
      window.location.href = href;
    });
  }

  // Fecha nav ao clicar em link (mobile)
  document.querySelectorAll('.nav-list a').forEach((a) => {
    a.addEventListener('click', () => {
      const probe = navToggle || document.createElement('div');
      if (window.getComputedStyle(probe).display !== 'none') closeNav();
    });
  });
})();


// ===== Processo circular (Como atuamos) — track + fill =====
(function () {
  const root = document.querySelector("[data-process]");
  if (!root) return;

  root.classList.add("js");

  const svg = root.querySelector(".process-ring");
  if (!svg) return;

  // Agora usamos track + fill
  const tracks = Array.from(svg.querySelectorAll(".ring-seg-track"));
  const fills  = Array.from(svg.querySelectorAll(".ring-seg-fill"));

  // Se o SVG não foi atualizado, evita quebrar
  if (tracks.length !== 5 || fills.length !== 5) {
    // Fallback: tenta achar o antigo .ring-seg (sem track)
    // Mas o efeito desejado (track sempre visível + fill) exige o SVG novo.
    return;
  }

  const tabs = Array.from(root.querySelectorAll(".process-tab"));
  const title = root.querySelector(".process-title");
  const desc = root.querySelector(".process-desc");

  const steps = [
    { t: "Diagnóstico", d: "Levantamento do cenário, pontos críticos e restrições operacionais." },
    { t: "Planejamento", d: "Definição de método, cronograma e critérios de verificação." },
    { t: "Aplicação", d: "Execução orientada ao ambiente operacional e ao objetivo definido." },
    { t: "Acompanhamento", d: "Suporte em campo e ajustes operacionais quando aplicável." },
    { t: "Relatório", d: "Registro técnico e próximos passos para manutenção de performance." },
  ];

  // Helpers: arco SVG
  function polarToCartesian(cx, cy, r, angle) {
    const rad = (angle - 90) * Math.PI / 180.0;
    return { x: cx + (r * Math.cos(rad)), y: cy + (r * Math.sin(rad)) };
  }

  function arcPath(cx, cy, r, startAngle, endAngle) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);
    const large = (endAngle - startAngle) <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
  }

  // Define 5 arcos com gap
  const cx = 110, cy = 110, r = 78;
  const total = 360;
  const gap = 10;                           // graus entre segmentos
  const segAngle = (total - gap * 5) / 5;   // ângulo útil por segmento
  let angle = -90;                          // começa no topo

  for (let i = 0; i < 5; i++) {
    const start = angle + gap / 2;
    const end = start + segAngle;
    const d = arcPath(cx, cy, r, start, end);

    tracks[i].setAttribute("d", d);
    fills[i].setAttribute("d", d);

    angle = end + gap / 2;

    // dash para animação do fill
    const len = fills[i].getTotalLength();
    fills[i].style.strokeDasharray = `${len} ${len}`;
    fills[i].style.strokeDashoffset = `${len}`; // começa vazio
  }

  function setPanel(index) {
    if (title) title.textContent = steps[index].t;
    if (desc) desc.textContent = steps[index].d;
    tabs.forEach((b, i) => b.setAttribute("aria-selected", i === index ? "true" : "false"));
  }

  function setActive(index, animate = true) {
    // cores + preenchimento
    fills.forEach((seg, i) => {
      const len = seg.getTotalLength();

      seg.classList.toggle("is-active", i === index);
      seg.classList.toggle("is-filled", i < index);

      if (!animate) {
        // instantâneo: completos até index
        seg.style.transition = "none";
        seg.style.strokeDashoffset = (i <= index) ? "0" : `${len}`;
        // reativa transitions para próximas mudanças
        void seg.getBoundingClientRect();
        seg.style.transition = "stroke-dashoffset .65s ease";
        return;
      }

      // anima: anteriores completos, atual desenha, próximos vazios
      if (i < index) {
        seg.style.transition = "stroke-dashoffset .35s ease";
        seg.style.strokeDashoffset = "0";
      } else if (i === index) {
        seg.style.transition = "none";
        seg.style.strokeDashoffset = `${len}`;  // começa vazio
        void seg.getBoundingClientRect();
        seg.style.transition = "stroke-dashoffset .65s ease";
        seg.style.strokeDashoffset = "0";       // desenha
      } else {
        seg.style.transition = "stroke-dashoffset .35s ease";
        seg.style.strokeDashoffset = `${len}`;
      }
    });

    setPanel(index);
  }

  // Clique nos tabs: muda o ativo (sem reanimar tudo)
  tabs.forEach((btn, i) => {
    btn.addEventListener("click", () => setActive(i, false));
  });

  // Animação sequencial ao entrar na tela (1→5)
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;

      if (reduce) {
        setActive(0, false);
        obs.disconnect();
        return;
      }

      // reset: tudo vazio
      fills.forEach((seg) => {
        const len = seg.getTotalLength();
        seg.classList.remove("is-active", "is-filled");
        seg.style.transition = "none";
        seg.style.strokeDashoffset = `${len}`;
      });

      // sequência
      let i = 0;
      setActive(0, true);

      const timer = setInterval(() => {
        i++;
        if (i >= 5) {
          clearInterval(timer);
          obs.disconnect();
          return;
        }
        setActive(i, true);
      }, 750);
    });
  }, { threshold: 0.35 });

  obs.observe(root);

  // estado inicial do painel (evita vazio)
  setPanel(0);
})();