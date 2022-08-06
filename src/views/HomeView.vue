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

    <div class="projects">
      <div class="projects-title">
        <h1>Personal Projects</h1>
        <p style="font-size: 1.2rem;">Search projects by title or filter by category</p>
      </div>

      <div class="search-filter-buttons">
        <div class="search">
          <button class="search-button">
            <img src="../assets/search.svg" alt="">
          </button>
          <input class="search-input" placeholder="Search for a project" type="text">
        </div>
      </div>
      <hr style="width: 100%;background: rgba(0,160,255,0.2);height: 1px;border: none;">
      <div class="project-cards">
          <ProjectsCard />
          <ProjectsCard />
          <ProjectsCard />
      </div>
      <button type="submit" class="more-projects__button">
        View More
      </button>
    </div>

    <div class="timeline">
      <div class="experience-timeline">
        <h1>Timeline</h1>
        <p style="font-size: 1.2rem;">Timeline of experiences and achievements</p>
      </div>
      <div class="timeline-cards">
        <Timeline />
      </div>
    </div>
    <hr style="width: 100%;background: rgba(0,160,255,0.2);height: 1px;border: none;">
    <Footer />
  </div>
</template>

<script>
// @ is an alias to /src
import Navbar from '../components/Navbar.vue'
import ProjectsCard from '../components/ProjectsCard.vue'
import Timeline from '../components/Timeline.vue'
import Footer from '../components/Footer.vue'
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
    Navbar,
    ProjectsCard,
    Timeline,
    Footer
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
  max-height: 80vh;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  max-width: 100%;
  margin-top: 40px;
}

.intro-info{
  text-align: left;
}

.intro-info h1{
  font-size: 2.7rem;
}

h1, h2, h3, h4, h5, h6, p {
  color: #eceef3;
}

h1{
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

// projects section

.projects{
  margin-top: 100px;
  margin-bottom: 100px;
}

.timeline{
  margin-bottom: 20px;
}

.search-filter-buttons{
  height: 60px;
}

.search{
  margin-top: 25px;
  display: flex;
  align-items: center;
  height: 100%;
  width: 50%;
}

.search-input{
  height: 40px;
  background: rgba(0,160,255,0.2);
  border: 1px solid rgb(0,160,255);
  border-radius: 10px;
  font-size: 1rem;
  padding-left: 15px;
  color: #eceef3;
  font-family: Inter, Arial, sans-serif;
  margin-left: 15px;
}

.search-button{
  padding: 10px;
  background-color:rgba(0,160,255,0.2);
  border: none;
  border-radius: 10px;
  transition: 0.2s ease-in-out;
}

.search-button:hover{
  cursor: pointer;
}

.search-button img{
  height: 20px;
  width: 20px;
  color: #eceef3;
  object-fit: contain;
}

.project-cards{
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  margin: 20px 0;
  gap: 15px;
}

.more-projects__button{
  padding: 10px;
  background: #1e3851;
  border: none;
  border-radius: 10px;
  transition: 0.2s ease-in-out;
  color: #eceef3;
  font-size: 1.2rem;
  font-family: Inter, Arial, sans-serif;
  transition: 0.2s ease-in;
}

.more-projects__button:hover{
  background: rgba(0,160,255,0.2);
  cursor: pointer;
  transition: 0.2s ease-in;
}

//timeline
.timeline{
  width: 100%;
}

.timeline-cards{
  width: 70%;
  margin: auto;
}

@media screen and (max-width: 1000px){
    .portfolio-home {
      width: 700px;
    }

    .landing{
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: unset;
      margin-top: 40px;
    }

    .intro-info{
      text-align: center;
    }

    h1{
      color: #eceef3;
      font-size: 2rem;
    }
}

@media screen and (max-width: 670px){
    .search{
      width: 100%;
      display: flex;
      justify-content: center;
    }

    .projects-title, .experience-timeline{
      padding: 10px
    }

    .intro-info h1{
      font-size: 1.5rem;
    }
}
</style>
