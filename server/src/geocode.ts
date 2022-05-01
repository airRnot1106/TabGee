import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

export const geocode = async (query: string) => {
    const url = new URL('https://map.yahooapis.jp/geocode/V1/geoCoder');
    const params = [
        ['appid', process.env['YAHOO_CLIENT_ID'] ?? ''],
        ['output', 'json'],
        ['query', query],
        ['sort', 'address2'],
    ];
    url.search = new URLSearchParams(params).toString();
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    console.log(json);
    return { type: 'geocode', body: json.Feature ?? [] };
};
