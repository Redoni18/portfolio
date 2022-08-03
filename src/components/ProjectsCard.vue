<template>
    <div>
        <div class="projects-card">
            <div class="project-image">
                <img src="../assets/profile.webp" alt="">
            </div>
            <div class="project-info">
                <h3>Library Management System (eLMS)</h3>
                <p>Web Application</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.projects-card{
    width: 300px;
    max-height: 350px;
    border-radius: 15px;
    background: #1e3851;
}

.project-image{
    max-height: 75%;
}

.project-image img{
    max-width: 100%;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
    object-fit: contain;
}

.project-info{
    max-height: 25%;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
}

h3, p{
    height: 15px;
    color: #eceef3;
}
</style>
