import app from './app.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Manaus Live Transit BFF Server running on http://localhost:${PORT}`);
});
