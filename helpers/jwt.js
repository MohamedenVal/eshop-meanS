const expressJwt = require('express-jwt');

function authJwt() {
    let secret = process.env.secret;
    const api = process.env.API_URL;
    return expressJwt({
        secret,
        algorithms: ['HS256']
    }).unless({
        path: [
            {url: /\/api\/v1\/products(.*)/, method: ['GET', 'OPTIONS']},
            {url: /\/api\/v1\/categories(.*)/, method: ['GET', 'OPTIONS']},
            `${api}/users/login`,
            `${api}/users/register`
        ]
    })
};

module.exports = authJwt;