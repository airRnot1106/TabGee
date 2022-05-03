<script setup lang="ts">
import { emit } from 'process';
import { ref } from 'vue';
import { TabgeeMarker, TabgeeTabs } from '../pages/MapContainer.vue';

interface Props {
    tabs: TabgeeTabs;
}

interface Emits {
    (e: 'applyMarker'): void;
    (e: 'removeMarker', marker: TabgeeMarker): void;
}

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const applyMarker = (e: KeyboardEvent, marker: TabgeeMarker) => {
    if (e.keyCode === 229) return;
    marker.isTitleInputState = false;
    marker.isMemoInputState = false;
    emits('applyMarker');
};

const removeMarker = (marker: TabgeeMarker) => {
    emits('removeMarker', marker);
};
</script>

<template>
    <div
        class="overflow-auto overscroll-contain bg-gray-200 py-10 px-40"
        style="height: 30vh"
    >
        <div class="bg-white p-5 rounded-lg">
            <div class="flex items-center">
                <i class="fa-solid fa-location-dot px-1"></i>
                <p>Marker List</p>
            </div>
            <div
                v-for="tab in props.tabs.tabs"
                class="overflow-auto overflow-x-hidden h-40 mt-8"
            >
                <div class="m-3">{{ tab.title }}</div>
                <table class="table-fixed break-all w-full">
                    <thead class="">
                        <tr class="bg-gray-50 rounded-lg">
                            <th class="px-4 py-2">Title</th>
                            <th class="px-4 py-2">Address</th>
                            <th class="px-4 py-2">Memo</th>
                            <th class="px-4 py-2" style="width: 2vh"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="marker in tab.map.markers">
                            <td
                                v-if="marker.isTitleInputState"
                                class="px-4 py-2"
                            >
                                <input
                                    v-on:keydown.enter="
                                        applyMarker($event, marker)
                                    "
                                    type="text"
                                    v-model="marker.title"
                                    class="w-full border-2 border-gray-200 rounded-lg"
                                />
                            </td>
                            <td v-else class="px-4 py-2">
                                <div class="flex items-center">
                                    <button
                                        v-on:click="
                                            marker.isTitleInputState = true
                                        "
                                    >
                                        <i class="fa-solid fa-pencil"></i>
                                    </button>
                                    <p class="px-2">{{ marker.title }}</p>
                                </div>
                            </td>
                            <td class="px-4 py-2">{{ marker.address }}</td>
                            <td
                                v-if="marker.isMemoInputState"
                                class="px-4 py-2"
                            >
                                <input
                                    v-on:keydown.enter="
                                        applyMarker($event, marker)
                                    "
                                    type="text"
                                    v-model="marker.memo"
                                    class="w-full border-2 border-gray-200 rounded-lg"
                                />
                            </td>
                            <td v-else class="px-4 py-2">
                                <div class="flex items-center">
                                    <button
                                        v-on:click="
                                            marker.isMemoInputState = true
                                        "
                                    >
                                        <i class="fa-solid fa-pencil"></i>
                                    </button>
                                    <p class="px-2">{{ marker.memo }}</p>
                                </div>
                            </td>
                            <td class="px-4 py-2">
                                <button
                                    v-on:click="removeMarker(marker)"
                                    class="translate -translate-x-3 px-2 rounded-lg hover:bg-gray-100"
                                >
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
