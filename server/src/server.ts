import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import serveStatic from 'serve-static';

import { geocode } from './geocode';
import { reverseGeocode } from './reverseGeocode';
import { search } from './search';

dotenv.config();

const app = express();
const port = process.env['PORT'] || 3000;

if (process.env['NODE_ENV'] !== 'production') {
    app.use(cors());
}

app.use(serveStatic(__dirname + '/../../app/dist'));

app.listen(port, () =>
    console.log(`Example app listening at http://localhost:${port}`)
);

interface ApiResponseSuccessful<T> {
    status: 200;
    type: string;
    body: T;
}

interface ApiResponseFailure {
    status: 400 | 404 | 500;
    error: string;
}

type ApiResponse<T> = ApiResponseSuccessful<T> | ApiResponseFailure;

interface SearchRequestQuery {
    q: string;
}

app.get('/api/search', async (req, res) => {
    const { q } = req.query as unknown as SearchRequestQuery;
    const apiRes: ApiResponse<any> = await (async (query: string) => {
        try {
            const { type, body } = [
                await geocode(query),
                await search(query),
            ].find(({ body }) => body.length) ?? { type: '404', body: [] };
            console.log(type);
            return { status: 200, type: type, body: body } as const;
        } catch (e) {
            return { status: 400, error: (e as Error).message } as const;
        }
    })(q);
    res.json(apiRes);
});

interface ReverseGeocodeRequestQuery {
    lat: number;
    lon: number;
}

app.get('/api/reverseGeocode', async (req, res) => {
    const { lat, lon } = req.query as unknown as ReverseGeocodeRequestQuery;
    const apiRes: ApiResponse<any> = await (async ({ lat, lon }) => {
        try {
            const { type, body } = await reverseGeocode({ lat, lon });
            return { status: 200, type: type, body: body } as const;
        } catch (e) {
            return { status: 400, error: (e as Error).message } as const;
        }
    })({ lat, lon });
    res.json(apiRes);
});
