// src/pages/Tasks.jsx
import { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { mockTasks } from '../mocks/tasks';
import { mockProjects } from '../mocks/projects';

export default function Tasks() {
  const [tasks, setTasks] = useState(mockTasks);
  const [openDialog, setOpenDialog] = useState(false);

  // Campos do formulário da nova tarefa
  const [newTitle, setNewTitle] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');

  const getProjectName = (id) => {
    const proj = mockProjects.find((p) => p.id === id);
    return proj ? proj.name : 'Desconhecido';
  };

  // Abre e fecha o Dialog
  const handleOpen = () => setOpenDialog(true);
  const handleClose = () => setOpenDialog(false);

  const handleSave = () => {
    const newTask = {
      id: tasks.length + 1,
      title: newTitle,
      projectId: Number(newProjectId),
      status: newStatus,
      startDate: '2025-03-10',
      endDate: null,
      priority: newPriority
    };
    // Para protótipo: insere no array local
    setTasks([...tasks, newTask]);

    // Reseta campos e fecha o dialog
    setNewTitle('');
    setNewProjectId('');
    setNewStatus('');
    setNewPriority('');
    setOpenDialog(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Tarefas
      </Typography>

      {/* Botão para criar nova tarefa */}
      <Button variant="contained" onClick={handleOpen} sx={{ mb: 2 }}>
        Nova Tarefa
      </Button>

      <Grid container spacing={2}>
        {tasks.map((task) => (
          <Grid
            item
            key={task.id}
            xs={12}
            sm={12}
            md={6}
            lg={4}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {task.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Projeto: {getProjectName(task.projectId)}
                </Typography>

                <Box sx={{ my: 1 }}>
                  <Chip
                    label={task.status}
                    color={
                      task.status === 'Pendente' ? 'warning'
                        : task.status === 'Em Progresso' ? 'primary'
                          : task.status === 'Concluída' ? 'success'
                            : 'default'
                    }
                    variant="outlined"
                  />
                </Box>

                <Typography variant="body2">
                  Prioridade: {task.priority}
                </Typography>
                <Typography variant="body2">
                  Início: {task.startDate}
                </Typography>
                <Typography variant="body2">
                  Fim: {task.endDate || '-'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog para criação de nova tarefa */}
      <Dialog open={openDialog} onClose={handleClose}>
        <DialogTitle>Nova Tarefa</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Título"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <TextField
            label="ID do Projeto"
            value={newProjectId}
            onChange={(e) => setNewProjectId(e.target.value)}
          />
          <TextField
            label="Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
          />
          <TextField
            label="Prioridade"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
