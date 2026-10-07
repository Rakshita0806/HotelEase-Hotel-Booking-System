/* ═══════════════════════════════════════════
   AURUM GRAND — Frontend Application
   ═══════════════════════════════════════════ */

const API = '/api';
let state = {
  rooms: [],
  bookings: [],
  currentRoom: null,
  editingRoom: null,
  editingBooking: null,
  filter: { search: '', type: '', capacity: '', sort: '' },
  bookingFilter: { search: '', status: '' },
  stats: { totalRooms: 0, totalBookings: 0, revenue: 0, occupancy: 0 }
};

/* ─── UTILITIES ─────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const fmtMoney = (n) => '₹' + Number(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d + 'T00:00:00');
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const nightsBetween = (a, b) => {
  if (!a || !b) return 0;
  const diff = (new Date(b) - new Date(a)) / 86400000;
  return diff > 0 ? diff : 0;
};
const todayStr = () => new Date().toISOString().split('T')[0];

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.innerHTML = `<span>${type === 'success' ? '✓' : '⚠'}</span><span>${msg}</span>`;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(40px)'; setTimeout(() => el.remove(), 400); }, 3200);
}

async function api(path, opts = {}) {
  const res = await fetch(API + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

/* ─── INIT ──────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  $('#year').textContent = new Date().getFullYear();
  setDefaultDates();
  loadAll();
  bindEvents();
});

function setDefaultDates() {
  const t = new Date();
  const tm = new Date(t); tm.setDate(t.getDate() + 1);
  const d = (x) => x.toISOString().split('T')[0];
  ['qCheckIn', 'bkCheckIn'].forEach(id => { const el = $('#' + id); if (el) el.value = d(t); });
  ['qCheckOut', 'bkCheckOut'].forEach(id => { const el = $('#' + id); if (el) el.value = d(tm); });
  ['qCheckIn', 'qCheckOut', 'bkCheckIn', 'bkCheckOut'].forEach(id => {
    const el = $('#' + id); if (el) el.min = d(t);
  });
}

async function loadAll() {
  await Promise.all([loadRooms(), loadBookings(), loadStats()]);
}

/* ─── DATA LOADERS ──────────────────────── */
async function loadRooms() {
  try {
    const params = new URLSearchParams();
    if (state.filter.search) params.set('search', state.filter.search);
    if (state.filter.type) params.set('type', state.filter.type);
    if (state.filter.capacity) params.set('capacity', state.filter.capacity);
    if (state.filter.sort) params.set('sort', state.filter.sort);
    
    state.rooms = await api('/rooms?' + params.toString());
    renderRooms();
    populateTypeFilter();
    renderRoomTable();
  } catch (e) { toast(e.message, 'error'); }
}

async function loadBookings() {
  try {
    const params = new URLSearchParams();
    if (state.bookingFilter.search) params.set('search', state.bookingFilter.search);
    if (state.bookingFilter.status) params.set('status', state.bookingFilter.status);
    
    state.bookings = await api('/bookings?' + params.toString());
    renderBookings();
  } catch (e) { toast(e.message, 'error'); }
}

async function loadStats() {
  try {
    state.stats = await api('/stats');
    animateStats();
  } catch (e) { console.error(e); }
}

function animateStats() {
  const map = {
    statRooms: state.stats.totalRooms,
    statBookings: state.stats.totalBookings,
    statOccupancy: state.stats.occupancy
  };
  Object.entries(map).forEach(([id, target]) => {
    const el = $('#' + id);
    if (!el) return;
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const timer = setInterval(() => {
      cur += step;
      if (cur >= target) { cur = target; clearInterval(timer); }
      el.textContent = cur;
    }, 30);
  });
  $('#statRevenue').textContent = fmtMoney(state.stats.revenue);
  $('#tabBookingCount').textContent = state.stats.totalBookings;
  $('#tabRoomCount').textContent = state.stats.totalRooms;
}

