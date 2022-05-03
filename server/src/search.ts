import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

export const search = async (query: string) => {
    const url = new URL('https://map.yahooapis.jp/search/local/V1/localSearch');
    const params = [
        ['appid', process.env['YAHOO_CLIENT_ID'] ?? ''],
        ['output', 'json'],
        ['query', query],
        ['sort', '-rating'],
    ];
    url.search = new URLSearchParams(params).toString();
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    return { type: 'search', body: json.Feature ?? [] };
};
