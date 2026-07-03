// bridge.js - Bridge for Vite + Electron
module.exports = {
    start: function() {
        require('electron');
        require('./app/main/main.ts');
    }
};