/* ─── RENDER ROOMS ──────────────────────── */
function renderRooms() {
  const grid = $('#roomGrid');
  if (!state.rooms.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="empty__icon">🔍</div><h4>No rooms found</h4><p>Try adjusting your filters.</p></div>`;
    return;
  }

  grid.innerHTML = state.rooms.map(r => {
    const amenities = (r.amenities || '').split(',').map(a => a.trim()).filter(Boolean).slice(0, 4);
    const img = r.image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800';
    return `
      <div class="room-card">
        <div class="room-card__img">
          <img src="${img}" alt="${r.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800'" />
          <span class="room-card__badge">${r.type}</span>
          <span class="room-card__price">${fmtMoney(r.price)}<span>/night</span></span>
        </div>
        <div class="room-card__body">
          <p class="room-card__type">${r.type} · ${r.size || 0} m²</p>
          <h3 class="room-card__name">${r.name}</h3>
          <p class="room-card__desc">${r.description || 'A beautifully appointed room.'}</p>
          <div class="room-card__meta">
            <span>👤 ${r.capacity} Guests</span>
            <span>🛏 ${r.beds} Beds</span>
            <span>🏢 ${r.units} Units</span>
          </div>
          <div class="room-card__amenities">
            ${amenities.map(a => `<span>${a}</span>`).join('')}
          </div>
          <div class="room-card__footer">
            <button class="btn btn--gold" onclick="openBookingModal(${r.id})">Reserve Now</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function populateTypeFilter() {
  const types = [...new Set(state.rooms.map(r => r.type))].sort();
  const sel = $('#fType');
  const cur = sel.value;
  sel.innerHTML = `<option value="">All Categories</option>` + types.map(t => `<option value="${t}">${t}</option>`).join('');
  sel.value = cur;
}

/* ─── RENDER BOOKINGS TABLE ─────────────── */
function renderBookings() {
  const tbody = $('#bookingBody');
  const empty = $('#bookingEmpty');
  if (!state.bookings.length) {
    tbody.innerHTML = '';
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  tbody.innerHTML = state.bookings.map(b => {
    const nights = nightsBetween(b.check_in, b.check_out);
    return `
      <tr>
        <td><b>#${String(b.id).padStart(4, '0')}</b></td>
        <td>
          <div style="font-weight:500">${b.guest_name}</div>
          <div style="font-size:0.75rem;color:var(--text-light)">${b.email}</div>
        </td>
        <td>${b.room_name || '—'}</td>
        <td>
          <div style="font-size:0.8rem">${fmtDate(b.check_in)}</div>
          <div style="font-size:0.75rem;color:var(--text-light)">→ ${fmtDate(b.check_out)}</div>
        </td>
        <td>${nights}</td>
        <td><b>${fmtMoney(b.total_price)}</b></td>
        <td><span class="badge badge--${b.status}">${b.status}</span></td>
        <td class="ta-r">
          <button class="action-btn action-btn--edit" onclick="editBooking(${b.id})">Edit</button>
          ${b.status !== 'cancelled' ? `<button class="action-btn action-btn--cancel" onclick="cancelBooking(${b.id})">Cancel</button>` : ''}
          <button class="action-btn action-btn--delete" onclick="deleteBooking(${b.id})">Del</button>
        </td>
      </tr>
    `;
  }).join('');
}

/* ─── RENDER ROOM TABLE ─────────────────── */
function renderRoomTable() {
  const tbody = $('#roomBody');
  if (!state.rooms.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-light)">No rooms available.</td></tr>`;
    return;
  }
  tbody.innerHTML = state.rooms.map(r => `
    <tr>
      <td><b>${r.name}</b></td>
      <td>${r.type}</td>
      <td>${r.capacity} guests</td>
      <td>${r.units}</td>
      <td><b>${fmtMoney(r.price)}</b></td>
      <td><span class="badge badge--${r.status}">${r.status}</span></td>
      <td class="ta-r">
        <button class="action-btn action-btn--edit" onclick="editRoom(${r.id})">Edit</button>
        <button class="action-btn action-btn--delete" onclick="deleteRoom(${r.id})">Del</button>
      </td>
    </tr>
  `).join('');
}

/* ─── BOOKING MODAL ─────────────────────── */
window.openBookingModal = async (roomId) => {
  const room = state.rooms.find(r => r.id === roomId);
  if (!room) return;
  state.currentRoom = room;
  $('#bkRoomId').value = room.id;
  $('#bkGuests').value = Math.min(2, room.capacity);
  $('#bkGuests').max = room.capacity;
  $('#bkName').value = '';
  $('#bkEmail').value = '';
  $('#bkPhone').value = '';
  $('#bkRequests').value = '';
  
  $('#bookingAside').innerHTML = `
    <img class="booking-aside__img" src="${room.image || ''}" alt="${room.name}" onerror="this.src='https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=800'" />
    <h4>${room.name}</h4>
    <p>${room.description || ''}</p>
    <div class="booking-aside__meta">
      <div><span>Category</span><b>${room.type}</b></div>
      <div><span>Capacity</span><b>${room.capacity} Guests</b></div>
      <div><span>Beds</span><b>${room.beds}</b></div>
      <div><span>Size</span><b>${room.size || '—'} m²</b></div>
      <div><span>Units Left</span><b>${room.units}</b></div>
    </div>
  `;
  
  updatePriceSummary();
  checkAvailability();
  openModal('bookingModal');
};

async function checkAvailability() {
  const roomId = $('#bkRoomId').value;
  const ci = $('#bkCheckIn').value;
  const co = $('#bkCheckOut').value;
  const box = $('#availBox');
  
  if (!roomId || !ci || !co || new Date(co) <= new Date(ci)) {
    box.className = 'avail';
    box.querySelector('.avail__text').textContent = 'Select valid dates to check availability';
    return;
  }

  try {
    const data = await api(`/check-availability/${roomId}?checkIn=${ci}&checkOut=${co}`);
    if (data.available) {
      box.className = 'avail is-available';
      box.querySelector('.avail__text').textContent = `✓ Available — ${data.unitsLeft} unit(s) left for these dates`;
    } else {
      box.className = 'avail is-unavailable';
      box.querySelector('.avail__text').textContent = `✕ Not available for the selected dates`;
    }
  } catch (e) {
    box.className = 'avail';
    box.querySelector('.avail__text').textContent = 'Could not check availability';
  }
}

function updatePriceSummary() {
  const room = state.currentRoom;
  if (!room) return;
  const nights = nightsBetween($('#bkCheckIn').value, $('#bkCheckOut').value);
  const rate = room.price;
  const subtotal = rate * nights;
  const tax = subtotal * 0.12;
  const total = subtotal + tax;
  
  $('#psRate').textContent = fmtMoney(rate);
  $('#psNights').textContent = nights;
  $('#psTax').textContent = fmtMoney(tax);
  $('#psTotal').textContent = fmtMoney(total);
}

/* ─── SUBMIT BOOKING ────────────────────── */
$('#bookingForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const room = state.currentRoom;
  if (!room) return;
  
  const nights = nightsBetween($('#bkCheckIn').value, $('#bkCheckOut').value);
  if (nights <= 0) return toast('Check-out must be after check-in', 'error');
  
  const guests = parseInt($('#bkGuests').value);
  if (guests > room.capacity) return toast(`Maximum ${room.capacity} guests allowed`, 'error');

  const subtotal = room.price * nights;
  const total_price = subtotal + (subtotal * 0.12);

  const payload = {
    room_id: room.id,
    guest_name: $('#bkName').value.trim(),
    email: $('#bkEmail').value.trim(),
    phone: $('#bkPhone').value.trim(),
    check_in: $('#bkCheckIn').value,
    check_out: $('#bkCheckOut').value,
    guests,
    total_price,
    requests: $('#bkRequests').value.trim()
  };

  const btn = $('#bkSubmit');
  btn.disabled = true;
  btn.textContent = 'Processing…';

  try {
    await api('/bookings', { method: 'POST', body: JSON.stringify(payload) });
    toast('Reservation confirmed! 🎉');
    closeModal('bookingModal');
    await loadAll();
  } catch (e) {
    toast(e.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Confirm Reservation';
  }
});

/* ─── ROOM MODAL ────────────────────────── */
window.editRoom = (id) => {
  const r = state.rooms.find(x => x.id === id);
  if (!r) return;
  state.editingRoom = r;
  $('#roomModalTitle').innerHTML = 'Edit <em>Room</em>';
  $('#rmId').value = r.id;
  $('#rmName').value = r.name;
  $('#rmType').value = r.type;
  $('#rmDescription').value = r.description || '';
  $('#rmPrice').value = r.price;
  $('#rmCapacity').value = r.capacity;
  $('#rmBeds').value = r.beds;
  $('#rmSize').value = r.size || 30;
  $('#rmUnits').value = r.units;
  $('#rmStatus').value = r.status;
  $('#rmImage').value = r.image || '';
  $('#rmAmenities').value = r.amenities || '';
  openModal('roomModal');
};

$('#roomForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = $('#rmId').value;
  const payload = {
    name: $('#rmName').value.trim(),
    type: $('#rmType').value.trim(),
    description: $('#rmDescription').value.trim(),
    price: parseFloat($('#rmPrice').value),
    capacity: parseInt($('#rmCapacity').value),
    beds: parseInt($('#rmBeds').value),
    size: parseInt($('#rmSize').value),
    units: parseInt($('#rmUnits').value),
    status: $('#rmStatus').value,
    image: $('#rmImage').value.trim(),
    amenities: $('#rmAmenities').value.trim()
  };

  const btn = $('#rmSubmit');
  btn.disabled = true;

  try {
    if (id) {
      await api(`/rooms/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      toast('Room updated');
    } else {
      await api('/rooms', { method: 'POST', body: JSON.stringify(payload) });
      toast('Room added');
    }
    closeModal('roomModal');
    await loadRooms();
  } catch (e) {
    toast(e.message, 'error');
  } finally {
    btn.disabled = false;
  }
});

window.deleteRoom = async (id) => {
  if (!confirm('Delete this room? All associated bookings will remain but become orphaned.')) return;
  try {
    await api(`/rooms/${id}`, { method: 'DELETE' });
    toast('Room deleted');
    await loadRooms();
  } catch (e) { toast(e.message, 'error'); }
};

/* ─── BOOKING ACTIONS ───────────────────── */
window.cancelBooking = async (id) => {
  if (!confirm('Cancel this reservation?')) return;
  try {
    await api(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'cancelled' }) });
    toast('Reservation cancelled');
    await loadAll();
  } catch (e) { toast(e.message, 'error'); }
};

window.deleteBooking = async (id) => {
  if (!confirm('Permanently delete this booking record?')) return;
  try {
    await api(`/bookings/${id}`, { method: 'DELETE' });
    toast('Booking deleted');
    await loadAll();
  } catch (e) { toast(e.message, 'error'); }
};

window.editBooking = (id) => {
  toast('Editing bookings is currently disabled in this demo', 'error');
};

/* ─── MODAL HELPERS ─────────────────────── */
function openModal(id) {
  const m = $('#' + id);
  m.classList.add('is-open');
  m.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const m = $('#' + id);
  m.classList.remove('is-open');
  m.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

/* ─── EVENT BINDINGS ────────────────────── */
function bindEvents() {
  // Nav scroll
  window.addEventListener('scroll', () => {
    $('#nav').classList.toggle('scrolled', window.scrollY > 50);
  });

  // Modals close
  $$('[data-close]').forEach(el => {
    el.addEventListener('click', (e) => {
      const m = e.target.closest('.modal');
      if (m) closeModal(m.id);
    });
  });

  // Book now nav
  $('#navBookBtn')?.addEventListener('click', () => {
    document.getElementById('rooms').scrollIntoView({ behavior: 'smooth' });
  });
  $('#heroBookBtn')?.addEventListener('click', () => {
    document.getElementById('rooms').scrollIntoView({ behavior: 'smooth' });
  });

  // Search form
  $('#searchForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const ci = $('#qCheckIn').value;
    const co = $('#qCheckOut').value;
    const g = $('#qGuests').value;
    state.filter.capacity = g;
    $('#fCapacity').value = g;
    state.filter.search = '';
    $('#fSearch').value = '';
    loadRooms();
    document.getElementById('rooms').scrollIntoView({ behavior: 'smooth' });
  });

  // Room filters
  $('#fSearch').addEventListener('input', debounce(() => { state.filter.search = $('#fSearch').value; loadRooms(); }, 300));
  $('#fType').addEventListener('change', () => { state.filter.type = $('#fType').value; loadRooms(); });
  $('#fCapacity').addEventListener('change', () => { state.filter.capacity = $('#fCapacity').value; loadRooms(); });
  $('#fSort').addEventListener('change', () => { state.filter.sort = $('#fSort').value; loadRooms(); });
  $('#fReset').addEventListener('click', () => {
    state.filter = { search: '', type: '', capacity: '', sort: '' };
    $('#fSearch').value = ''; $('#fType').value = ''; $('#fCapacity').value = ''; $('#fSort').value = '';
    loadRooms();
  });

  // Booking filters
  $('#bSearch').addEventListener('input', debounce(() => { state.bookingFilter.search = $('#bSearch').value; loadBookings(); }, 300));
  $('#bStatus').addEventListener('change', () => { state.bookingFilter.status = $('#bStatus').value; loadBookings(); });

  // New booking / room
  $('#newBookingBtn')?.addEventListener('click', () => {
    if (!state.rooms.length) return toast('No rooms available', 'error');
    openBookingModal(state.rooms[0].id);
  });
  $('#newRoomBtn')?.addEventListener('click', () => {
    state.editingRoom = null;
    $('#roomForm').reset();
    $('#rmId').value = '';
    $('#roomModalTitle').innerHTML = 'Add <em>Room</em>';
    openModal('roomModal');
  });

  // Tabs
  $$('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.tab').forEach(t => t.classList.remove('is-active'));
      $$('.panel').forEach(p => p.classList.remove('is-active'));
      tab.classList.add('is-active');
      $('#panel-' + tab.dataset.tab).classList.add('is-active');
    });
  });

  // Booking form date changes
  ['bkCheckIn', 'bkCheckOut'].forEach(id => {
    $('#' + id)?.addEventListener('change', () => {
      updatePriceSummary();
      checkAvailability();
    });
  });
  $('#bkGuests')?.addEventListener('input', updatePriceSummary);

  // Escape key to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      $$('.modal.is-open').forEach(m => closeModal(m.id));
    }
  });
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}