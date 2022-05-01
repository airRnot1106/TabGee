<script setup lang="ts">
import { reactive } from 'vue';
import http from '../../axios/';

interface Emits {
    (
        e: 'jumpView',
        geo: { latitude: number; longitude: number; zoom: number }
    ): void;
}

const emit = defineEmits<Emits>();

const jumpView = (geo: {
    latitude: number;
    longitude: number;
    zoom: number;
}) => {
    emit('jumpView', geo);
};

interface SearchList {
    id: number;
    name: string;
    address: string;
    geo: {
        latitude: number;
        longitude: number;
    };
}

let searchBoxText: string;
let searchList = reactive<{ list: SearchList[] }>({ list: [] });

const searchPlace = async (query: string) => {
    if (!query) {
        searchList.list = [];
        return;
    }
    const q = encodeURI(query);
    const url = `/search?q=${q}`;
    const res = await http.get(url);
    const items = res.data.body.map(
        (data: {
            Id: any;
            Name: any;
            Property: { Address: any };
            Geometry: { Coordinates: any };
        }) => {
            const {
                Id: id,
                Name: name,
                Property: { Address: address },
                Geometry: { Coordinates: coordinates },
            } = data;
            const [longitude, latitude] = (coordinates as string)
                .split(',')
                .map(parseFloat);
            const item = {
                id,
                name,
                address,
                geo: {
                    latitude,
                    longitude,
                },
            };
            return item;
        }
    );
    searchList.list = items;
};
</script>

<template>
    <div class="inline-flex flex-col">
        <form onsubmit="return false">
            <div class="inline-flex">
                <div class="flex items-center rounded-l-lg bg-white">
                    <input
                        v-model="searchBoxText"
                        type="search"
                        class="w-full px-4 py-1 text-gray-800 rounded-full focus:outline-none"
                        placeholder="search..."
                    />
                </div>
                <div>
                    <button
                        v-on:click="searchPlace(searchBoxText)"
                        type="submit"
                        class="flex items-center bg-blue-500 justify-center w-12 h-12 text-white rounded-r-lg"
                    >
                        <svg
                            class="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            ></path>
                        </svg>
                    </button>
                </div>
            </div>
        </form>
        <div class="bg-white rounded-lg">
            <ul>
                <li v-for="item in searchList.list">
                    <button
                        v-on:click="jumpView({ ...item.geo, zoom: 18 })"
                        class="flex items-center px-4 py-2 hover:bg-gray-100 w-full"
                    >
                        <svg
                            class="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            ></path>
                        </svg>
                        <div>
                            <p class="text-gray-800 text-sm">
                                {{ item.name }}
                            </p>
                            <p class="text-gray-600 text-xs">
                                {{ item.address }}
                            </p>
                        </div>
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>
