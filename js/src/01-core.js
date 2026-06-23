/* ============================================================
   SOFI · NÚCLEO DE LA APLICACIÓN
   Estado global, autenticación, navegación y router de vistas.
   ============================================================ */

/* ---- ESTADO ---- */
let currentRole = 'directivo';
let currentView = 'dashboard';

/* ---- METADATOS DE ROL ---- */
const roleMeta = {
  directivo: { label: 'Directivo', badge: 'DG', name: 'Dir. González' },
  vendedor:  { label: 'Vendedor',  badge: 'MR', name: 'M. Rodríguez' },
  asistente: { label: 'Asistente', badge: 'AP', name: 'A. Pérez' },
};

/* ---- CONFIGURACIÓN DE NAVEGACIÓN POR ROL ---- */
const navConfig = {
  directivo: [
    { section: 'PRINCIPAL', items: [
      { id: 'dashboard', icon: '', label: 'Dashboard' },
    ]},
    { section: 'INMUEBLES', items: [
      { id: 'desarrollos', icon: '', label: 'Desarrollos' },
      { id: 'lotes',       icon: '', label: 'Lotes' },
    ]},
    { section: 'COMERCIAL', items: [
      { id: 'clientes',  icon: '', label: 'Clientes' },
      { id: 'contratos', icon: '', label: 'Contratos' },
    ]},
    { section: 'FINANZAS', items: [
      { id: 'flujo',    icon: '', label: 'Flujo de Efectivo' },
      { id: 'analisis', icon: '', label: 'Análisis Financiero' },
    ]},
    { section: 'ADMINISTRACIÓN', items: [
      { id: 'usuarios', icon: '', label: 'Usuarios' },
      { id: 'roles',    icon: '', label: 'Roles' },
    ]},
  ],
  vendedor: [
    { section: 'PRINCIPAL', items: [
      { id: 'dashboard', icon: '', label: 'Mi Dashboard' },
    ]},
    { section: 'VENTAS', items: [
      { id: 'clientes',  icon: '', label: 'Mis Clientes' },
      { id: 'lotes',     icon: '', label: 'Lotes Disponibles' },
      { id: 'contratos', icon: '', label: 'Mis Contratos' },
    ]},
  ],
  asistente: [
    { section: 'PRINCIPAL', items: [
      { id: 'dashboard', icon: '', label: 'Dashboard' },
    ]},
    { section: 'OPERATIVO', items: [
      { id: 'flujo',    icon: '', label: 'Flujo de Efectivo' },
      { id: 'clientes', icon: '', label: 'Clientes' },
      { id: 'testigos', icon: '', label: 'Testigos' },
    ]},
  ],
};

/* Etiquetas de breadcrumb para TODAS las vistas, incluyendo sub-vistas
   (crear / detalle), para que el breadcrumb nunca quede vacío. */
const viewLabels = {
  dashboard: 'Dashboard',
  desarrollos: 'Desarrollos', 'crear-desarrollo': 'Nuevo Desarrollo', 'detalle-desarrollo': 'Detalle de Desarrollo',
  lotes: 'Lotes', 'crear-lote': 'Nuevo Lote', 'detalle-lote': 'Detalle de Lote',
  clientes: 'Clientes', 'crear-cliente': 'Nuevo Cliente', 'detalle-cliente': 'Detalle de Cliente',
  contratos: 'Contratos', 'crear-contrato': 'Nuevo Contrato', 'detalle-contrato': 'Detalle de Contrato',
  flujo: 'Flujo de Efectivo', 'detalle-flujo': 'Detalle de Movimiento', 'registrar-pago': 'Registrar Pago', 'detalle-pago': 'Detalle de Pago',
  analisis: 'Análisis Financiero',
  usuarios: 'Usuarios', 'crear-usuario': 'Nuevo Usuario',
  roles: 'Roles', 'crear-rol': 'Nuevo Rol',
  testigos: 'Testigos', 'crear-testigo': 'Nuevo Testigo',
  simulador: 'Simulador de Financiamiento',
  'design-system': 'Sistema de Diseño',
};

/* ---- LOGIN / LOGOUT ---- */
function selectRole(role, el) {
  currentRole = role;
  var roleBtns = document.querySelectorAll('.role-btn');
  for (var i = 0; i < roleBtns.length; i++) roleBtns[i].classList.remove('active');
  el.classList.add('active');
}

async function doLogin() {
  const emailInput = document.getElementById('login-email');
  const errorBox   = document.getElementById('login-error');

  // Validación mínima — en un backend real esto se verificaría en servidor.
  if (emailInput && !emailInput.value.trim()) {
    if (errorBox) {
      errorBox.textContent = 'Ingresa tu correo electrónico para continuar.';
      errorBox.classList.add('visible');
    }
    emailInput.focus();
    return;
  }
  if (errorBox) errorBox.classList.remove('visible');
  // If an API client is configured, try server-side login. Otherwise continue local flow.
  try {
    if (window.api && typeof window.api.login === 'function') {
      await window.api.login(emailInput.value.trim());
    }
  } catch (err) {
    if (errorBox) {
      errorBox.textContent = 'Error iniciando sesión en el servidor.';
      errorBox.classList.add('visible');
    }
    console.error('login error', err);
    // proceed to local shell anyway so dev can continue (optional: stop here if desired)
  }

  document.getElementById('login-screen').style.display = 'none';
  const shell = document.getElementById('app-shell');
  shell.classList.add('visible');
  const m = roleMeta[currentRole];
  document.getElementById('sb-role-badge').textContent = m.label;
  document.getElementById('sb-avatar').textContent     = m.badge;
  document.getElementById('sb-name').textContent       = m.name;
  document.getElementById('sb-role').textContent       = m.label;
  buildNav();
  navigate('dashboard');
}

