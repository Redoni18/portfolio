<!-- eslint-disable vue/multi-word-component-names -->

<template>
    <div>
        <div class="timeline">
            <ul>
                <li>
                    <div class="content">
                        <div class="content-intro">
                            <span class="highlight-date">3rd January 2020</span>
                            <h3>What Is Lorem Ipsum?</h3>
                        </div>
                        <p>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                        </p>
                    </div>
                </li>
                <li>
                    <div class="content">
                        <div class="content-intro">
                            <span class="highlight-date">3rd January 2020</span>
                            <h3>What Is Lorem Ipsum?</h3>
                        </div>
                        <p>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                        </p>
                    </div>
                </li>
                <li>
                    <div class="content">
                        <div class="content-intro">
                            <span class="highlight-date">3rd January 2020</span>
                            <h3>What Is Lorem Ipsum?</h3>
                        </div>
                        <p>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                        </p>
                    </div>
                </li>
                <li>
                    <div class="content">
                        <div class="content-intro">
                            <span class="highlight-date">3rd January 2020</span>
                            <h3>What Is Lorem Ipsum?</h3>
                        </div>
                        <p>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
                        </p>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.timeline{
    width:100%;
    color:#eceef3;
    padding:30px 20px;
    display: flex;
    justify-content: center;
}

.timeline ul{
    list-style-type:none;
    border-left:2px solid rgba(0, 160, 255, 0.1);;
    padding:10px 5px;
    width: 80%;
}

.timeline ul li{
    padding:20px 20px;
    position:relative;
    cursor:pointer;
    transition:.5s;
}

.timeline .content-intro{
    display: flex;
    align-items: center;
    flex-direction: row-reverse;
}

.timeline ul li .content-intro h3{
    flex-grow: 1;
    display: flex;
    justify-content: flex-start;
    color: #eceef3;
}

.timeline ul li span{
    display:inline;
    font-size:15px;
    text-align:left;
    width: fit-content;
}
.timeline ul li .content h3{
    color: #eceef3;
    font-size:17px;
    padding-top:5px;
}
.timeline ul li .content p{
    padding:5px 0px 15px 0px;
    font-size:15px;
    color: rgba(236, 238, 243, 0.8);
}
.timeline ul li:before{
    position:absolute;
    content:'';
    width:10px;
    height:10px;
    background-color:#34ace0;
    border-radius:50%;
    left:-11px;
    top:28px;
    transition:.5s;
}

.timeline ul li:hover{
    background-color:rgba(0, 160, 255, 0.1);
    border-radius: 5px;
}
.timeline ul li:hover:before{
    background-color:rgb(0, 160, 255);
    box-shadow:0px 0px 10px 2px rgb(0, 160, 255);
}

.highlight-date{
    background-color: rgba(0, 160, 255, 0.1);
    color: #00a0ff;
    border-radius: 10px;
    padding: 5px;
    display: inline-block;
}

@media (max-width:300px){
    .timeline{
        width:100%;
        padding:30px 5px 30px 10px;
    }
    .timeline ul li .content h3{
        color: #00a0ff;
        font-size:15px;
    }

}
</style>
