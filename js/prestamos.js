// ============================================
// Gestión de Préstamos - Logic
// ============================================

// Check authentication
document.addEventListener('DOMContentLoaded', () => {
    const session = localStorage.getItem('contaSession') || sessionStorage.getItem('contaSession');
    
    if (!session) {
        window.location.href = 'login.html';
        return;
    }
    
    initPrestamos();
});

// Base de datos local (localStorage)
let prestamos = [];
let sectorActual = 'todos';

function initPrestamos() {
    // Cargar préstamos del localStorage
    const savedPrestamos = localStorage.getItem('prestamos');
    if (savedPrestamos) {
        prestamos = JSON.parse(savedPrestamos);
    } else {
        // Datos de ejemplo
        prestamos = [
            {
                id: Date.now() + 1,
                cliente: 'María González',
                documento: '12345678',
                telefono: '987654321',
                sector: 'comercio',
                capital: 5000,
                interes: 5,
                plazo: 6,
                fechaInicio: '2026-01-15',
                pagos: [
                    { fecha: '2026-02-15', monto: 900, metodoPago: 'efectivo', notas: 'Primera cuota' },
                    { fecha: '2026-02-17', monto: 500, metodoPago: 'yape', notas: 'Pago parcial adicional' }
                ],
                estado: 'activo'
            },
            {
                id: Date.now() + 2,
                cliente: 'Juan Pérez',
                documento: '87654321',
                telefono: '999888777',
                sector: 'servicios',
                capital: 3000,
                interes: 6,
                plazo: 4,
                fechaInicio: '2025-12-01',
                pagos: [],
                estado: 'vencido'
            },
            {
                id: Date.now() + 3,
                cliente: 'Ana Torres',
                documento: '45678912',
                telefono: '912345678',
                sector: 'produccion',
                capital: 8000,
                interes: 4.5,
                plazo: 12,
                fechaInicio: '2026-02-01',
                pagos: [
                    { fecha: '2026-02-10', monto: 700, metodoPago: 'yape' }
                ],
                estado: 'activo'
            }
        ];
        guardarPrestamos();
    }
    
    // Setup event listeners
    setupEventListeners();
    
    // Actualizar vista
    actualizarKPIs();
    actualizarSectores();
    renderPrestamos();
    
    // Verificar préstamos vencidos
    verificarVencimientos();
}

function setupEventListeners() {
    // Nuevo préstamo
    document.getElementById('btnNuevoPrestamo').addEventListener('click', abrirModalNuevo);
    document.getElementById('btnCerrarModal').addEventListener('click', cerrarModales);
    document.getElementById('btnCancelarPrestamo').addEventListener('click', cerrarModales);
    document.getElementById('modalOverlay').addEventListener('click', cerrarModales);
    document.getElementById('formNuevoPrestamo').addEventListener('submit', crearPrestamo);
    
    // Calcular resumen en tiempo real
    const form = document.getElementById('formNuevoPrestamo');
    form.querySelector('[name="capital"]').addEventListener('input', actualizarResumen);
    form.querySelector('[name="interes"]').addEventListener('input', actualizarResumen);
    form.querySelector('[name="plazo"]').addEventListener('input', actualizarResumen);
    form.querySelector('[name="fechaInicio"]').addEventListener('change', actualizarResumen);
    
    // Pago
    document.getElementById('btnCerrarPago').addEventListener('click', cerrarModales);
    document.getElementById('btnCancelarPago').addEventListener('click', cerrarModales);
    document.getElementById('formPago').addEventListener('submit', registrarPago);
    
    // Detalle
    document.getElementById('btnCerrarDetalle').addEventListener('click', cerrarModales);
    
    // Sectores
    document.querySelectorAll('.sector-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.sector-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            sectorActual = tab.dataset.sector;
            renderPrestamos();
        });
    });
    
    // Logout
    document.getElementById('btnLogout').addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('¿Cerrar sesión?')) {
            localStorage.removeItem('contaSession');
            sessionStorage.removeItem('contaSession');
            window.location.href = 'login.html';
        }
    });
}

