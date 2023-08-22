const http = require('http'); // Module pour créer le serveur
const app = require('./app'); // On importe l'app Express

// On prend la valeur du port et on vérifie s'il est valide
const normalizePort = val => {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
};

// Choisi numéro de port, configure avec ce numéro l'application
const port = normalizePort(process.env.PORT || '4000');
app.set('port', port);

const errorHandler = error => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const address = server.address(); // Obtient l'adresse
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port; // 
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.'); // Pas les permissions nécessaires
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.'); // Déjà utilisé
      process.exit(1);
      break;
    default:
      throw error; // Toutes les autres erreurs
  }
};

// Création du serveur
const server = http.createServer(app);
// Gestion d'erreur et message pour dire que c'est prêt
server.on('error', errorHandler);
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});
// Démarrage du serveur
server.listen(port);
