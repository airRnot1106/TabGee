import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

export const reverseGeocode = async ({
    lat,
    lon,
}: {
    lat: number;
    lon: number;
}) => {
    const url = new URL('https://map.yahooapis.jp/geoapi/V1/reverseGeoCoder');
    const params = [
        ['appid', process.env['YAHOO_CLIENT_ID'] ?? ''],
        ['output', 'json'],
        ['lat', `${lat}`],
        ['lon', `${lon}`],
    ];
    url.search = new URLSearchParams(params).toString();
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(await res.text());
    const json = await res.json();
    console.log(json);
    return { type: 'reverseGeocode', body: json.Feature ?? [] };
};
