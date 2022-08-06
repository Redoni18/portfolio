<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable no-trailing-spaces -->
<template>
    <div>
        <div class="footer">
            <h1>Stalk me here!</h1>
            <div class="social-media">
                <a href="https://www.github.com/Redoni18" target="_blank">
                    <div class="social-media-img">
                        <img src="../assets/github.svg" alt="">
                    </div>
                </a>
                <a href="https://www.linkedin.com/in/redon-emini" target="_blank">
                    <div class="social-media-img">
                        <img src="../assets/linkedin.svg" alt="">
                    </div>
                </a>
                <a href="https://www.instagram.com/redon_emini" target="_blank">
                    <div class="social-media-img">
                        <img src="../assets/instagram.svg" alt="">
                    </div>
                </a>
                <a href="https://twitter.com/Redoni24" target="_blank">
                    <div class="social-media-img">
                        <img src="../assets/twitter.svg" alt="">
                    </div>
                </a>
            </div>
            <div class="copyright-message">
                <h3>&copy; 2022. Developed by Redon Emini</h3>

            </div>
        </div>
    </div>
</template>

<style scoped>
.footer{
    margin-top: 80px;
    color: #eceef3;
    margin-bottom: 50px;
}

.social-media{
    height: 70px;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 40px;
}

.social-media-img{
    height: fit-content;
    padding: 10px;
    background: #1e3851;
    width: fit-content;
    border-radius: 10px;
    transition: 0.2s ease-in;
}

.social-media-img:hover{
    background: rgba(0,160,255,0.2);
    transition: 0.2s ease-in;
}

.social-media-img img{
    width: 40px;
    height: 40px;
}

.copyright-message{
    margin-top: 80px;
}

.copyright-message h3{
    font-weight: 100;
}

</style>
