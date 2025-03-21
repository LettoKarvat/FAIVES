import React, { useEffect, useState, useMemo } from 'react';
import moment from 'moment';
import {
  Calendar,
  momentLocalizer
} from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Card, CardContent, CardActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import api from '../services/api';

// Estilos do RBC e tema dark
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './CalendarDark.css';

// Configura localizador RBC com moment
const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

/**
 * Função para checar overlap (sobreposição).
 * @param {Array} appointments - todos os compromissos
 * @param {number} userId - ID do usuário
 * @param {Date} start - data/hora início (Date JS)
 * @param {Date} end - data/hora fim (Date JS)
 * @param {number} [ignoreId] - se estiver editando, ignorar ID do próprio compromisso
 * @returns {boolean} - true se houver sobreposição
 */
function checkOverlap(appointments, userId, start, end, ignoreId) {
  return appointments.some((ap) => {
    if (!ap.assigned_to || ap.assigned_to.id !== userId) return false;
    if (ignoreId && ap.id === ignoreId) return false;

    const apStart = new Date(ap.start);
    const apEnd = new Date(ap.end);
    // Overlap se apStart < end e apEnd > start
    return (apStart < end && apEnd > start);
  });
}

// Exemplo de mapeamento fixo de cores por usuário:
const userColorMap = {
  1: '#f44336', // userID 1 => vermelho
  2: '#2196f3', // userID 2 => azul
  3: '#ff9800', // ...
  4: '#9c27b0',
};

