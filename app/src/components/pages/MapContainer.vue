<script lang="ts">
export interface TabgeeTabs {
    tabs: TabgeeTab[];
    enabledTabIndex: number;
}

export class TabgeeTab {
    title: string;
    map: TabgeeMap;
    isEnabled: boolean;

    constructor(title: string, map: TabgeeMap) {
        this.title = title;
        this.map = map;
        this.isEnabled = true;
    }
}

export class TabgeeMap {
    latitude: number;
    longitude: number;
    zoom: number;
    markers: TabgeeMarker[];

    constructor(latitude: number, longitude: number, zoom: number) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.zoom = zoom;
        this.markers = [];
    }
}

export class TabgeeMarker {
    latitude: number;
    longitude: number;
    title: string;
    address: string;

    constructor(
        latitude: number,
        longitude: number,
        title: string,
        address: string
    ) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.title = title;
        this.address = address;
    }
}
</script>

<script setup lang="ts">
import L from 'leaflet';
import MapTab from '../modules/MapTab.vue';

import SearchBox from '../modules/SearchBox.vue';
import MapPanel from '../modules/MapPanel.vue';
import { onMounted, reactive } from 'vue';
import http from '../../axios';

const getCurrentPosition = (): Promise<GeolocationPosition> => {
    if (!('geolocation' in navigator)) {
        return Promise.reject('Geolocation is not available');
    }
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
};

let lMap: L.Map | undefined;
let lMarker: L.Marker[] = [];
let mapLc: L.Control.Locate;

const initMapPanel = (tab: TabgeeTab) => {
    lMap?.remove();
    const { latitude, longitude, zoom } = tab.map;
    lMap = L.map('mapPanel', { zoomControl: false }).setView(
        [latitude, longitude],
        zoom
    );
    L.control.zoom({ position: 'topright' }).addTo(lMap);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(lMap);
    lMarker = [];
    lMarker = tab.map.markers.map((marker) => {
        const { latitude: lat, longitude: lng, title, address } = marker;
        return L.marker([lat, lng])
            .addTo(lMap)
            .bindPopup(`<b>${title}</b><br>${address}`);
    });
    lMap?.on('move', () => {
        const zoom = lMap?.getZoom();
        const pos = lMap?.getCenter();
        if (!zoom || !pos) return;
        const { lat, lng } = pos;
        updatePanel({
            latitude: lat,
            longitude: lng,
            zoom: zoom,
        });
    });
    lMap?.on('contextmenu', async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        const title = '新しいマーカー';
        const address = (
            await http.get(`/reverseGeocode?lat=${lat}&lon=${lng}`)
        ).data.body[0].Property.Address;
        const marker = {
            latitude: lat,
            longitude: lng,
            title: title,
            address: address ?? '不明な住所',
        };
        getEnabledTab().map.markers.push(marker);
        viewLocalMarker();
    });
};

onMounted(() => {
    initMapPanel(
        new TabgeeTab(
            defaultTab.title,
            new TabgeeMap(
                defaultMap.latitude,
                defaultMap.longitude,
                defaultMap.zoom
            )
        )
    );
    if (!lMap) return;
    mapLc = L.control
        .locate({
            position: 'topright',
            strings: {
                title: '現在地を表示',
                popup: 'いまここ',
            },
            locateOptions: {
                maxZoom: 16,
            },
            icon: 'fa-solid fa-location-dot',
        })
        .addTo(lMap);
});

const defaultMap: TabgeeMap = new TabgeeMap(35.6759323, 139.7450316, 14);

const defaultTab = { title: 'Tab01' };

const defaultTabsObj: TabgeeTabs = {
    tabs: [
        new TabgeeTab(
            defaultTab.title,
            new TabgeeMap(
                defaultMap.latitude,
                defaultMap.longitude,
                defaultMap.zoom
            )
        ),
    ],
    enabledTabIndex: 0,
};

