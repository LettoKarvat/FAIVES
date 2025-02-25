// src/pages/Colaboradores.jsx
import { useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    Divider,
} from '@mui/material';

// Mock de usuários (colaboradores), tarefas e compromissos
import { mockUsers } from '../mocks/users';
import { mockTasks } from '../mocks/tasks';
import { mockAppointments } from '../mocks/appointments';

export default function Colaboradores() {
    // Estado para usuários (colaboradores)
    const [users, setUsers] = useState(mockUsers);

    // Estado do Dialog de criação
    const [open, setOpen] = useState(false);

    // Campos para novo colaborador
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('');
    const [newName, setNewName] = useState('');

    // Funções de abrir/fechar dialog
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    // Salvar novo colaborador (mock)
    const handleSave = () => {
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;

        const newUser = {
            id: newId,
            username: newUsername,
            password: newPassword,
            role: newRole,
            name: newName
        };

        setUsers([...users, newUser]);

        // limpa campos e fecha
        setNewUsername('');
        setNewPassword('');
        setNewRole('');
        setNewName('');
        handleClose();
    };

    // Para cada colaborador, pegamos as tarefas e compromissos associados
    const getTasksForUser = (userId) =>
        mockTasks.filter((t) => t.assignedToUserId === userId);

    const getAppointmentsForUser = (userId) =>
        mockAppointments.filter((a) => a.createdByUserId === userId);

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Colaboradores
            </Typography>

            {/* Botão para adicionar novo colaborador */}
            <Button variant="contained" sx={{ mb: 2 }} onClick={handleOpen}>
                Novo Colaborador
            </Button>

            <Grid container spacing={2}>
                {users.map((user) => {
                    const userTasks = getTasksForUser(user.id);
                    const userAppointments = getAppointmentsForUser(user.id);

                    return (
                        <Grid
                            item
                            key={user.id}
                            xs={12}
                            sm={12}
                            md={6}
                            lg={4}
                        >
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">
                                        {user.name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Usuário: {user.username}
                                    </Typography>
                                    <Chip
                                        label={user.role}
                                        variant="outlined"
                                        color={
                                            user.role === 'admin' ? 'error' : 'primary'
                                        }
                                        sx={{ mt: 1 }}
                                    />

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="subtitle1">Tarefas Associadas:</Typography>
                                    {userTasks.length === 0 ? (
                                        <Typography variant="body2" color="textSecondary">
                                            Nenhuma tarefa
                                        </Typography>
                                    ) : (
                                        userTasks.map((task) => (
                                            <Typography variant="body2" key={task.id}>
                                                • {task.title} ({task.status})
                                            </Typography>
                                        ))
                                    )}

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="subtitle1">Compromissos Associados:</Typography>
                                    {userAppointments.length === 0 ? (
                                        <Typography variant="body2" color="textSecondary">
                                            Nenhum compromisso
                                        </Typography>
                                    ) : (
                                        userAppointments.map((app) => (
                                            <Typography variant="body2" key={app.id}>
                                                • {app.description} ({new Date(app.dateTime).toLocaleString()})
                                            </Typography>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>

            {/* Dialog: Criar Novo Colaborador */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Novo Colaborador</DialogTitle>
                <DialogContent
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                        mt: 1,
                        width: { xs: '250px', sm: '350px' }
                    }}
                >
                    <TextField
                        label="Nome Completo"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                    />
                    <TextField
                        label="Usuário"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                    />
                    <TextField
                        label="Senha"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <TextField
                        label="Papel (role)"
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value)}
                        helperText="Ex: admin, func, etc."
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
