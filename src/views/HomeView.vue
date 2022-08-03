<template>
  <div class="portfolio-home">
    <Navbar></Navbar>
    <div class="landing">
      <div class="intro-info">
        <h1 class="intro">Hey <span class="waving-hand">👋</span>, I'm Redon,</h1>
        <h1>a <span class="highlight">Full-Stack web developer</span></h1>
      </div>
      <img src="../assets/developer.svg" alt="">
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Navbar from '../components/Navbar.vue'

// setInterval(displayCursor, 1000)

// function displayCursor () {
//   document.getElementById('cursor').style.display = 'inline'
//   setTimeout(hideCursor, 2000)
// }

// function hideCursor () {
//   document.getElementById('cursor').style.display = 'none'
//   setTimeout(displayCursor, 1000)
// }

export default {
  name: 'HomeView',
  components: {
    Navbar
  }
}
</script>

<style scoped lang="scss">

.portfolio-home{
  margin: auto;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

.landing{
  height: 80vh;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  max-width: 100%;
  margin-top: 20px;
}

.intro-info{
  text-align: left;
}

h1{
  color: #eceef3;
  font-size: 2.8rem;
}

.landing img{
  width: 400px;
}

.highlight{
  background-color: rgba($color: #00a0ff, $alpha: 0.1);
  color: #00a0ff;
  border-radius: 10px;
  padding: 10px;
  display: inline-block;
}

.waving-hand:hover{
  animation-name: wave-animation;
  animation-duration: 2.5s;
  animation-iteration-count: infinite;
  transform-origin: 70% 70%;
  display: inline-block;
}

@keyframes wave-animation {
    0% { transform: rotate( 0.0deg) }
   10% { transform: rotate(14.0deg) }
   20% { transform: rotate(-8.0deg) }
   30% { transform: rotate(14.0deg) }
   40% { transform: rotate(-4.0deg) }
   50% { transform: rotate(10.0deg) }
   60% { transform: rotate( 0.0deg) }
  100% { transform: rotate( 0.0deg) }
}
</style>
