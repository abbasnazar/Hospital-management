'use strict';
const createApp = require('./app');

const PORT = process.env.PORT || ${PORT};
const app = createApp();

app.listen(PORT, () => {
  console.log(`${SERVICE}-service listening on port ${PORT}`);
});
