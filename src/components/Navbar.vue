<template>
    <div class="showPopup">
        <SignIn />
    </div>
    <div class="navBarActivator">
        <div class="credits col-2">
            darbu taisīja es un viņš
        </div>
        <div class="col-8"></div>
        <div class="authentification col-2">
            <div class="fa-solid fa-x me-4 fa-2x navbar-action p-1">LEAVE</div>
            <div @click="toggleLogin"  class="fa-solid fa-right-to-bracket fa-2x navbar-action p-1">LOG IN</div>
            <SignIn v-if="isOpen"/>
        </div>
    </div>
</template>

<script setup>
let isOpen = ref(false);

function toggleLogin() {
    isOpen = !isOpen
}
</script>

<style scoped>
.nav-container {
    position: fixed;
    width: 100%;
    background: white;
    margin: 0;
    transition: all ease-out 0.2s;
}
</style>