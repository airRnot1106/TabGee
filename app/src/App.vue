<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import Header from './components/modules/Header.vue';
import Footer from './components/modules/Footer.vue';
import MapContainer from './components/pages/MapContainer.vue';
</script>

<template class="flex flex-col min-h-screen">
    <Header class="z-20"></Header>
    <div class="flex-grow">
        <Suspense>
            <template #default>
                <MapContainer></MapContainer>
            </template>
            <template #fallback>
                <div class="h-screen">Loading...</div>
            </template>
        </Suspense>
    </div>
    <Footer></Footer>
</template>
