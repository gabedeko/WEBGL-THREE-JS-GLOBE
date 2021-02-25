//console.log();

import * as THREE from '/build/three.module.js';
import { OrbitControls } from  '/jsm/controls/OrbitControls.js';

//DATA IMPORT
let data = [];
let xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        let response = JSON.parse(xhttp.responseText);
        let output = Object.values(response);
        for (let i = 0; i < output.length; i++) {
            data.push(output[i]);
        }
    }
};
xhttp.open("GET", "../DATA/Final_data.json", false);
xhttp.send();
console.log(data);

// THREE.JS CODE

// Create scene where objects will be placed (kind of like a stage)
const scene = new THREE.Scene();

// Create camera to see objects (kind of like sitting in the audience)
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

// Create renderer to display the created objects (kind of like the people who place the different sets on the stage)
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create controls so that we can interact with the objects/have interactivity
const controls = new OrbitControls(camera, renderer.domElement);

//Create raycaster for mouse interaction
const raycaster = new THREE.Raycaster();

//Create vector2 for mouse and mobile x,y coordinates
const mouse = new THREE.Vector2();
const touch = new THREE.Vector2();

//
////Test code: Render Cube using BoxGeometry
////This is just a test to ensure three.js is running expectedly
//
// let geometry = new THREE.BoxGeometry();
// let material = new THREE.MeshBasicMaterial({color:0x00ff00});
// let cube = new THREE.Mesh(geometry,material);
// scene.add(cube);
// camera.position.z = 5;
//
////End
//

//Create Earth
//load in textures from images[Earthmap] which has various continents/coutnrs/etc.
let earthMap = new THREE.TextureLoader().load('../IMAGES/earthmap4k.jpg');

//EarthBumpMap is used to give the texture some "depth" so it is more appealing to the eeys
let earthBumpMap = new THREE.TextureLoader().load('../IMAGES/earthbump4k.jpg');

//EarthSpecMap gives the earth some shinyness to the envrionment, allowing reflectivity
let earthSpecMap = new THREE.TextureLoader().load('../IMAGES/earthspec4k.jpg');

//Geometry is what the shape/size of the globe will be 
let earthGeometry = new THREE.SphereGeometry(10,32,32);

//Material is how the globe will look like
let earthMaterial = new THREE.MeshPhongMaterial({
    map: earthMap,
    bumpMap: earthBumpMap,
    bumpScale: 0.10,
    specularMap: earthSpecMap,
    specular: new THREE.Color('grey')
})

//Earth is the final product that's rendered
//Also a parent for points of interests
let earth = new THREE.Mesh(earthGeometry, earthMaterial);

//Add earth to scene
scene.add(earth);

//Add clouds to the earth
let earthCloudGeo = new THREE.SphereGeometry(10, 32, 32);

//Add cloud texture
let earthCloudsTexture = new THREE.TextureLoader().load('../IMAGES/earthhiresclouds4K.jpg');

//Add cloud material
let earthMaterialClouds = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    map: earthCloudsTexture,
    transparent: true,
    opacity: 0.4
});

//Create final texture for clouds
let earthClouds = new THREE.Mesh(earthCloudGeo, earthMaterialClouds);

//Scale above the earth sphere mesh
earthClouds.scale.set(1.015, 1.015, 1.015);


//Make a child of the earth
earth.add(earthClouds);


//add array of lights variable
let lights = [];


//Create SkyBox so the scene can look better with starred images
function createSkyBox(scene){
    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        '../IMAGES/space_right.png',
        '../IMAGES/space_left.png',
        '../IMAGES/space_top.png',
        '../IMAGES/space_bot.png',
        '../IMAGES/space_front.png',
        '../IMAGES/space_back.png'
    ])
    scene.background = texture;
};

//create liights and add to scene
function createLights(scene){
    lights[0] = new THREE.PointLight("#004d99", .5, 0);
    lights[1] = new THREE.PointLight("#004d99", .5, 0);
    lights[2] = new THREE.PointLight("#004d99", .7, 0);
    lights[3] = new THREE.AmbientLight("#ffffff");

    lights[0].position.set(200, 0, -400);
    lights[1].position.set(200, 200, -400);
    lights[2].position.set(-200, -200, -50);

    scene.add(lights[0]);
    scene.add(lights[1]);
    scene.add(lights[2]);
    scene.add(lights[3]);
}

function addSceneObjects() {
    createLights(scene);
    createSkyBox(scene);
}

//AddSceneObjects adds the items to the scene
addSceneObjects(scene);

//Change position so we ca see the objects
camera.position.z = 20;

//Disable control function so users do not zoom too far in or pan from center
controls.minDistance = 12;
controls.maxDistance = 30;
controls.enablePan = false;
controls.update();
controls.saveState();


//Add event listeners so DPM knows what functions to use when objects/items are interacted with 
window.addEventListener('resize', onWindowResize, false);
window.addEventListener('click', onWindowClick, false);
//window.addEventListener('touchstart', onTouch, false);

let hidden = false;
function hideInstructions(){
    hidden = !hidden;
    if(hidden){
        document.querySelector("#instruction-box").style.display = "none";
    } else {
        document.querySelector("#instruction-box").style.display = "flex";
    }
};

//let instructionClicker = document.getElementById("instructions");
//instructionClicker.addEventListener("click", hideInstructions, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    //requestAnimationFrame(animate);
    
};