const reactivityTabsObj = reactive<TabgeeTabs>(defaultTabsObj);

const initTabs = () => {
    reactivityTabsObj.tabs = [
        new TabgeeTab(
            defaultTab.title,
            new TabgeeMap(
                defaultMap.latitude,
                defaultMap.longitude,
                defaultMap.zoom
            )
        ),
    ];
    reactivityTabsObj.enabledTabIndex = 0;
};

const getEnabledTab = (): TabgeeTab => {
    const currentTab =
        reactivityTabsObj.tabs[reactivityTabsObj.enabledTabIndex];
    if (!currentTab) throw new Error('No enabled tab');
    return currentTab;
};

const enableTab = (tabIndex: number) => {
    const activateTab = reactivityTabsObj.tabs[tabIndex];
    if (!activateTab) throw new Error('No expected tab');
    activateTab.isEnabled = true;
    reactivityTabsObj.enabledTabIndex = tabIndex;
    initMapPanel(activateTab);
};

const disableTab = (tabIndex: number) => {
    const disableTab = reactivityTabsObj.tabs[tabIndex];
    if (!disableTab) throw new Error('No expected tab');
    disableTab.isEnabled = false;
    reactivityTabsObj.enabledTabIndex = -1;
};

const toggleTab = (tabIndex: number) => {
    disableTab(reactivityTabsObj.enabledTabIndex);
    enableTab(tabIndex);
};

const createNewTab = () => {
    const newTab = new TabgeeTab(
        'Tab' + `${reactivityTabsObj.tabs.length + 1}`.padStart(2, '0'),
        new TabgeeMap(
            defaultMap.latitude,
            defaultMap.longitude,
            defaultMap.zoom
        )
    );
    reactivityTabsObj.tabs.push(newTab);
    toggleTab(reactivityTabsObj.tabs.length - 1);
};

const deleteTab = (tabIndex: number) => {
    const deleteTab = reactivityTabsObj.tabs[tabIndex];
    if (!deleteTab) throw new Error('No expected tab');
    if (reactivityTabsObj.tabs.length === 1) {
        initTabs();
        return;
    } else if (reactivityTabsObj.enabledTabIndex === 0) {
        enableTab(1);
    }
    reactivityTabsObj.tabs.splice(tabIndex, 1);
    if (reactivityTabsObj.enabledTabIndex >= tabIndex) {
        enableTab(reactivityTabsObj.enabledTabIndex - 1);
    }
};

const updatePanel = (location: {
    latitude: number;
    longitude: number;
    zoom: number;
}) => {
    const { latitude, longitude, zoom } = location;
    const enabledTab = getEnabledTab();
    enabledTab.map.latitude = latitude;
    enabledTab.map.longitude = longitude;
    enabledTab.map.zoom = zoom;
};

const viewLocalMarker = () => {
    const enabledTab = getEnabledTab();
    const markers = enabledTab.map.markers.map((marker) => {
        const { latitude: lat, longitude: lng, title, address } = marker;
        return L.marker([lat, lng])
            .addTo(lMap)
            .bindPopup(`<b>${title}</b><br>${address}`);
    });
    lMarker = markers;
};

const jumpView = (location: {
    latitude: number;
    longitude: number;
    zoom: number;
}) => {
    updatePanel(location);
    const { latitude, longitude, zoom } = location;
    lMap?.setView([latitude, longitude], zoom);
};
</script>

<template>
    <MapTab
        @create-new-tab="createNewTab"
        @delete-tab="deleteTab"
        @toggle-tab="toggleTab"
        v-bind:tabs="reactivityTabsObj"
    ></MapTab>
    <div class="relative">
        <SearchBox
            @jump-view="jumpView"
            class="absolute top-5 left-5 z-10"
        ></SearchBox>
        <MapPanel class="mapPanel z-0"></MapPanel>
    </div>
</template>

<style scoped></style>
