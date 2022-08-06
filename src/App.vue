<template>
  <router-view/>
</template>

<style lang="scss">
@font-face {
  font-family: 'Inter';
  src: url('./assets/static/Inter-Regular.ttf');
}

body, html{
    background: #0d2438;
    height: 100%;
    padding: 0 10px;
}

#app {
  font-family: Inter, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;

  max-width: 1200px;
  display: flex;
  justify-content: space-evenly;
  margin: auto;
  height: 100%;
}

</style>
