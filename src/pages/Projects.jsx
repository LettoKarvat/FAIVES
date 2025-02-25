// src/pages/Projects.jsx
import { useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, Chip, LinearProgress } from '@mui/material';
import { mockProjects } from '../mocks/projects';

export default function Projects() {
  const [projects] = useState(mockProjects);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Projetos
      </Typography>

      <Grid container spacing={2}>
        {projects.map((project) => (
          <Grid
            item
            key={project.id}
            xs={12}    // no mobile ocupa a linha toda
            sm={12}    // em telas "small" também ocupa a linha toda
            md={6}     // em telas "médias" (desktop comum) fica 2 colunas
            lg={4}     // em telas "grandes" (desktop maior) fica 3 colunas
          >
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {project.name}
                </Typography>

                <Typography variant="body2" color="textSecondary">
                  Cliente: {project.client}
                </Typography>

                <Chip
                  label={project.status}
                  color={
                    project.status === 'Em Progresso' ? 'primary'
                      : project.status === 'Em Aberto' ? 'warning'
                        : project.status === 'Concluído' ? 'success'
                          : 'default'
                  }
                  variant="outlined"
                  sx={{ my: 1 }}
                />

                <Typography variant="body2">
                  Prazo: {project.deadline}
                </Typography>

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
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
