require('dotenv').config();  // For environment variables
const app = require('./src/app');

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});