function doLogout() {
  document.getElementById('app-shell').classList.remove('visible');
  var sb = document.getElementById('sidebar');
  var scrim = document.getElementById('sidebar-scrim');
  if (sb) sb.classList.remove('open');
  if (scrim) scrim.classList.remove('visible');
  document.getElementById('login-screen').style.display = 'flex';
}

/* ---- SIDEBAR: CONSTRUCCIÓN Y TOGGLE MÓVIL ---- */
function buildNav() {
  const nav = document.getElementById('sb-nav');
  nav.innerHTML = '';
  navConfig[currentRole].forEach(section => {
    const lbl = document.createElement('div');
    lbl.className = 'nav-section-label';
    lbl.textContent = section.section;
    nav.appendChild(lbl);
    section.items.forEach(item => {
      const div = document.createElement('div');
      div.className = 'nav-item';
      div.dataset.id = item.id;
      div.setAttribute('role', 'button');
      div.setAttribute('tabindex', '0');
      div.innerHTML = `<span class="nav-icon">${item.icon}</span>${item.label}`;
      div.onclick = () => { navigate(item.id); closeSidebarOnMobile(); };
      div.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); div.click(); } };
      nav.appendChild(div);
    });
  });
}

function toggleSidebar() {
  var sb = document.getElementById('sidebar');
  var scrim = document.getElementById('sidebar-scrim');
  if (sb) sb.classList.toggle('open');
  if (scrim) scrim.classList.toggle('visible');
}
function closeSidebarOnMobile() {
  if (window.innerWidth <= 900) {
    var sb = document.getElementById('sidebar');
    var scrim = document.getElementById('sidebar-scrim');
    if (sb) sb.classList.remove('open');
    if (scrim) scrim.classList.remove('visible');
  }
}

/* ---- NAVEGACIÓN ---- */
function navigate(viewId, subLabel) {
  currentView = viewId;
  var navItems = document.querySelectorAll('.nav-item');
  for (var i = 0; i < navItems.length; i++) {
    var n = navItems[i];
    if (n.dataset.id === viewId) n.classList.add('active');
    else n.classList.remove('active');
  }

  const lbl = subLabel || viewLabels[viewId] || viewId;
  document.getElementById('breadcrumb').innerHTML =
    `<span>SOFI</span><span class="sep">›</span><span class="current">${lbl}</span>`;

  const pc = document.getElementById('page-content');
  pc.innerHTML = renderView(viewId);
  pc.scrollTop = 0;
}

/* Alias retro-compatible usado por algunas vistas heredadas */
function navigate2(viewId, sub) { navigate(viewId, sub); }

/* ---- ENRUTADOR DE VISTAS ---- */
function renderView(id) {
  // Ruta global, disponible sin importar el rol activo.
  if (id === 'design-system') return viewDesignSystem();

  const r = currentRole;
  if (r === 'directivo') {
    switch (id) {
      case 'dashboard':   return viewDirectivoDashboard();
      case 'desarrollos': return viewDesarrollos();
      case 'lotes':       return viewLotes();
      case 'clientes':    return viewClientes();
      case 'contratos':   return viewContratos();
      case 'flujo':       return viewFlujo();
      case 'analisis':    return viewAnalisis();
      case 'usuarios':    return viewUsuarios();
      case 'roles':       return viewRoles();
      /* sub-vistas */
      case 'crear-desarrollo':   return viewCrearDesarrollo();
      case 'detalle-desarrollo': return viewDetalleDesarrollo();
      case 'crear-lote':         return viewCrearLote();
      case 'detalle-lote':       return viewDetalleLote();
      case 'crear-cliente':      return viewCrearCliente();
      case 'detalle-cliente':    return viewDetalleCliente();
      case 'crear-contrato':     return viewCrearContrato();
      case 'detalle-contrato':   return viewDetalleContrato();
      case 'crear-usuario':      return viewCrearUsuario();
      case 'crear-rol':          return viewCrearRol();
      case 'detalle-flujo':      return viewDetalleFlujo();
      default: return viewDirectivoDashboard();
    }
  }
  if (r === 'vendedor') {
    switch (id) {
      case 'dashboard':        return viewVendedorDashboard();
      case 'clientes':         return viewVendedorClientes();
      case 'lotes':            return viewVendedorLotes();
      case 'contratos':        return viewVendedorContratos();
      case 'crear-cliente':    return viewCrearClienteVend();
      case 'simulador':        return viewSimulador();
      case 'detalle-contrato': return viewDetalleContrato();
      case 'crear-contrato':   return viewCrearContratoVend();
      case 'detalle-lote':     return viewDetalleLote();
      default: return viewVendedorDashboard();
    }
  }
  if (r === 'asistente') {
    switch (id) {
      case 'dashboard':      return viewAsistenteDashboard();
      case 'flujo':          return viewAsistenteFlujo();
      case 'clientes':       return viewAsistenteClientes();
      case 'testigos':       return viewTestigos();
      case 'crear-testigo':  return viewCrearTestigo();
      case 'registrar-pago': return viewRegistrarPago();
      case 'detalle-pago':   return viewDetallePago();
      default: return viewAsistenteDashboard();
    }
  }
  return '<div class="empty-state"><div class="empty-icon"></div><div class="empty-title">Vista no encontrada</div></div>';
}

/* Cierra la barra lateral móvil si la ventana crece a escritorio */
window.addEventListener('resize', function() {
  if (window.innerWidth > 900) {
    var sb = document.getElementById('sidebar');
    if (sb) sb.classList.remove('open');
  }
});