// ============================================
// Cálculos
// ============================================

function calcularIntereses(capital, tasaInteres) {
    return capital * (tasaInteres / 100);
}

function calcularTotalPagar(capital, interes) {
    return capital + calcularIntereses(capital, interes);
}

function calcularCuotaMensual(totalPagar, plazo) {
    return totalPagar / plazo;
}

function calcularFechaVencimiento(fechaInicio, plazo) {
    const fecha = new Date(fechaInicio);
    fecha.setMonth(fecha.getMonth() + plazo);
    return fecha;
}

function calcularPagado(prestamo) {
    return prestamo.pagos.reduce((sum, pago) => sum + pago.monto, 0);
}

function calcularSaldo(prestamo) {
    const total = calcularTotalPagar(prestamo.capital, prestamo.interes);
    return total - calcularPagado(prestamo);
}

function estaVencido(prestamo) {
    const fechaVencimiento = calcularFechaVencimiento(prestamo.fechaInicio, prestamo.plazo);
    const hoy = new Date();
    return hoy > fechaVencimiento && calcularSaldo(prestamo) > 0;
}

function diasParaVencer(prestamo) {
    const fechaVencimiento = calcularFechaVencimiento(prestamo.fechaInicio, prestamo.plazo);
    const hoy = new Date();
    const diff = fechaVencimiento - hoy;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ============================================
// KPIs y Stats
// ============================================

function actualizarKPIs() {
    const capitalTotal = prestamos
        .filter(p => p.estado !== 'finalizado')
        .reduce((sum, p) => sum + p.capital, 0);
    
    const porCobrar = prestamos
        .filter(p => p.estado !== 'finalizado')
        .reduce((sum, p) => sum + calcularSaldo(p), 0);
    
    const prestamosVencidos = prestamos.filter(p => estaVencido(p));
    const montoVencido = prestamosVencidos.reduce((sum, p) => sum + calcularSaldo(p), 0);
    
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const pagosEsteMes = prestamos.flatMap(p => 
        p.pagos.filter(pago => new Date(pago.fecha) >= inicioMes)
    );
    const recuperadoMes = pagosEsteMes.reduce((sum, pago) => sum + pago.monto, 0);
    
    // Calcular métodos de pago
    const todosPagos = prestamos.flatMap(p => p.pagos);
    const pagosEfectivo = todosPagos.filter(p => p.metodoPago === 'efectivo');
    const pagosYape = todosPagos.filter(p => p.metodoPago === 'yape');
    
    const totalEfectivo = pagosEfectivo.reduce((sum, p) => sum + p.monto, 0);
    const totalYape = pagosYape.reduce((sum, p) => sum + p.monto, 0);
    const totalRecaudado = totalEfectivo + totalYape;
    
    document.getElementById('capitalTotal').textContent = formatearMoneda(capitalTotal);
    document.getElementById('prestamosActivos').textContent = 
        `${prestamos.filter(p => p.estado !== 'finalizado').length} préstamos activos`;
    
    document.getElementById('porCobrar').textContent = formatearMoneda(porCobrar);
    document.getElementById('interesesGenerados').textContent = 
        `Incluye S/ ${formatearMoneda(porCobrar - capitalTotal).replace('S/ ', '')} en intereses`;
    
    document.getElementById('vencidos').textContent = prestamosVencidos.length;
    document.getElementById('montoVencido').textContent = `${formatearMoneda(montoVencido)} en mora`;
    
    document.getElementById('recuperadoMes').textContent = formatearMoneda(recuperadoMes);
    document.getElementById('pagosRecibidos').textContent = `${pagosEsteMes.length} pagos recibidos`;
    
    // Actualizar métodos de pago
    document.getElementById('totalEfectivo').textContent = formatearMoneda(totalEfectivo);
    document.getElementById('pagosEfectivo').textContent = `${pagosEfectivo.length} pagos`;
    
    document.getElementById('totalYape').textContent = formatearMoneda(totalYape);
    document.getElementById('pagosYape').textContent = `${pagosYape.length} pagos`;
    
    document.getElementById('totalRecaudado').textContent = formatearMoneda(totalRecaudado);
    document.getElementById('totalPagos').textContent = `${todosPagos.length} pagos totales`;
}

function actualizarSectores() {
    const sectores = {
        todos: prestamos.filter(p => p.estado !== 'finalizado').length,
        comercio: prestamos.filter(p => p.sector === 'comercio' && p.estado !== 'finalizado').length,
        servicios: prestamos.filter(p => p.sector === 'servicios' && p.estado !== 'finalizado').length,
        produccion: prestamos.filter(p => p.sector === 'produccion' && p.estado !== 'finalizado').length,
        otros: prestamos.filter(p => p.sector === 'otros' && p.estado !== 'finalizado').length
    };
    
    Object.keys(sectores).forEach(sector => {
        const el = document.getElementById(`count${sector.charAt(0).toUpperCase() + sector.slice(1)}`);
        if (el) el.textContent = sectores[sector];
    });
}

// ============================================
// Render Préstamos
// ============================================

function renderPrestamos() {
    const tbody = document.getElementById('prestamosBody');
    const prestamosFiltrados = sectorActual === 'todos' 
        ? prestamos.filter(p => p.estado !== 'finalizado')
        : prestamos.filter(p => p.sector === sectorActual && p.estado !== 'finalizado');
    
    if (prestamosFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: 40px; color: var(--gray-600);">
                    No hay préstamos ${sectorActual !== 'todos' ? 'en este sector' : 'registrados'}
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = prestamosFiltrados.map(prestamo => {
        const totalPagar = calcularTotalPagar(prestamo.capital, prestamo.interes);
        const intereses = calcularIntereses(prestamo.capital, prestamo.interes);
        const pagado = calcularPagado(prestamo);
        const saldo = calcularSaldo(prestamo);
        const vencido = estaVencido(prestamo);
        const fechaVencimiento = calcularFechaVencimiento(prestamo.fechaInicio, prestamo.plazo);
        const dias = diasParaVencer(prestamo);
        
        return `
            <tr class="${vencido ? 'vencido' : ''}">
                <td>
                    <div class="cliente-info">
                        <div class="cliente-nombre">${prestamo.cliente}</div>
                        <div class="cliente-documento">DNI: ${prestamo.documento || 'N/A'}</div>
                    </div>
                </td>
                <td>
                    <span class="sector-badge sector-${prestamo.sector}">
                        ${prestamo.sector.charAt(0).toUpperCase() + prestamo.sector.slice(1)}
                    </span>
                </td>
                <td><span class="monto">${formatearMoneda(prestamo.capital)}</span></td>
                <td><span class="monto">${formatearMoneda(intereses)}</span></td>
                <td><span class="monto">${formatearMoneda(totalPagar)}</span></td>
                <td><span class="monto">${formatearMoneda(pagado)}</span></td>
                <td><span class="monto">${formatearMoneda(saldo)}</span></td>
                <td>${prestamo.plazo} meses</td>
                <td>
                    ${formatearFecha(fechaVencimiento)}
                    ${vencido ? '<br><span style="color: var(--color-danger); font-size: 0.75rem; font-weight: 600;">VENCIDO</span>' : 
                       dias <= 7 && dias > 0 ? `<br><span style="color: var(--color-warning); font-size: 0.75rem; font-weight: 600;">Vence en ${dias} días</span>` : ''}
                </td>
                <td>
                    <span class="estado-badge ${vencido ? 'estado-vencido' : 'estado-activo'}">
                        <span class="estado-indicator"></span>
                        ${vencido ? 'Vencido' : 'Activo'}
                    </span>
                </td>
                <td>
                    <div class="acciones-btns">
                        <button class="btn-icon btn-pago" onclick="abrirModalPago(${prestamo.id})" title="Registrar pago">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="1" x2="12" y2="23"/>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-detalle" onclick="verDetalle(${prestamo.id})" title="Ver detalle">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 16v-4"/>
                                <path d="M12 8h.01"/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-eliminar" onclick="eliminarPrestamo(${prestamo.id})" title="Eliminar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// ============================================
// Modales
// ============================================

function abrirModalNuevo() {
    document.getElementById('modalNuevoPrestamo').classList.add('active');
    document.querySelector('[name="fechaInicio"]').valueAsDate = new Date();
    actualizarResumen();
}

function cerrarModales() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
    document.getElementById('formNuevoPrestamo').reset();
    document.getElementById('formPago').reset();
}

function actualizarResumen() {
    const capital = parseFloat(document.querySelector('[name="capital"]').value) || 0;
    const interes = parseFloat(document.querySelector('[name="interes"]').value) || 0;
    const plazo = parseInt(document.querySelector('[name="plazo"]').value) || 0;
    const fechaInicio = document.querySelector('[name="fechaInicio"]').value;
    
    const intereses = calcularIntereses(capital, interes);
    const total = calcularTotalPagar(capital, interes);
    const cuota = calcularCuotaMensual(total, plazo);
    
    document.getElementById('resumenCapital').textContent = formatearMoneda(capital);
    document.getElementById('resumenIntereses').textContent = formatearMoneda(intereses);
    document.getElementById('resumenTotal').textContent = formatearMoneda(total);
    document.getElementById('resumenCuota').textContent = formatearMoneda(cuota);
    
    if (fechaInicio && plazo) {
        const vencimiento = calcularFechaVencimiento(fechaInicio, plazo);
        document.getElementById('resumenVencimiento').textContent = formatearFecha(vencimiento);
    }
}

// ============================================
// CRUD Operations
// ============================================

function crearPrestamo(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const prestamo = {
        id: Date.now(),
        cliente: formData.get('cliente'),
        documento: formData.get('documento'),
        telefono: formData.get('telefono'),
        sector: formData.get('sector'),
        capital: parseFloat(formData.get('capital')),
        interes: parseFloat(formData.get('interes')),
        plazo: parseInt(formData.get('plazo')),
        fechaInicio: formData.get('fechaInicio'),
        pagos: [],
        estado: 'activo'
    };
    
    prestamos.push(prestamo);
    guardarPrestamos();
    cerrarModales();
    actualizarKPIs();
    actualizarSectores();
    renderPrestamos();
    
    alert(`✅ Préstamo registrado exitosamente para ${prestamo.cliente}`);
}

function abrirModalPago(id) {
    const prestamo = prestamos.find(p => p.id === id);
    if (!prestamo) return;
    
    document.getElementById('pagoPrestamoId').value = id;
    document.getElementById('pagoCliente').textContent = prestamo.cliente;
    document.getElementById('pagoSaldo').textContent = formatearMoneda(calcularSaldo(prestamo));
    document.querySelector('#modalPago [name="fecha"]').valueAsDate = new Date();
    
    document.getElementById('modalPago').classList.add('active');
}

function registrarPago(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const id = parseInt(formData.get('prestamoId'));
    const monto = parseFloat(formData.get('monto'));
    const metodoPago = formData.get('metodoPago');
    
    if (!metodoPago) {
        alert('⚠️ Por favor selecciona un método de pago');
        return;
    }
    
    const prestamo = prestamos.find(p => p.id === id);
    if (!prestamo) return;
    
    const saldoActual = calcularSaldo(prestamo);
    
    if (monto > saldoActual) {
        alert(`⚠️ El monto del pago (${formatearMoneda(monto)}) no puede ser mayor al saldo pendiente (${formatearMoneda(saldoActual)})`);
        return;
    }
    
    const pago = {
        fecha: formData.get('fecha'),
        monto: monto,
        metodoPago: metodoPago,
        notas: formData.get('notas')
    };
    
    prestamo.pagos.push(pago);
    
    // Verificar si se liquidó completamente
    const nuevoSaldo = calcularSaldo(prestamo);
    const metodoEmoji = metodoPago === 'efectivo' ? '💵' : '📱';
    const metodoNombre = metodoPago === 'efectivo' ? 'Efectivo' : 'Yape';
    
    if (nuevoSaldo <= 0) {
        prestamo.estado = 'finalizado';
        alert(`✅ ¡Préstamo liquidado! 
        
El cliente ${prestamo.cliente} ha terminado de pagar.
Último pago: ${formatearMoneda(monto)} vía ${metodoEmoji} ${metodoNombre}`);
    } else {
        alert(`✅ Pago registrado exitosamente

Monto: ${formatearMoneda(monto)}
Método: ${metodoEmoji} ${metodoNombre}
Saldo restante: ${formatearMoneda(nuevoSaldo)}`);
    }
    
    guardarPrestamos();
    cerrarModales();
    actualizarKPIs();
    actualizarSectores();
    renderPrestamos();
}

function verDetalle(id) {
    const prestamo = prestamos.find(p => p.id === id);
    if (!prestamo) return;
    
    const totalPagar = calcularTotalPagar(prestamo.capital, prestamo.interes);
    const pagado = calcularPagado(prestamo);
    const saldo = calcularSaldo(prestamo);
    const fechaVencimiento = calcularFechaVencimiento(prestamo.fechaInicio, prestamo.plazo);
    const cuotaSugerida = calcularCuotaMensual(totalPagar, prestamo.plazo);
    
    const html = `
        <div style="padding: 24px;">
            <div class="detalle-cliente" style="margin-bottom: 24px;">
                <h3 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 8px;">${prestamo.cliente}</h3>
                <p style="color: var(--gray-600);">DNI: ${prestamo.documento || 'N/A'} | Tel: ${prestamo.telefono || 'N/A'}</p>
            </div>
            
            <div class="detalle-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 32px;">
                <div style="background: var(--gray-50); padding: 16px; border-radius: 12px;">
                    <div style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 4px;">Capital Prestado</div>
                    <div style="font-size: 1.5rem; font-weight: 700;">${formatearMoneda(prestamo.capital)}</div>
                </div>
                <div style="background: var(--gray-50); padding: 16px; border-radius: 12px;">
                    <div style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 4px;">Tasa de Interés</div>
                    <div style="font-size: 1.5rem; font-weight: 700;">${prestamo.interes}%</div>
                </div>
                <div style="background: var(--gray-50); padding: 16px; border-radius: 12px;">
                    <div style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 4px;">Total a Pagar</div>
                    <div style="font-size: 1.5rem; font-weight: 700;">${formatearMoneda(totalPagar)}</div>
                </div>
                <div style="background: var(--gray-50); padding: 16px; border-radius: 12px;">
                    <div style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 4px;">Cuota Sugerida</div>
                    <div style="font-size: 1.5rem; font-weight: 700;">${formatearMoneda(cuotaSugerida)}</div>
                </div>
                <div style="background: rgba(16, 185, 129, 0.1); padding: 16px; border-radius: 12px;">
                    <div style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 4px;">Pagado</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-success);">${formatearMoneda(pagado)}</div>
                </div>
                <div style="background: rgba(239, 68, 68, 0.1); padding: 16px; border-radius: 12px;">
                    <div style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 4px;">Saldo Pendiente</div>
                    <div style="font-size: 1.5rem; font-weight: 700; color: var(--color-danger);">${formatearMoneda(saldo)}</div>
                </div>
            </div>
            
            <div style="margin-bottom: 24px;">
                <h4 style="font-weight: 700; margin-bottom: 12px;">Información del Préstamo</h4>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--gray-600);">Plazo:</span>
                        <strong>${prestamo.plazo} meses</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--gray-600);">Fecha de inicio:</span>
                        <strong>${formatearFecha(new Date(prestamo.fechaInicio))}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--gray-600);">Fecha de vencimiento:</span>
                        <strong>${formatearFecha(fechaVencimiento)}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--gray-600);">Sector:</span>
                        <strong>${prestamo.sector.charAt(0).toUpperCase() + prestamo.sector.slice(1)}</strong>
                    </div>
                </div>
            </div>
            
            <div>
                <h4 style="font-weight: 700; margin-bottom: 12px;">Historial de Pagos (${prestamo.pagos.length})</h4>
                ${prestamo.pagos.length === 0 ? 
                    '<p style="color: var(--gray-600); text-align: center; padding: 20px;">No hay pagos registrados</p>' :
                    `<div style="max-height: 300px; overflow-y: auto;">
                        ${prestamo.pagos.map((pago, index) => {
                            const metodoEmoji = pago.metodoPago === 'efectivo' ? '💵' : pago.metodoPago === 'yape' ? '📱' : '💰';
                            const metodoNombre = pago.metodoPago === 'efectivo' ? 'Efectivo' : pago.metodoPago === 'yape' ? 'Yape' : 'Sin método';
                            const metodoColor = pago.metodoPago === 'efectivo' ? '#16A34A' : pago.metodoPago === 'yape' ? '#722F92' : '#64748B';
                            
                            return `
                            <div style="padding: 12px; background: var(--gray-50); border-radius: 8px; margin-bottom: 8px; border-left: 4px solid ${metodoColor};">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                    <strong>Pago #${index + 1}</strong>
                                    <strong style="color: var(--color-success);">${formatearMoneda(pago.monto)}</strong>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                    <span style="font-size: 0.875rem; color: var(--gray-600);">
                                        ${formatearFecha(new Date(pago.fecha))}
                                    </span>
                                    <span style="display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; background: ${metodoColor}15; color: ${metodoColor}; border-radius: 50px; font-size: 0.75rem; font-weight: 600;">
                                        ${metodoEmoji} ${metodoNombre}
                                    </span>
                                </div>
                                ${pago.notas ? `<div style="font-size: 0.8125rem; color: var(--gray-600); font-style: italic;">
                                    "${pago.notas}"
                                </div>` : ''}
                            </div>
                        `}).join('')}
                    </div>`
                }
            </div>
        </div>
    `;
    
    document.getElementById('detalleContenido').innerHTML = html;
    document.getElementById('modalDetalle').classList.add('active');
}

function eliminarPrestamo(id) {
    const prestamo = prestamos.find(p => p.id === id);
    if (!prestamo) return;
    
    if (confirm(`¿Eliminar el préstamo de ${prestamo.cliente}?\n\nEsta acción no se puede deshacer.`)) {
        prestamos = prestamos.filter(p => p.id !== id);
        guardarPrestamos();
        actualizarKPIs();
        actualizarSectores();
        renderPrestamos();
        alert('✅ Préstamo eliminado');
    }
}

// ============================================
// Verificación de Vencimientos
// ============================================

function verificarVencimientos() {
    const prestamosVencidos = prestamos.filter(p => estaVencido(p));
    
    if (prestamosVencidos.length > 0) {
        const mensaje = `⚠️ ALERTA: Tienes ${prestamosVencidos.length} préstamo(s) vencido(s):\n\n` +
            prestamosVencidos.map(p => 
                `• ${p.cliente}: ${formatearMoneda(calcularSaldo(p))} pendiente`
            ).join('\n');
        
        console.warn(mensaje);
    }
    
    // Verificar préstamos próximos a vencer (7 días o menos)
    const proximosVencer = prestamos.filter(p => {
        const dias = diasParaVencer(p);
        return dias > 0 && dias <= 7 && p.estado !== 'finalizado';
    });
    
    if (proximosVencer.length > 0) {
        console.info(`📅 ${proximosVencer.length} préstamo(s) vencen esta semana`);
    }
}

// ============================================
// Utilidades
// ============================================

function guardarPrestamos() {
    localStorage.setItem('prestamos', JSON.stringify(prestamos));
}

function formatearMoneda(valor) {
    return `S/ ${valor.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
}

function formatearFecha(fecha) {
    return fecha.toLocaleDateString('es-PE', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
}

// Exponer funciones globales necesarias
window.abrirModalPago = abrirModalPago;
window.verDetalle = verDetalle;
window.eliminarPrestamo = eliminarPrestamo;