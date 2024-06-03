const { app } = require('./src/app');

app.listen(app.get('port'), function () {
    console.log("Simulator app " + process.env.NODE_ENV + " started on Port No. ", app.get('port'));
});