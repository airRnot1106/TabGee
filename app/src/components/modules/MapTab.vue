<script setup lang="ts">
import { TabgeeTabs } from '../pages/MapContainer.vue';

interface Props {
    tabs: TabgeeTabs;
}
const props = defineProps<Props>();

interface Emits {
    (e: 'createNewTab'): void;
    (e: 'deleteTab', index: number): void;
    (e: 'toggleTab', index: number): void;
}

const emits = defineEmits<Emits>();

const createNewTab = () => emits('createNewTab');
const deleteTab = (e: MouseEvent) => {
    const strIndex = (e.currentTarget as HTMLElement).id.split('-')[1];
    if (!strIndex) throw new Error('index of the tab is undefined');
    const index = parseInt(strIndex);
    if (!Number.isNaN(index)) {
        emits('deleteTab', index);
    }
};
const toggleTab = (e: MouseEvent) => {
    const strIndex = (e.currentTarget as HTMLElement).id.split('-')[1];
    if (!strIndex) throw new Error('index of the tab is undefined');
    const index = parseInt(strIndex);
    if (!Number.isNaN(index)) {
        emits('toggleTab', index);
    }
};
</script>

<template>
    <div class="bg-white inline-flex flex-row">
        <nav
            v-for="(tab, index) in props.tabs.tabs"
            class="inline-flex items-center"
        >
            <button
                v-if="tab.isEnabled"
                v-bind:id="`tab-${index}`"
                class="text-blue-500 py-3 px-6 block hover:text-blue-500 focus:outline-none border-b-2 font-medium border-blue-500"
            >
                {{ tab.title }}
            </button>
            <button
                v-else
                v-on:click="toggleTab"
                v-bind:id="`tab-${index}`"
                class="text-gray-600 py-3 px-6 block hover:text-blue-500 focus:outline-none"
            >
                {{ tab.title }}
            </button>
            <button v-on:click="deleteTab" v-bind:id="`delete-${index}`">
                <i class="fa-solid fa-xmark px-3"></i>
            </button>
        </nav>
        <div class="border-l-2 py-2 px-4 flex items-center">
            <button
                v-on:click="createNewTab"
                class="rounded-lg transition duration-300 ease-in-out hover:bg-gray-100"
            >
                <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="#666a6d"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    ></path>
                </svg>
            </button>
        </div>
    </div>
</template>
