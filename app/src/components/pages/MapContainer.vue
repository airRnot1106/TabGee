<script lang="ts">
export interface TabgeeTabs {
    tabs: TabgeeTab[];
    enabledTabIndex: number;
}

export interface TabgeeTab {
    title: string;
    map: TabgeeMap;
    isEnabled: boolean;
}

export interface TabgeeMap {
    latitude: number;
    longitude: number;
    zoom: number;
    marker: TabgeeMarker[];
}

export interface TabgeeMarker {
    latitude: number;
    longitude: number;
    title: string;
    address: string;
}
</script>

<script setup lang="ts">
import L from 'leaflet';
import MapTab from '../modules/MapTab.vue';

import SearchBox from '../modules/SearchBox.vue';
import MapPanel from '../modules/MapPanel.vue';
import { onMounted, reactive } from 'vue';

const getCurrentPosition = (): Promise<GeolocationPosition> => {
    if (!('geolocation' in navigator)) {
        return Promise.reject('Geolocation is not available');
    }
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
};

let lMap: L.Map | undefined;
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
};

onMounted(() => {
    initMapPanel(defaultTab);
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

const defaultMap: TabgeeMap = {
    latitude: 35.6759323,
    longitude: 139.7450316,
    zoom: 14,
    marker: [],
};

const defaultTab: TabgeeTab = {
    title: 'Tab01',
    map: { ...defaultMap },
    isEnabled: true,
};

const defaultTabsObj: TabgeeTabs = {
    tabs: [{ ...defaultTab }],
    enabledTabIndex: 0,
};

const reactivityTabsObj = reactive<TabgeeTabs>({ ...defaultTabsObj });

const initTabs = () => {
    reactivityTabsObj.tabs = [{ ...defaultTab }];
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
    const newTab = {
        title: 'Tab' + `${reactivityTabsObj.tabs.length + 1}`.padStart(2, '0'),
        map: { ...defaultMap },
        isEnabled: true,
    };
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
</script>

<template>
    <MapTab
        @create-new-tab="createNewTab"
        @delete-tab="deleteTab"
        @toggle-tab="toggleTab"
        v-bind:tabs="reactivityTabsObj"
    ></MapTab>
    <div class="relative">
        <SearchBox class="absolute top-5 left-5 z-10"></SearchBox>
        <MapPanel class="mapPanel z-0"></MapPanel>
    </div>
</template>

<style scoped></style>
