// src/pages/ClientDetail.jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import { mockClients } from '../mocks/clients';
import { mockAccesses } from '../mocks/accesses';

export default function ClientDetail() {
    const { id } = useParams();
    const [client, setClient] = useState(null);
    const [accesses, setAccesses] = useState([]);

    // Estado para controlar modal de criar/editar
    const [openDialog, setOpenDialog] = useState(false);
    const [editingAccess, setEditingAccess] = useState(null);

    // Campos do formulário (IP, Acesso, Senha etc.)
    const [ip, setIp] = useState('');
    const [acesso, setAcesso] = useState('');
    const [senha, setSenha] = useState('');
    const [userAdm, setUserAdm] = useState('');
    const [descricao, setDescricao] = useState('');

    useEffect(() => {
        // Filtra o cliente
        const foundClient = mockClients.find((c) => c.id === Number(id));
        setClient(foundClient);

        // Filtra os acessos do cliente
        const clientAccesses = mockAccesses.filter((acc) => acc.clientId === Number(id));
        setAccesses(clientAccesses);
    }, [id]);

    if (!client) {
        return (
            <Box sx={{ p: 2 }}>
                <Typography variant="h5" color="error">
                    Cliente não encontrado
                </Typography>
            </Box>
        );
    }

    // Função para abrir modal "Novo Acesso"
    const handleOpenNew = () => {
        setEditingAccess(null);
        setIp('');
        setAcesso('');
        setSenha('');
        setUserAdm('');
        setDescricao('');
        setOpenDialog(true);
    };

    // Função para abrir modal "Editar Acesso"
    const handleEdit = (access) => {
        setEditingAccess(access);
        setIp(access.ip);
        setAcesso(access.acesso);
        setSenha(access.senha);
        setUserAdm(access.userAdm);
        setDescricao(access.descricao);
        setOpenDialog(true);
    };

    // Função para salvar novo ou editar
    const handleSave = () => {
        if (editingAccess) {
            // Editar
            const updated = {
                ...editingAccess,
                ip,
                acesso,
                senha,
                userAdm,
                descricao
            };
            setAccesses(accesses.map(a => a.id === editingAccess.id ? updated : a));
        } else {
            // Criar novo
            const newId = Math.max(0, ...accesses.map(a => a.id)) + 1;
            const newAccess = {
                id: newId,
                clientId: client.id,
                ip,
                acesso,
                senha,
                userAdm,
                descricao
            };
            setAccesses([...accesses, newAccess]);
        }
        setOpenDialog(false);
    };

    // Função para excluir
    const handleDelete = (accessId) => {
        setAccesses(accesses.filter(a => a.id !== accessId));
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>
                {client.name}
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
                E-mail: {client.contactEmail} | Telefone: {client.contactPhone}
            </Typography>

            {/* Botão de Novo Acesso */}
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenNew}
                sx={{ mb: 2 }}
            >
                Adicionar Acesso
            </Button>

            <Paper>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#1976d2' }}>
                            <TableCell sx={{ color: '#fff' }}>IP</TableCell>
                            <TableCell sx={{ color: '#fff' }}>Acesso</TableCell>
                            <TableCell sx={{ color: '#fff' }}>Senha</TableCell>
                            <TableCell sx={{ color: '#fff' }}>User Adm</TableCell>
                            <TableCell sx={{ color: '#fff' }}>Descrição</TableCell>
                            <TableCell sx={{ color: '#fff' }}>Ações</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {accesses.map((acc) => (
                            <TableRow key={acc.id}>
                                <TableCell>
                                    {acc.ip ? acc.ip : <Chip label="N/A" color="warning" />}
                                </TableCell>
                                <TableCell>{acc.acesso}</TableCell>
                                <TableCell>{acc.senha}</TableCell>
                                <TableCell>{acc.userAdm}</TableCell>
                                <TableCell>{acc.descricao}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(acc)} color="primary">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => handleDelete(acc.id)}
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {accesses.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    Nenhum acesso cadastrado
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>

            {/* Dialog de Criar/Editar Acesso */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>
                    {editingAccess ? 'Editar Acesso' : 'Novo Acesso'}
                </DialogTitle>
                <DialogContent
                    sx={{
                        // Se quiser manter coluna e espaçamento:
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                    }}
                >
                    <TextField
                        label="IP"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        value={ip}
                        onChange={(e) => setIp(e.target.value)}
                    />

                    <TextField
                        label="Acesso"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        value={acesso}
                        onChange={(e) => setAcesso(e.target.value)}
                    />

                    <TextField
                        label="Senha"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                    />

                    <TextField
                        label="User Adm"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        value={userAdm}
                        onChange={(e) => setUserAdm(e.target.value)}
                    />

                    <TextField
                        label="Descrição"
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSave}>
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
