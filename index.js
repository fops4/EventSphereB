const express = require('express');
const bodyParser = require('body-parser');
const loginRouter = require('./routes/login');
const signupRouter = require('./routes/signup');
const authRouter = require('./routes/auth');
const paiemRouter = require('./routes/paiement');
const reservRouter = require('./routes/reservation');
const creerevenementRouter = require('./routes/creereven');
const resetpasswordRouter = require('./routes/resetpassword');
const updateprofileRouter = require('./routes/updateprofile');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use('/api', loginRouter);
app.use('/api', signupRouter);
app.use('/api', paiemRouter);
app.use('/api', authRouter);
app.use('/api', reservRouter);
app.use('/api', creerevenementRouter);
app.use('/api', resetpasswordRouter); 
app.use('/api', updateprofileRouter); 

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
