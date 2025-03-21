import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [errorProjects, setErrorProjects] = useState('');

  // Modal de criação
  const [openModal, setOpenModal] = useState(false);
  const [projectForm, setProjectForm] = useState({
    name: '',
    client_id: '',
    responsible_user_id: '',
    associated_user_ids: [],
    status: '',
    deadline: '',
    description: '',
    // Removendo o campo de progresso do formulário e definindo diretamente 0 no create
  });
  const [modalError, setModalError] = useState('');

  // Diálogo para adicionar usuários extras
  const [openAssociateDialog, setOpenAssociateDialog] = useState(false);
  const [selectedAssociateUser, setSelectedAssociateUser] = useState('');

  // Hook de navegação do react-router-dom
  const navigate = useNavigate();

  // Buscar projetos do backend
  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/projects/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Ajuste para verificar se o prazo passou da data atual
      const fetchedProjects = response.data;
      const updatedProjects = fetchedProjects.map((proj) => {
        if (
          proj.deadline &&
          dayjs(proj.deadline).isBefore(dayjs()) &&
          proj.status !== 'Concluído'
        ) {
          return { ...proj, status: 'Em Atraso' };
        }
        return proj;
      });

      setProjects(updatedProjects);
    } catch (error) {
      console.error('Erro ao buscar projetos:', error);
      setErrorProjects('Não foi possível carregar os projetos.');
    } finally {
      setLoadingProjects(false);
    }
  };

  // Buscar clientes
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/clients/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setClients(response.data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  // Buscar usuários
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('auth/users/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchClients();
    fetchUsers();
  }, []);

  const handleOpenModal = () => {
    setProjectForm({
      name: '',
      client_id: '',
      responsible_user_id: '',
      associated_user_ids: [],
      status: '',
      deadline: '',
      description: '',
    });
    setModalError('');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProjectForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // DatePicker
  const handleDeadlineChange = (newDate) => {
    if (!newDate) {
      setProjectForm((prev) => ({ ...prev, deadline: '' }));
    } else {
      const formatted = dayjs(newDate).format('YYYY-MM-DD');
      setProjectForm((prev) => ({ ...prev, deadline: formatted }));
    }
  };

  const handleCreateProject = async () => {
    if (!projectForm.name || !projectForm.responsible_user_id) {
      setModalError('Os campos "Nome" e "Responsável" são obrigatórios.');
      return;
    }
    try {
      const token = localStorage.getItem('token');

      // Forçando o progresso a sempre ser 0 no momento da criação
      const payload = {
        ...projectForm,
        progress: 0,
      };

      await api.post('/projects/create', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await fetchProjects();
      setOpenModal(false);
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      setModalError('Erro ao criar projeto. Verifique os dados e tente novamente.');
    }
  };

  // Adicionar usuário extra
  const handleOpenAssociateDialog = () => {
    setSelectedAssociateUser('');
    setOpenAssociateDialog(true);
  };

  const handleCloseAssociateDialog = () => {
    setOpenAssociateDialog(false);
  };

  const handleAddAssociateUser = () => {
    if (!selectedAssociateUser) return;
    if (projectForm.associated_user_ids.includes(selectedAssociateUser)) {
      return;
    }
    setProjectForm((prev) => ({
      ...prev,
      associated_user_ids: [...prev.associated_user_ids, selectedAssociateUser],
    }));
    setOpenAssociateDialog(false);
  };

  const handleRemoveAssociateUser = (userId) => {
    setProjectForm((prev) => ({
      ...prev,
      associated_user_ids: prev.associated_user_ids.filter((id) => id !== userId),
    }));
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" gutterBottom>
          Projetos
        </Typography>
        <Button variant="contained" onClick={handleOpenModal}>
          Novo Projeto
        </Button>
      </Box>

      {loadingProjects ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : errorProjects ? (
        <Alert severity="error">{errorProjects}</Alert>
      ) : (
        <Grid container spacing={2}>
          {projects.map((project) => {
            // Juntar "responsible" + "associated_users" para exibir como "Responsáveis"
            const allResponsibles = [];
            if (project.responsible) {
              allResponsibles.push(project.responsible);
            }
            if (project.associated_users && project.associated_users.length > 0) {
              allResponsibles.push(...project.associated_users);
            }

            return (
              <Grid item key={project.id} xs={12} sm={12} md={6} lg={4}>
                <Card
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {project.name}
                    </Typography>

                    <Typography variant="body2" color="textSecondary">
                      Cliente: {project.client ? project.client.name : 'Não atribuído'}
                    </Typography>

                    <Chip
                      label={project.status}
                      color={
                        project.status === 'Em Atraso'
                          ? 'error'
                          : project.status === 'Em Andamento'
                            ? 'primary'
                            : project.status === 'Pendente'
                              ? 'warning'
                              : project.status === 'Concluído'
                                ? 'success'
                                : 'default'
                      }
                      variant="outlined"
                      sx={{ my: 1 }}
                    />

                    <Typography variant="body2">
                      Prazo: {project.deadline || 'N/A'}
                    </Typography>

                    {/* Se seu back-end não removeu o progress, deixamos a barra abaixo */}
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Progresso:
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={project.progress}
                      sx={{ height: 8, borderRadius: 2, mt: 0.5 }}
                    />
                    <Typography variant="caption">
                      {project.progress}%
                    </Typography>

                    {allResponsibles.length > 0 && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Responsáveis: {allResponsibles.map((u) => u.name).join(', ')}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Dialog de criar projeto */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>Novo Projeto</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {modalError && <Alert severity="error">{modalError}</Alert>}

          <TextField
            label="Nome"
            name="name"
            fullWidth
            variant="outlined"
            value={projectForm.name}
            onChange={handleFormChange}
            required
          />

          <TextField
            select
            label="Cliente"
            name="client_id"
            fullWidth
            variant="outlined"
            value={projectForm.client_id}
            onChange={handleFormChange}
          >
            <MenuItem value="">
              <em>Nenhum</em>
            </MenuItem>
            {clients.map((client) => (
              <MenuItem key={client.id} value={client.id}>
                {client.name}
              </MenuItem>
            ))}
          </TextField>

          <Box display="flex" gap={1} alignItems="center">
            <TextField
              select
              label="Responsável (principal)"
              name="responsible_user_id"
              fullWidth
              variant="outlined"
              value={projectForm.responsible_user_id}
              onChange={handleFormChange}
              required
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </TextField>

            <IconButton
              color="primary"
              onClick={handleOpenAssociateDialog}
              title="Adicionar outro responsável"
            >
              <AddIcon />
            </IconButton>
          </Box>

          {/* Chips para remover responsáveis extras */}
          {projectForm.associated_user_ids.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              {projectForm.associated_user_ids.map((userId) => {
                const userInfo = users.find((u) => u.id === userId);
                return (
                  <Chip
                    key={userId}
                    label={userInfo ? userInfo.name : `ID ${userId}`}
                    onDelete={() => handleRemoveAssociateUser(userId)}
                  />
                );
              })}
            </Box>
          )}

          {/* Transformando em select para Pendente / Em Andamento / Concluído */}
          <TextField
            select
            label="Status"
            name="status"
            fullWidth
            variant="outlined"
            value={projectForm.status}
            onChange={handleFormChange}
          >
            <MenuItem value="">
              <em>Selecione</em>
            </MenuItem>
            <MenuItem value="Pendente">Pendente</MenuItem>
            <MenuItem value="Em Andamento">Em Andamento</MenuItem>
            <MenuItem value="Concluído">Concluído</MenuItem>
          </TextField>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Prazo"
              format="DD/MM/YYYY"
              value={projectForm.deadline ? dayjs(projectForm.deadline) : null}
              onChange={handleDeadlineChange}
              slotProps={{ textField: { fullWidth: true, variant: 'outlined' } }}
            />
          </LocalizationProvider>

          <TextField
            label="Descrição"
            name="description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={projectForm.description}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Cancelar</Button>
          <Button variant="contained" onClick={handleCreateProject}>
            Criar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para adicionar outro responsável (associado) */}
      <Dialog open={openAssociateDialog} onClose={handleCloseAssociateDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Adicionar Outro Responsável</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            select
            label="Usuário"
            value={selectedAssociateUser}
            onChange={(e) => setSelectedAssociateUser(e.target.value)}
            fullWidth
            variant="outlined"
          >
            <MenuItem value="">
              <em>Selecione</em>
            </MenuItem>
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssociateDialog}>Cancelar</Button>
          <Button variant="contained" onClick={handleAddAssociateUser}>
            Adicionar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