export default function CalendarWithDayView() {
  // =========================
  // ESTADOS GERAIS
  // =========================
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);

  // Filtro por usuário
  const [selectedUserFilter, setSelectedUserFilter] = useState('');

  // =========================
  // MODAL: CRIAR COMPROMISSO
  // =========================
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    local: '',
    date: '',
    startTime: '',
    endTime: '',
    userId: '',
    clientId: '',
    projectId: '',
  });

  // =========================
  // MODAL: VISUALIZAÇÃO DO DIA
  // =========================
  const [showDayModal, setShowDayModal] = useState(false);
  const [dayAppointments, setDayAppointments] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  // =========================
  // MODAL: EDITAR
  // =========================
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    title: '',
    description: '',
    local: '',
    date: '',
    startTime: '',
    endTime: '',
    userId: '',
    clientId: '',
    projectId: '',
  });

  useEffect(() => {
    loadAppointments();
    loadUsers();
    loadClients();
    loadProjects();
  }, []);

  async function loadAppointments() {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (err) {
      console.error('Erro ao buscar appointments:', err);
    }
  }
  async function loadUsers() {
    try {
      const res = await api.get('/auth/users/list');
      setUsers(res.data);
    } catch (err) {
      console.error('Erro ao buscar users:', err);
    }
  }
  async function loadClients() {
    try {
      const res = await api.get('/clients/list');
      setClients(res.data);
    } catch (err) {
      console.error('Erro ao buscar clients:', err);
    }
  }
  async function loadProjects() {
    try {
      const res = await api.get('/projects/list');
      setProjects(res.data);
    } catch (err) {
      console.error('Erro ao buscar projects:', err);
    }
  }

  // =========================
  // FILTRAR APPOINTMENTS
  // =========================
  const filteredAppointments = useMemo(() => {
    if (!selectedUserFilter) return appointments;
    return appointments.filter((ap) => {
      if (!ap.assigned_to) return false;
      return String(ap.assigned_to.id) === String(selectedUserFilter);
    });
  }, [appointments, selectedUserFilter]);

  // =========================
  // CRIAR COMPROMISSO
  // =========================
  function handleOpenModal() {
    setForm({
      title: '',
      description: '',
      local: '',
      date: '',
      startTime: '',
      endTime: '',
      userId: '',
      clientId: '',
      projectId: '',
    });
    setOpenModal(true);
  }
  function handleCloseModal() {
    setOpenModal(false);
  }
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCreateAppointment() {
    const {
      title, description, local, date, startTime, endTime, userId, clientId, projectId
    } = form;
    if (!title || !date || !startTime || !endTime) {
      alert('Título, Data, Horário Início e Fim são obrigatórios!');
      return;
    }

    const startStr = `${date} ${startTime}:00`;
    const endStr = `${date} ${endTime}:00`;
    const start = new Date(moment(startStr, 'YYYY-MM-DD HH:mm:ss').toISOString());
    const end = new Date(moment(endStr, 'YYYY-MM-DD HH:mm:ss').toISOString());

    if (end < start) {
      alert('Horário de término < horário de início!');
      return;
    }

    const numericUserId = userId ? parseInt(userId) : null;
    if (numericUserId) {
      // Valida Overlap
      if (checkOverlap(appointments, numericUserId, start, end, null)) {
        alert("O usuário já tem compromisso nesse horário!");
        return;
      }
    }

    const payload = {
      title,
      description,
      local,
      start: moment(start).format('YYYY-MM-DD HH:mm:ss'),
      end: moment(end).format('YYYY-MM-DD HH:mm:ss'),
      color: '#4caf50',
      assigned_to_user_id: numericUserId,
      client_id: clientId ? parseInt(clientId) : null,
      project_id: projectId ? parseInt(projectId) : null,
    };

    try {
      await api.post('/appointments', payload);
      alert('Compromisso criado com sucesso!');
      setOpenModal(false);
      loadAppointments();
    } catch (err) {
      console.error(err);
      alert('Erro ao criar compromisso');
    }
  }

  // =========================
  // MODAL DIA
  // =========================
  function handleSelectSlot(slotInfo) {
    const day = slotInfo.start;
    setSelectedDay(day);

    // Filtra a partir de "filteredAppointments" para respeitar o filtro
    const dayApts = filteredAppointments.filter((ap) => {
      const apDay = moment(ap.start).startOf('day');
      return apDay.isSame(moment(day).startOf('day'));
    });
    // Ordena do mais cedo para o mais tarde
    dayApts.sort((a, b) => new Date(a.start) - new Date(b.start));
    setDayAppointments(dayApts);
    setShowDayModal(true);
  }
  function handleSelectEvent(event) {
    const day = event.start;
    setSelectedDay(day);

    const dayApts = filteredAppointments.filter((ap) => {
      const apDay = moment(ap.start).startOf('day');
      return apDay.isSame(moment(day).startOf('day'));
    });
    dayApts.sort((a, b) => new Date(a.start) - new Date(b.start));
    setDayAppointments(dayApts);
    setShowDayModal(true);
  }
  function handleCloseDayModal() {
    setShowDayModal(false);
  }

  // =========================
  // EDITAR
  // =========================
  function handleOpenEdit(ap) {
    const st = moment(ap.start);
    const en = moment(ap.end);

    setEditForm({
      id: ap.id,
      title: ap.title,
      description: ap.description,
      local: ap.local || '',
      date: st.format('YYYY-MM-DD'),
      startTime: st.format('HH:mm'),
      endTime: en.format('HH:mm'),
      userId: ap.assigned_to ? String(ap.assigned_to.id) : '',
      clientId: ap.client ? String(ap.client.id) : '',
      projectId: ap.project ? String(ap.project.id) : '',
    });
    setOpenEditModal(true);
  }
  function handleCloseEditModal() {
    setOpenEditModal(false);
  }
  function handleEditChange(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  async function handleUpdateAppointment() {
    const { id, title, description, local, date, startTime, endTime, userId } = editForm;
    if (!title || !date || !startTime || !endTime) {
      alert('Campos obrigatórios faltando!');
      return;
    }

    const startStr = `${date} ${startTime}:00`;
    const endStr = `${date} ${endTime}:00`;
    const start = new Date(moment(startStr, 'YYYY-MM-DD HH:mm:ss').toISOString());
    const end = new Date(moment(endStr, 'YYYY-MM-DD HH:mm:ss').toISOString());

    if (end < start) {
      alert('Horário fim < início!');
      return;
    }

    const numericUserId = userId ? parseInt(userId) : null;
    if (numericUserId) {
      if (checkOverlap(appointments, numericUserId, start, end, id)) {
        alert("O usuário já tem compromisso nesse horário!");
        return;
      }
    }

    const payload = {
      title,
      description,
      local,
      start: moment(start).format('YYYY-MM-DD HH:mm:ss'),
      end: moment(end).format('YYYY-MM-DD HH:mm:ss'),
      assigned_to_user_id: numericUserId,
      client_id: editForm.clientId ? parseInt(editForm.clientId) : null,
      project_id: editForm.projectId ? parseInt(editForm.projectId) : null,
    };

    try {
      await api.patch(`/appointments/${id}`, payload);
      alert('Compromisso atualizado!');
      setOpenEditModal(false);
      setShowDayModal(false);
      loadAppointments();
    } catch (err) {
      console.error(err);
      alert('Erro ao editar');
    }
  }

  // =========================
  // EXCLUIR
  // =========================
  async function handleDeleteAppointment(aptId) {
    if (!window.confirm('Deseja excluir este compromisso?')) return;
    try {
      await api.delete(`/appointments/${aptId}`);
      alert('Excluído!');
      setShowDayModal(false);
      loadAppointments();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir');
    }
  }

  // =========================
  // DRAG & DROP RBC
  // =========================
  async function handleEventDrop({ event, start, end }) {
    // event.resource.assigned_to => user
    const userId = event.resource.assigned_to ? event.resource.assigned_to.id : null;
    if (userId) {
      if (checkOverlap(appointments, userId, start, end, event.id)) {
        alert("Sobreposição! Operação cancelada.");
        // Recarrega para reverter posição
        loadAppointments();
        return;
      }
    }
    // Se passou, faz patch
    doPatchDrag(event.id, start, end);
  }

  async function handleEventResize({ event, start, end }) {
    const userId = event.resource.assigned_to ? event.resource.assigned_to.id : null;
    if (userId) {
      if (checkOverlap(appointments, userId, start, end, event.id)) {
        alert("Sobreposição no resize! Cancelado.");
        loadAppointments();
        return;
      }
    }
    doPatchDrag(event.id, start, end);
  }

  async function doPatchDrag(aptId, startJs, endJs) {
    const startStr = moment(startJs).format('YYYY-MM-DD HH:mm:ss');
    const endStr = moment(endJs).format('YYYY-MM-DD HH:mm:ss');
    try {
      await api.patch(`/appointments/${aptId}`, { start: startStr, end: endStr });
      alert('Data atualizada!');
      loadAppointments();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar drag/resize');
    }
  }

  // Monta array RBC a partir do filtered
  const events = filteredAppointments.map((ap) => ({
    id: ap.id,
    title: ap.title,
    start: new Date(ap.start),
    end: new Date(ap.end),
    resource: ap,
  }));

  // Cores diferenciadas
  function eventStyleGetter(event) {
    const userId = event.resource.assigned_to ? event.resource.assigned_to.id : null;
    let bg = '#3174ad';
    if (userId && userColorMap[userId]) {
      bg = userColorMap[userId];
    }
    return {
      style: {
        backgroundColor: bg,
        color: '#fff',
        borderRadius: '4px',
        border: '1px solid #fff',
        opacity: 0.9,
      },
    };
  }

  return (
    <div style={{ padding: 16 }}>
      {/* TOPO: Filtro por usuário + novo compromisso */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, alignItems: 'center' }}>
        <FormControl style={{ minWidth: 200 }}>
          <InputLabel>Filtrar por Usuário</InputLabel>
          <Select
            label="Filtrar por Usuário"
            value={selectedUserFilter}
            onChange={(e) => setSelectedUserFilter(e.target.value)}
          >
            <MenuItem value="">(Todos)</MenuItem>
            {users.map((u) => (
              <MenuItem key={u.id} value={String(u.id)}>
                {u.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenModal}
        >
          Novo Compromisso
        </Button>
      </div>

      {/* CALENDÁRIO COM DRAG & DROP */}
      <div style={{ height: '75vh', maxWidth: 1200, margin: '0 auto' }}>
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventStyleGetter}
          defaultView="month"
          views={['month', 'week', 'day', 'agenda']}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          // Drag & Drop
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          resizable
          draggableAccessor={() => true}
          style={{ backgroundColor: '#2a2a2a' }}
        />
      </div>

      {/* MODAL: Criar */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>Criar Compromisso</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Título"
            name="title"
            value={form.title}
            onChange={handleChange}
          />
          <TextField
            label="Descrição"
            name="description"
            value={form.description}
            onChange={handleChange}
            multiline
            rows={3}
          />
          <TextField
            label="Local"
            name="local"
            value={form.local}
            onChange={handleChange}
          />
          <TextField
            label="Data do compromisso"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Hora Início"
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Hora Fim"
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth>
            <InputLabel>Usuário</InputLabel>
            <Select
              label="Usuário"
              name="userId"
              value={form.userId}
              onChange={handleChange}
            >
              <MenuItem value="">Nenhum</MenuItem>
              {users.map((u) => (
                <MenuItem key={u.id} value={String(u.id)}>
                  {u.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Cliente</InputLabel>
            <Select
              label="Cliente"
              name="clientId"
              value={form.clientId}
              onChange={handleChange}
            >
              <MenuItem value="">Nenhum</MenuItem>
              {clients.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Projeto</InputLabel>
            <Select
              label="Projeto"
              name="projectId"
              value={form.projectId}
              onChange={handleChange}
            >
              <MenuItem value="">Nenhum</MenuItem>
              {projects.map((p) => (
                <MenuItem key={p.id} value={String(p.id)}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', mx: 3, my: 2 }}>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateAppointment}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: Dia */}
      <Dialog open={showDayModal} onClose={handleCloseDayModal} fullWidth maxWidth="sm">
        <DialogTitle>
          Compromissos em {selectedDay ? moment(selectedDay).format('DD/MM/YYYY') : ''}
        </DialogTitle>
        <DialogContent>
          {dayAppointments.length === 0 ? (
            <p>Nenhum compromisso para esse dia.</p>
          ) : (
            dayAppointments.map((ap) => (
              <Card
                key={ap.id}
                sx={{ mb: 2, backgroundColor: '#424242', color: '#fff' }}
              >
                <CardContent>
                  <h3>{ap.title}</h3>
                  <p>Início: {moment(ap.start).format('HH:mm')} | Fim: {moment(ap.end).format('HH:mm')}</p>
                  <p>{ap.description}</p>
                  {ap.local && <p>Local: {ap.local}</p>}
                  {ap.assigned_to && <p>Usuário: {ap.assigned_to.name}</p>}
                  {ap.client && <p>Cliente: {ap.client.name}</p>}
                  {ap.project && <p>Projeto: {ap.project.name}</p>}
                </CardContent>
                <CardActions>
                  <Button variant="outlined" onClick={() => handleOpenEdit(ap)}>Editar</Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteAppointment(ap.id)}
                  >
                    Excluir
                  </Button>
                </CardActions>
              </Card>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDayModal}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* MODAL: Editar */}
      <Dialog open={openEditModal} onClose={handleCloseEditModal} fullWidth maxWidth="sm">
        <DialogTitle>Editar Compromisso</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Título"
            name="title"
            value={editForm.title}
            onChange={handleEditChange}
          />
          <TextField
            label="Descrição"
            name="description"
            value={editForm.description}
            onChange={handleEditChange}
            multiline
            rows={3}
          />
          <TextField
            label="Local"
            name="local"
            value={editForm.local}
            onChange={handleEditChange}
          />
          <TextField
            label="Data"
            type="date"
            name="date"
            value={editForm.date}
            onChange={handleEditChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Hora Início"
            type="time"
            name="startTime"
            value={editForm.startTime}
            onChange={handleEditChange}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Hora Fim"
            type="time"
            name="endTime"
            value={editForm.endTime}
            onChange={handleEditChange}
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth>
            <InputLabel>Usuário</InputLabel>
            <Select
              label="Usuário"
              name="userId"
              value={editForm.userId}
              onChange={handleEditChange}
            >
              <MenuItem value="">Nenhum</MenuItem>
              {users.map((u) => (
                <MenuItem key={u.id} value={String(u.id)}>
                  {u.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Cliente</InputLabel>
            <Select
              label="Cliente"
              name="clientId"
              value={editForm.clientId}
              onChange={handleEditChange}
            >
              <MenuItem value="">Nenhum</MenuItem>
              {clients.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Projeto</InputLabel>
            <Select
              label="Projeto"
              name="projectId"
              value={editForm.projectId}
              onChange={handleEditChange}
            >
              <MenuItem value="">Nenhum</MenuItem>
              {projects.map((p) => (
                <MenuItem key={p.id} value={String(p.id)}>
                  {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', mx: 3, my: 2 }}>
          <Button onClick={handleCloseEditModal}>Cancelar</Button>
          <Button variant="contained" onClick={handleUpdateAppointment}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
