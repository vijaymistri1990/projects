import './src/config/env.js'; // MUST be first — loads .env before any other module reads process.env
import { app } from './src/app.js';

app.listen(app.get('port'), function () {
    console.log("Simulator app " + process.env.NODE_ENV + " started on Port No. ", app.get('port'));
}); 