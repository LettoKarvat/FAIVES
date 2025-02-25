// src/pages/Appointments.jsx
import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import { mockAppointments } from '../mocks/appointments';

// Exemplo opcional de formatação de data
// import { format } from 'date-fns';

export default function Appointments() {
  const [appointments] = useState(mockAppointments);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Compromissos
      </Typography>

      <Grid container spacing={2}>
        {appointments.map((app) => (
          <Grid
            item
            key={app.id}
            xs={12}
            sm={6}
            md={4}
            lg={3}
          >
            <Card>
              <CardContent>
                <Typography variant="h6">
                  {app.client}
                </Typography>

                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {/* Se quiser formatar data e hora: 
                      {format(new Date(app.dateTime), 'dd/MM/yyyy HH:mm')} */}
                  Data e Hora: {new Date(app.dateTime).toLocaleString()}
                </Typography>

                <Typography variant="body1" sx={{ mt: 1 }}>
                  Descrição: {app.description}
                </Typography>

                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Local: {app.location}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
