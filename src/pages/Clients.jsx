// src/pages/Clients.jsx
import { useState } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActionArea
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { mockClients } from '../mocks/clients';

export default function Clients() {
    const [clients] = useState(mockClients);
    const navigate = useNavigate();

    const handleCardClick = (clientId) => {
        // Redireciona para a rota de detalhes
        navigate(`/clients/${clientId}`);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Clientes
            </Typography>

            <Grid
                container
                spacing={2}
                sx={{
                    justifyContent: { xs: 'center', md: 'flex-start' },
                }}
            >
                {clients.map((client) => (
                    <Grid
                        item
                        key={client.id}
                        xs={12}
                        sm={12}
                        md={6}
                        lg={6}
                    >
                        <Card
                            sx={{
                                minHeight: 150,
                                minWidth: { xs: 'auto', md: 400 },
                            }}
                        >
                            <CardActionArea onClick={() => handleCardClick(client.id)}>
                                <CardContent>
                                    <Typography variant="h6">
                                        {client.name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                                        E-mail: {client.contactEmail}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                        Telefone: {client.contactPhone}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
