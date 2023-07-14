// This is only if we decide to use pm2 as a process manager
// It is not used now. We only rely on nodemon
// TODO: revise paths
const path = require('path');

export default {
    apps: [{
        script: 'app.js',
        error_file: path.join(__dirname, '/logs/pm2/err.log'),
        out_file: path.join(__dirname, '/logs/pm2/out.log'),
        log_file: path.join(__dirname, '/logs/pm2/combined.log'),
        // watch: ['/lib/helper_data.js',
        //     '/lib/helper_ops.js',
        //     '/lib/bigToes.js'].map((p) => path.join(__dirname, p)),
        exec_mode: 'fork',
        detached: true,
        listen_timeout: 3000,
        wait_ready: true,
    }],

    deploy: {
        production: {
            'user': 'SSH_USERNAME',
            'host': 'SSH_HOSTMACHINE',
            'ref': 'origin/master',
            'repo': 'GIT_REPOSITORY',
            'path': 'DESTINATION_PATH',
            'pre-deploy-local': '',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
            'pre-setup': '',
        },
    },
};