function onWindowClick(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    let intersects = raycaster.intersectObjects(earthClouds.children);

    for (let i = 0; i < intersects.length; i++){
        //console.log(intersects);
        document.querySelector("#region").innerText = "" + intersects[0].object.userData.region;
        document.getElementById("region").style.color = intersects[0].object.userData.color;
        document.querySelector("#country-info").innerText = "" + intersects[0].object.userData.country;
        document.querySelector("#language").innerText = "" + intersects[0].object.userData.language;
        document.querySelector("#population").innerText = "" + intersects[0].object.userData.population;
        document.querySelector("#area-sq-mi").innerText = "" + intersects[0].object.userData.area_sq_mi;
        document.querySelector("#gdp-per-capita").innerText = "" + intersects[0].object.userData.gdp_per_capita;
        document.querySelector("#climate").innerText = "" + intersects[0].object.userData.climate;
    }
    const item_test = intersects[0];
    let point = item_test.point;
    let camDistance = camera.position.copy(point).normalize.multiplyScalar(camDistance);
};

//Rendering the scene
function animate() {
    requestAnimationFrame( animate );
    render();
    controls.update();
};

function render() {
    renderer.render(scene,camera);
};

//Remove the points of interest to free memory and imporve performance
function removeChildren(){
    let destroy = earthClouds.children.length;
    while(destroy--) {
        earthClouds.remove(earthClouds.children[destroy].material.dispose())
        earthClouds.remove(earthClouds.children[destroy].geometry.dispose())
        earthClouds.remove(earthClouds.children[destroy])
    }
};

//Create and add coordinates for the globe
function addCountryCoord(earth, country, language, latitude, longitude, color, region, population, area_sq_mi, gdp_per_capita, climate) {
    let pointOfInterest = new THREE.SphereGeometry(.1, 32, 32);
    let lat = latitude * (Math.PI/180);
    let lon = -longitude * (Math.PI/180);
    const radius = 10;
    const phi = (90-lat)*(Math.PI/180);
    const theta = (lon+180)*(Math.PI/180);

    let material = new THREE.MeshBasicMaterial({
        color: color
    });

    let mesh = new THREE.Mesh(
        pointOfInterest,
        material
    );

    mesh.position.set(
        Math.cos(lat)*Math.cos(lon)*radius,
        Math.sin(lat)*radius,
        Math.cos(lat)*Math.sin(lon)*radius
    );

    mesh.rotation.set(0.0, -lon, lat-Math.PI*0.5);

    mesh.userData.country = country;
    mesh.userData.language = language;
    mesh.userData.color = color;
    mesh.userData.region = region;
    mesh.userData.area_sq_mi = area_sq_mi;
    mesh.userData.gdp_per_capita = gdp_per_capita;
    mesh.userData.climate = climate;

    earthClouds.add(mesh);

};

let countryInfo = document.getElementById("show-country");
countryInfo.addEventListener("click", changeToCountry);

function changeToCountry() {
    //Show/hide necessary eleements
    //document.querySelector("#instruction-box").style.display = "none";
    //document.getElementById("title-box").style.display = "none";
    //document.getElementById("info-box").style.display = "flex";


    removeChildren();

    //Get the data from the JSON file
    for (let i = 0; i < data.length; i++){
        if(data[i].Region == 'ASIA (EX. NEAR EAST)'){
            addCountryCoord(earth, data[i].Country, data[i].Languages, data[i].latitude, data[i].longitude, 'yellow', data[i].Region, data[i].Population, data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate)
        } else if(data[i].Region == 'NEAR EAST'){
            addCountryCoord(earth, data[i].Country, data[i].Languages, data[i].latitude, data[i].longitude, 'orange', data[i].Region, data[i].Population, data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate)
        } else if(data[i].Region == 'NORTHERN AMERICA'){
            addCountryCoord(earth, data[i].Country, data[i].Languages, data[i].latitude, data[i].longitude, 'lightblue', data[i].Region, data[i].Population, data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate)
        } else if(data[i].Region == 'WESTERN EUROPE'){
            addCountryCoord(earth, data[i].Country, data[i].Languages, data[i].latitude, data[i].longitude, 'cyan', data[i].Region, data[i].Population, data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate)
        } else if(data[i].Region == 'EASTERN EUROPE'){
            addCountryCoord(earth, data[i].Country, data[i].Languages, data[i].latitude, data[i].longitude, 'red', data[i].Region, data[i].Population, data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate)
        } else if(data[i].Region == 'BALTICS'){
            addCountryCoord(earth, data[i].Country, data[i].Languages, data[i].latitude, data[i].longitude, 'purple', data[i].Region, data[i].Population, data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate)
        } else if(data[i].Region == 'C.W. OF IND. STATES'){
            addCountryCoord(earth, data[i].Country, data[i].Languages, data[i].latitude, data[i].longitude, 'green', data[i].Region, data[i].Population, data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate)
        } else if(data[i].Region == 'NORTHERN AFRICA'){
            addCountryCoord(earth, data[i].Country, data[i].Languages, data[i].latitude, data[i].longitude, 'beige', data[i].Region, data[i].Population, data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate)
        } else if(data[i].Region == 'SUB-SAHARAN AFRICA'){
            addCountryCoord(earth, data[i].Country, data[i].Languages, data[i].latitude, data[i].longitude, 'brown', data[i].Region, data[i].Population, data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate)
        } else if(data[i].Region == 'LATIN AMER. & CARIB'){
            addCountryCoord(earth, data[i].Country, data[i].Languages, data[i].latitude, data[i].longitude, 'gold', data[i].Region, data[i].Population, data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate)
        } else if(data[i].Region == 'OCEANIA'){
            addCountryCoord(earth, data[i].Country, data[i].Languages, data[i].latitude, data[i].longitude, 'lightgreen', data[i].Region, data[i].Population, data[i].Area_sq_mi, data[i].GDP_per_capita, data[i].Climate)
        }
    }

};



animate();

