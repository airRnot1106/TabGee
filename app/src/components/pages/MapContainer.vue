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
    isTitleInputState: boolean;
    isMemoInputState: boolean;
    title: string;
    address: string;
    memo: string;

    constructor(
        latitude: number,
        longitude: number,
        title: string,
        address: string
    ) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.isTitleInputState = false;
        this.isMemoInputState = false;
        this.title = title;
        this.address = address;
        this.memo = '';
    }
}
</script>

<script setup lang="ts">
import L from 'leaflet';
import MapTab from '../modules/MapTab.vue';
import SearchBox from '../modules/SearchBox.vue';
import MapPanel from '../modules/MapPanel.vue';
import { inject, onMounted, reactive, watch } from 'vue';
import http from '../../axios';
import MarkerList from '../modules/MarkerList.vue';
import { VueCookies } from 'vue-cookies';

let lMap: L.Map | undefined;
let lMarker: L.Marker[] = [];
let mapLc: L.Control.Locate;
let isGlobalMarker: boolean = false;

const initMapPanel = (tab: TabgeeTab) => {
    lMap?.remove();
    const { latitude, longitude, zoom } = tab.map;
    lMap = L.map('mapPanel', { zoomControl: false }).setView(
        [latitude, longitude],
        zoom
    );

    L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
        attribution:
            "<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
    }).addTo(lMap);
    L.control.zoom({ position: 'topright' }).addTo(lMap);
    L.control
        .locate({
            position: 'topright',
            strings: {
                title: '現在地を表示',
                popup: '現在地',
            },
            locateOptions: {
                maxZoom: 16,
            },
            icon: 'fa-solid fa-location-dot',
        })
        .addTo(lMap);
    lMarker = [];
    lMarker = tab.map.markers.map((marker) => {
        const { latitude: lat, longitude: lng, title, address } = marker;
        return L.marker([lat, lng])
            .addTo(lMap)
            .bindPopup(`<b>${title}</b><br>${address}`);
    });
    L.easyButton('fa-solid fa-g', () => {
        isGlobalMarker = isGlobalMarker ? false : true;
        viewMarker();
    })
        .setPosition('bottomright')
        .addTo(lMap);
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
        const markers = reactivityTabsObj.tabs.flatMap(
            (tab) => tab.map.markers
        );
        if (
            markers.find(
                (marker) => marker.latitude === lat && marker.longitude === lng
            )
        )
            return;
        const title = '新しいマーカー';
        const address = (
            await http.get(`/reverseGeocode?lat=${lat}&lon=${lng}`)
        ).data.body[0].Property.Address;
        const marker = {
            latitude: lat,
            longitude: lng,
            isTitleInputState: false,
            isMemoInputState: false,
            title: title,
            address: address ?? '不明な住所',
            memo: '',
        };
        getEnabledTab().map.markers.push(marker);
        viewMarker();
    });
};

onMounted(() => {
    const cookie = $cookies.get('tabs');
    if (cookie) {
        reactivityTabsObj.enabledTabIndex = cookie.enabledTabIndex;
        reactivityTabsObj.tabs = cookie.tabs;
        initMapPanel(getEnabledTab());
    } else {
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
    }
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

const $cookies = inject<VueCookies>('$cookies');

watch(reactivityTabsObj, () => {
    $cookies.set('tabs', reactivityTabsObj);
});

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
    lMarker.forEach((marker) => {
        marker.remove();
    });
    const enabledTab = getEnabledTab();
    const markers = enabledTab.map.markers.map((marker) => {
        const { latitude: lat, longitude: lng, title, address } = marker;
        return L.marker([lat, lng])
            .addTo(lMap)
            .bindTooltip(`<b>${title}</b><br>${address}`);
    });
    lMarker = markers;
};

const viewGlobalMarker = () => {
    lMarker.forEach((marker) => {
        marker.remove();
    });
    const tabs = reactivityTabsObj.tabs;
    const markers = tabs.flatMap(({ map: { markers } }) => {
        return markers.map((marker) => {
            const { latitude: lat, longitude: lng, title, address } = marker;
            return L.marker([lat, lng])
                .addTo(lMap)
                .bindTooltip(`<b>${title}</b><br>${address}`);
        });
    });
    lMarker = markers;
};

const viewMarker = () => {
    isGlobalMarker ? viewGlobalMarker() : viewLocalMarker();
};

const removeMarker = (marker: TabgeeMarker) => {
    reactivityTabsObj.tabs.forEach((tab) => {
        tab.map.markers = tab.map.markers.filter(
            (m) =>
                m.latitude !== marker.latitude &&
                m.longitude !== marker.longitude
        );
    });
    viewMarker();
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
    <MarkerList
        @apply-marker="viewMarker"
        @remove-marker="removeMarker"
        v-bind:tabs="reactivityTabsObj"
    ></MarkerList>
</template>

<style scoped></style>
