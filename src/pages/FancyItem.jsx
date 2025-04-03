// FancyItem.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';

export default function FancyItem({ text }) {
    if (text.includes(':')) {
        const [labelRaw, valueRaw] = text.split(':');
        const label = labelRaw.trim();
        const value = valueRaw.trim();

        return (
            <Box
                sx={{
                    border: '1px dashed #666',
                    p: 1,
                    mb: 1,
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 1
                }}
            >
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#90caf9' }}>
                    {label}:
                </Typography>
                <Typography variant="body2" sx={{ color: '#fff' }}>
                    {value}
                </Typography>
            </Box>
        );
    } else {
        return (
            <Box
                sx={{
                    border: '1px dotted #999',
                    p: 1,
                    mb: 1,
                    borderRadius: 1
                }}
            >
                <Typography variant="body2" sx={{ color: '#fff' }}>
                    {text}
                </Typography>
            </Box>
        );
    }
}
