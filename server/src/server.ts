import cors from 'cors';
import express from 'express';
import serveStatic from 'serve-static';

const app = express();
const port = process.env['PORT'] || 3000;

if (process.env['NODE_ENV'] !== 'production') {
    app.use(cors());
}

app.use(serveStatic(__dirname + '/dist'));

app.listen(port, () =>
    console.log(`Example app listening at http://localhost:${port}`)
);
