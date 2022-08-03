<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div class="navbar">
        <router-link class="logo" :to="{name: 'home'}">
            <img src="../assets/logo.svg" alt="">
            <img src="../assets/signature.svg" alt="">
        </router-link>
        <div class="nav-items">
            <ul class="nav-items-list">
                <li>Projects</li>
                <li>About Me</li>
                <li>Contact</li>
            </ul>
        </div>
        <div class="extra-items">
            <ul class="extra-items-list">
                <li>Blog</li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
  name: 'NavbarComponent'
}
</script>

<style scoped>
.navbar{
    display: flex;
    max-height: 50px;
    justify-content: space-around;
    margin-top: 30px;
    font-size: 1.2rem;
}

.logo, .extra-items{
    width: 300px;
    max-height: 100%;
    display: flex;
    align-items: center;
}

.nav-items {
    flex-grow: 2;
    display: flex;
    align-items: center;
}

.nav-items-list{
    display: flex;
    list-style-type: none;
    justify-content: space-evenly;
    padding: 0;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
}

.nav-items-list li{
    padding: 10px;
    color: #eceef3;
    transition: 0.2s ease-in-out;
}

.nav-items-list li:hover{
    background-color:rgba(0,160,255,0.2);
    border-radius: 10px;
    transition: 0.2s ease-in-out;
    cursor: pointer;
}

.logo img{
    display: flex;
    justify-content: flex-start;
    align-items: center;
    object-fit: contain;
    height: 100%;
}

.logo img:last-child{
    margin-left: 10px;
}

.extra-items{
    display: flex;
    justify-content: flex-end;
}

.extra-items-list{
    list-style-type: none;
    color: #eceef3;
    padding: 0;
    width: 71px;
}

.extra-items-list li{
    display: flex;
    justify-content: flex-end;
    margin-right: 10px;
    padding: 10px;
    transition: 0.2s ease-in-out;
}

.extra-items-list li:hover{
    background-color:rgba(0,160,255,0.2);
    border-radius: 10px;
    transition: 0.2s ease-in-out;
    cursor: pointer;
}

@media screen and (max-width: 1000px){
    .logo, .extra-items{
        width: 150px;
    }

    .nav-items {
        flex-grow: unset;
    }

    .extra-items-list{
        width: 100%;
    }

    .extra-items-list li{
        display: flex;
        justify-content: center;
    }

    .logo{
        display: flex;
        justify-content: center;
        object-fit: contain;
    }
}

</style>
