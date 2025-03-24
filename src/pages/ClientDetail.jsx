import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Table,
    TableBody,
    TableRow,
    TableCell,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';

/** Agrupa os registros por card_name. */
function groupByCardName(accessList) {
    const map = {};
    accessList.forEach((acc) => {
        const group = acc.card_name || 'Sem Título';
        if (!map[group]) {
            map[group] = [];
        }
        map[group].push(acc);
    });
    return map;
}

export default function ClientDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Dados do cliente
    const [client, setClient] = useState(null);
    const [loadingClient, setLoadingClient] = useState(true);
    const [errorClient, setErrorClient] = useState('');

    // Acessos
    const [accesses, setAccesses] = useState([]);
    const [loadingAccesses, setLoadingAccesses] = useState(true);
    const [errorAccesses, setErrorAccesses] = useState('');

    // -------------- Modal: Novo Card --------------
    const [openNewCardModal, setOpenNewCardModal] = useState(false);
    const [newCardName, setNewCardName] = useState('');
    const [newFieldName, setNewFieldName] = useState('');
    const [newFieldValue, setNewFieldValue] = useState('');

    // -------------- Modal: Novo/Editar Campo --------------
    const [openFieldModal, setOpenFieldModal] = useState(false);
    const [editingAccess, setEditingAccess] = useState(null); // se for null => criando
    const [cardNameForField, setCardNameForField] = useState(''); // card a que esse campo pertence
    const [fieldName, setFieldName] = useState('');
    const [fieldValue, setFieldValue] = useState('');

    // -------------- Modal: Renomear Card --------------
    const [openRenameModal, setOpenRenameModal] = useState(false);
    const [oldCardName, setOldCardName] = useState('');
    const [newCardNameForRename, setNewCardNameForRename] = useState('');

    // -------------- Modal: Editar Cliente --------------
    const [openEditClientModal, setOpenEditClientModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [editCnpj, setEditCnpj] = useState('');
    const [editSegment, setEditSegment] = useState('');
    const [editContactEmail, setEditContactEmail] = useState('');
    const [editContactPhone, setEditContactPhone] = useState('');
    const [editOwnerName, setEditOwnerName] = useState('');

    // ========================================================
    // useEffect - carrega cliente e acessos
    useEffect(() => {
        fetchClient();
        fetchAccesses();
    }, [id]);

    const fetchClient = async () => {
        try {
            setLoadingClient(true);
            const token = localStorage.getItem('token');
            const resp = await api.get(`/clients/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClient(resp.data);
        } catch (err) {
            console.error(err);
            setErrorClient('Não foi possível carregar o cliente.');
        } finally {
            setLoadingClient(false);
        }
    };

    const fetchAccesses = async () => {
        try {
            setLoadingAccesses(true);
            const token = localStorage.getItem('token');
            const resp = await api.get(`/clients/${id}/accesses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAccesses(resp.data);
        } catch (err) {
            console.error(err);
            setErrorAccesses('Não foi possível carregar os acessos.');
        } finally {
            setLoadingAccesses(false);
        }
    };

    // ========================================================
    // 1) Novo Card (cria 1 card + 1º campo)
    const handleOpenNewCardModal = () => {
        setNewCardName('');
        setNewFieldName('');
        setNewFieldValue('');
        setOpenNewCardModal(true);
    };
    const handleCloseNewCardModal = () => setOpenNewCardModal(false);

    const handleCreateNewCard = async () => {
        if (!newCardName || !newFieldName) {
            alert('Nome do card e nome do primeiro campo são obrigatórios.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await api.post(
                `/clients/${id}/accesses`,
                {
                    card_name: newCardName,
                    field_name: newFieldName,
                    field_value: newFieldValue
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOpenNewCardModal(false);
            fetchAccesses();
        } catch (err) {
            console.error(err);
            alert('Erro ao criar novo Card.');
        }
    };

    // ========================================================
    // 2) Adicionar Campo (ou Editar Campo) no Card
    //    - se "editingAccess" != null => PATCH, senão => POST
    const handleOpenFieldModal = (card, access = null) => {
        if (access) {
            // Editando
            setEditingAccess(access);
            setCardNameForField(access.card_name || '');
            setFieldName(access.field_name || '');
            setFieldValue(access.field_value || '');
        } else {
            // Criando
            setEditingAccess(null);
            setCardNameForField(card); // se for "adicionar" a card existente
            setFieldName('');
            setFieldValue('');
        }
        setOpenFieldModal(true);
    };

    const handleCloseFieldModal = () => setOpenFieldModal(false);

    const handleSaveField = async () => {
        if (!cardNameForField || !fieldName) {
            alert('Card e Nome do Campo são obrigatórios.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            if (editingAccess) {
                // PATCH
                await api.patch(
                    `/clients/${id}/accesses/${editingAccess.id}`,
                    {
                        card_name: cardNameForField,
                        field_name: fieldName,
                        field_value: fieldValue
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            } else {
                // POST
                await api.post(
                    `/clients/${id}/accesses`,
                    {
                        card_name: cardNameForField,
                        field_name: fieldName,
                        field_value: fieldValue
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
            setOpenFieldModal(false);
            fetchAccesses();
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar campo.');
        }
    };

    // ========================================================
    // 3) Renomear Card
    const handleOpenRenameModal = (oldName) => {
        setOldCardName(oldName);
        setNewCardNameForRename('');
        setOpenRenameModal(true);
    };
    const handleCloseRenameModal = () => setOpenRenameModal(false);

    const handleRenameCard = async () => {
        if (!oldCardName || !newCardNameForRename) {
            alert('Novo nome não pode estar vazio.');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await api.patch(
                `/clients/${id}/cards/rename`,
                {
                    old_card_name: oldCardName,
                    new_card_name: newCardNameForRename
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setOpenRenameModal(false);
            fetchAccesses();
        } catch (err) {
            console.error(err);
            alert('Não foi possível renomear o card.');
        }
    };

    // ========================================================
    // 4) Excluir Card (DELETE /cards/delete)
    const handleDeleteCard = async (cardName) => {
        if (!window.confirm(`Deseja excluir o card '${cardName}' e todos os campos?`)) return;
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/clients/${id}/cards/delete`, {
                headers: { Authorization: `Bearer ${token}` },
                data: { card_name: cardName }
            });
            fetchAccesses();
        } catch (err) {
            console.error(err);
            alert('Não foi possível excluir o card.');
        }
    };

    // ========================================================
    // 5) Excluir Campo individual
    const handleDeleteField = async (accessId) => {
        if (!window.confirm('Deseja excluir este campo?')) return;
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/clients/${id}/accesses/${accessId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAccesses();
        } catch (err) {
            console.error(err);
            alert('Não foi possível excluir o campo.');
        }
    };

    // ========================================================
    // 6) Editar Cliente
    const handleOpenEditClientModal = () => {
        // Preenche os campos com os dados atuais do cliente
        setEditName(client.name);
        setEditCnpj(client.cnpj || '');
        setEditSegment(client.segment || '');
        setEditContactEmail(client.contactEmail || '');
        setEditContactPhone(client.contactPhone || '');
        setEditOwnerName(client.ownerName || '');
        setOpenEditClientModal(true);
    };

    const handleCloseEditClientModal = () => setOpenEditClientModal(false);

    const handleSaveClientEdit = async () => {
        const token = localStorage.getItem('token');
        try {
            await api.patch(
                `/clients/${id}`,
                {
                    name: editName,
                    cnpj: editCnpj,
                    segment: editSegment,
                    contactEmail: editContactEmail,
                    contactPhone: editContactPhone,
                    owner_name: editOwnerName
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Cliente atualizado com sucesso!');
            setOpenEditClientModal(false);
            fetchClient();
        } catch (err) {
            console.error(err);
            alert('Erro ao atualizar cliente.');
        }
    };

    // ========================================================
    // 7) Excluir Cliente
    const handleDeleteClient = async () => {
        if (!window.confirm('Deseja excluir este cliente?')) return;
        try {
            const token = localStorage.getItem('token');
            await api.delete(`/clients/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Cliente excluído com sucesso.');
            navigate('/clients'); // Redireciona para a lista de clientes
        } catch (err) {
            console.error(err);
            alert('Erro ao excluir cliente.');
        }
    };

    // ========================================================
    // RENDER
    if (loadingClient) {
        return (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }
    if (!client) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error">{errorClient || 'Cliente não encontrado'}</Alert>
            </Box>
        );
    }

    const grouped = groupByCardName(accesses);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h4" gutterBottom>
                {client.name}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
                Segmento: {client.segment} | Responsável: {client.ownerName}
            </Typography>
            {client.ownerName && (
                <Typography variant="body1" sx={{ mb: 2 }}>
                    E-mail: {client.contactEmail} | Telefone: {client.contactPhone}
                </Typography>
            )}
            <Typography variant="body1" sx={{ mb: 2 }}>
                CNPJ: {client.cnpj}
            </Typography>

            {/* Botões para editar e excluir o cliente */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button variant="outlined" onClick={handleOpenEditClientModal}>
                    Editar Cliente
                </Button>
                <Button variant="outlined" color="error" onClick={handleDeleteClient}>
                    Excluir Cliente
                </Button>
            </Box>

            {/* Botão: Novo Card */}
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenNewCardModal}
                sx={{ mb: 3 }}
            >
                Novo Card
            </Button>

            {loadingAccesses ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : errorAccesses ? (
                <Alert severity="error">{errorAccesses}</Alert>
            ) : (
                Object.keys(grouped).map((cardName) => {
                    const items = grouped[cardName];
                    return (
                        <Card
                            sx={{
                                mb: 2,
                                p: 1,
                                backgroundColor: '#232323'
                            }}
                            key={cardName}
                        >
                            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: { xs: 'flex-start', sm: 'center' },
                                        justifyContent: 'space-between',
                                        mb: 2,
                                        gap: 1
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: '#64b5f6',
                                            fontWeight: 'bold',
                                            mb: { xs: 1, sm: 0 }
                                        }}
                                    >
                                        {cardName}
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            gap: 1
                                        }}
                                    >
                                        <Button
                                            variant="outlined"
                                            onClick={() => handleOpenRenameModal(cardName)}
                                            sx={{ color: '#64b5f6', borderColor: '#64b5f6' }}
                                        >
                                            Renomear Card
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            onClick={() => handleDeleteCard(cardName)}
                                        >
                                            Excluir Card
                                        </Button>
                                    </Box>
                                </Box>
                                <Table size="small">
                                    <TableBody>
                                        {items.map((acc) => (
                                            <TableRow key={acc.id}>
                                                <TableCell
                                                    sx={{
                                                        width: '30%',
                                                        color: 'white',
                                                        borderColor: '#444'
                                                    }}
                                                >
                                                    {acc.field_name}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        width: '50%',
                                                        color: 'white',
                                                        borderColor: '#444'
                                                    }}
                                                >
                                                    {acc.field_value}
                                                </TableCell>
                                                <TableCell
                                                    sx={{
                                                        width: '20%',
                                                        color: 'white',
                                                        borderColor: '#444'
                                                    }}
                                                >
                                                    <IconButton
                                                        color="primary"
                                                        onClick={() => handleOpenFieldModal(acc.card_name, acc)}
                                                        sx={{ mr: 1 }}
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        color="error"
                                                        onClick={() => handleDeleteField(acc.id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow>
                                            <TableCell colSpan={3} align="right" sx={{ borderColor: '#444' }}>
                                                <Button
                                                    variant="outlined"
                                                    startIcon={<AddIcon />}
                                                    onClick={() => handleOpenFieldModal(cardName)}
                                                    sx={{ color: '#64b5f6', borderColor: '#64b5f6' }}
                                                >
                                                    Adicionar Campo
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    );
                })
            )}

            {/* MODAL: Novo Card */}
            <Dialog
                open={openNewCardModal}
                onClose={handleCloseNewCardModal}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Criar Novo Card</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Nome do Card"
                        variant="outlined"
                        fullWidth
                        value={newCardName}
                        onChange={(e) => setNewCardName(e.target.value)}
                    />
                    <TextField
                        label="Nome do Primeiro Campo"
                        variant="outlined"
                        fullWidth
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                    />
                    <TextField
                        label="Valor do Campo"
                        variant="outlined"
                        fullWidth
                        value={newFieldValue}
                        onChange={(e) => setNewFieldValue(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseNewCardModal}>Cancelar</Button>
                    <Button variant="contained" onClick={handleCreateNewCard}>
                        Criar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL: Novo/Editar Campo */}
            <Dialog
                open={openFieldModal}
                onClose={() => setOpenFieldModal(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>{editingAccess ? 'Editar Campo' : 'Novo Campo'}</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Card"
                        variant="outlined"
                        fullWidth
                        value={cardNameForField}
                        onChange={(e) => setCardNameForField(e.target.value)}
                        helperText="Informe o nome do card ao qual este campo pertence"
                    />
                    <TextField
                        label="Nome do Campo"
                        variant="outlined"
                        fullWidth
                        value={fieldName}
                        onChange={(e) => setFieldName(e.target.value)}
                    />
                    <TextField
                        label="Valor"
                        variant="outlined"
                        fullWidth
                        value={fieldValue}
                        onChange={(e) => setFieldValue(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenFieldModal(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveField}>
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL: Renomear Card */}
            <Dialog
                open={openRenameModal}
                onClose={() => setOpenRenameModal(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Renomear Card</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <Typography>Card atual: {oldCardName}</Typography>
                    <TextField
                        label="Novo nome do Card"
                        variant="outlined"
                        fullWidth
                        value={newCardNameForRename}
                        onChange={(e) => setNewCardNameForRename(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenRenameModal(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleRenameCard}>
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL: Editar Cliente */}
            <Dialog
                open={openEditClientModal}
                onClose={handleCloseEditClientModal}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Editar Cliente</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <TextField
                        label="Nome"
                        variant="outlined"
                        fullWidth
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                    />
                    <TextField
                        label="CNPJ"
                        variant="outlined"
                        fullWidth
                        value={editCnpj}
                        onChange={(e) => setEditCnpj(e.target.value)}
                    />
                    <TextField
                        label="Segmento"
                        variant="outlined"
                        fullWidth
                        value={editSegment}
                        onChange={(e) => setEditSegment(e.target.value)}
                    />
                    <TextField
                        label="E-mail de Contato"
                        variant="outlined"
                        fullWidth
                        value={editContactEmail}
                        onChange={(e) => setEditContactEmail(e.target.value)}
                    />
                    <TextField
                        label="Telefone"
                        variant="outlined"
                        fullWidth
                        value={editContactPhone}
                        onChange={(e) => setEditContactPhone(e.target.value)}
                    />
                    <TextField
                        label="Nome do Dono (Responsável)"
                        variant="outlined"
                        fullWidth
                        value={editOwnerName}
                        onChange={(e) => setEditOwnerName(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditClientModal}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveClientEdit}>
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
