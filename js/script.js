// "use strict";

window.onload = function() {
    console.time('userTime');
    let scene, camera, renderer, light, sphere, headMesh, targetObject, shaderMaterial,
        cameraMode = 1,
        start = Date.now(),
        perWeight = 20.0;
    scene = new THREE.Scene();

    function init() {
        camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 10000);
        renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias - сглаживаем ребра
        camera.position.set(0, 615, 700);
        camera.rotation.set(-0.72, 0, 0);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setSize(window.innerWidth - 5, window.innerHeight - 5);
        renderer.gammaInput = renderer.gammaOutput = true;
        renderer.toneMapping = THREE.LinearToneMapping;
        // renderer.toneMappingExposure = 1;
        renderer.setClearColor(0x000000);
        document.body.appendChild(renderer.domElement);
    }

    function resize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        renderer.setSize(window.innerWidth - 5, window.innerHeight - 5);
        camera.updateProjectionMatrix()
    }
    init();
    addLights();
    /////////////////////////////////////////////////////////////////
    function addLights() {
        light;
        let d = 900;
        light = new THREE.DirectionalLight(0xdfebff, 1.1);
        light.position.set(100, 500, -650);
        light.position.multiplyScalar(1.3);
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;
        light.shadow.camera.far = 2000;
        scene.add(new THREE.AmbientLight(0xffffff, 0.2));
        scene.add(light);
    }

    function setSceneLimits() {
        if (mode) {
            animation(type);
        }
        // if (mode) {
        //     scene.rotation.y += 90 / Math.PI * 0.0001;
        // }
        if (camera.position.y >= 800) {
            camera.position.y = 800;
        } else if (camera.position.y <= 50) {
            camera.position.y = 50;
        }
        if (camera.position.z >= 800) {
            camera.position.z = 800;
        } else if (camera.position.z <= -800) {
            camera.position.z = -800;
        }
        if (camera.position.x >= 800) {
            camera.position.x = 800;
        } else if (camera.position.x <= -800) {
            camera.position.x = -800;
        }
    }
    //////////////////////////////////////////////////////
    
    function createRobot() { //            TODO REFACTOR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        let manager = new THREE.LoadingManager(),
            loader = new THREE.ImageLoader(manager);

        let textureHead = new THREE.Texture();

        loader.load('model/Head diff MAP.jpg', function(image) {
            textureHead.image = image;
            textureHead.needsUpdate = true;
        });
        let bodyBump = new THREE.TextureLoader().load('model/body-bump-map.jpg');
        let meshes = [],
            objLoader = new THREE.OBJLoader();
        objLoader.load('model/bb8.obj', function(object) {
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    meshes.push(child);
                }
            });
            let sphereGeometry = new THREE.SphereGeometry(50, 40, 40);
            let sphereTexture = new THREE.Texture(),
                sphereLoader = new THREE.ImageLoader();
            sphereLoader.load("model/Body-diff-map.jpg", function(e) {
                sphereTexture.image = e;
                sphereTexture.needsUpdate = true;
            });
            let sphereMat = new THREE.MeshStandardMaterial({
                map: sphereTexture,
                overdraw: true,
                roughness: 0.1,
                metalness: 0.2,
                specular: 0x222222,
                bumpMap: bodyBump
            });
            sphere = new THREE.Mesh(sphereGeometry, sphereMat);
            sphere.position.x = 0;
            sphere.position.y = 50;
            sphere.position.z = 0;
            scene.add(sphere);

            headMesh = meshes[0],
                body = meshes[1];

            headMesh.position.y = 0;
            headMesh.position.x = 10;
            sphere.castShadow = true; //default is false
            sphere.receiveShadow = true; //defaul

            let bumpMapHead = new THREE.TextureLoader().load('model/HEAD bump MAP.jpg');

            scene.add(headMesh);
            headMesh.castShadow = true;
            headMesh.receiveShadow = true;

            headMesh.material = new THREE.MeshStandardMaterial({
                map: textureHead,
                bumpMap: bumpMapHead,
                bumpScale: 1,
                specular: 0xfff7e8,
                roughness: 0.1,
                metalness: 0.2,
                specular: 0xffffff

            });
        });
        return [sphere, headMesh]
    }
    //////////////////////////////////////////////////////

    let controls = new THREE.OrbitControls(camera);
    controls.enabled = false;
    controls.enableKeys = false;
    let stats = new Stats();
    window.fps.appendChild(stats.dom);

    function rendering() {
        requestAnimationFrame(rendering);
        renderer.render(scene, camera);
        stats.update();

        shaderMaterial.uniforms['time'].value = .005 * (Date.now() - start);
        shaderMaterial.uniforms['weight'].value = perWeight * 0.05;
        // setSceneLimits();

        // console.log(camera.position);
        // console.log(camera.rotation);
        // scene.rotation.y += 90 / Math.PI * 0.0001;
        // if (cameraMode === 3) {
        //     camera.lookAt(headMesh.position);
        // }
        targetObject.rotation.y += 0.03;
        if (cameraMode === 2) {
            scene.rotation.y += 90 / Math.PI * 0.0001;
        }
    };

    let angle = 0,
        radius = 5;

    function animation(program) {
        switch (program) {
            case 'up':
                if (sphere.position.z >= -430) {
                    headMesh.position.z += -10;
                    sphere.position.z += -10;
                }
                sphere.rotation.x -= 180 / Math.PI * 0.002;
                break;
            case 'down':
                if (sphere.position.z <= 430) {
                    headMesh.position.z += 10;
                    sphere.position.z += 10;
                }
                sphere.rotation.x += 180 / Math.PI * 0.002;
                break;
            case 'left':
                if (sphere.position.x >= -420) {
                    headMesh.position.x += -10;
                    sphere.position.x += -10;
                }
                sphere.rotation.z += 180 / Math.PI * 0.002;
                sphere.rotation.x = 0;
                break;
            case 'right':
                if (sphere.position.x <= 420) {
                    headMesh.position.x += 10;
                    sphere.position.x += 10;
                }
                sphere.rotation.z -= 180 / Math.PI * 0.002;
                sphere.rotation.x = 0;
                break;
            case 'special':
                // headMesh.position.z += 4 * Math.sin(angle);
                // headMesh.position.x += 4 * Math.cos(angle);
                // sphere.position.z += 4 * Math.sin(angle);
                // sphere.position.x += 4 * Math.cos(angle);
                // sphere.rotation.y -= 180 / Math.PI * 0.002;
                // sphere.rotation.x += 180 / Math.PI * 0.002;
                // angle += Math.PI / 180 * 2; // 2 - degree
                // head.position.z += -10;
                // sphere.position.z += -10;
                // sphere.rotation.x -= 180 / Math.PI * 0.002;
                // head.position.x += -10;
                // sphere.position.x += -10;
                // sphere.rotation.z -= 180 / Math.PI * 0.002;
                break;
            default:
                break;
                /*sphere.position.z += 8 * Math.sin(angle);
        sphere.position.x += radius * Math.cos(angle);
        angle += Math.PI / 180 * 2; // 2 - degree  */
        }
    };

    function moveCameraTo(from, to) {

    }



    ///////// LISTENERS

    let controlsWrapper = document.getElementById('control-wrapper');
    let mode = false,
        type = '';

    controlsWrapper.addEventListener('touchstart', function(e) {
        if (e.target.classList.contains('control')) {
            mode = true;
            type = e.target.classList[1]
            animation(type);
        }
    });

    window.addEventListener('touchend', function(e) {
        mode = false;
    });
    window.addEventListener('touchmove', function(e) {
        mode = false;
    });
    document.addEventListener('keydown', function(e) {
        let moveType = 'notype';
        switch (e.key) {
            case '8':
                moveType = 'up';
                break;
            case '2':
                moveType = 'down';
                break;
            case '4':
                moveType = 'left';
                break;
            case '6':
                moveType = 'right';
                break;
            case '7':
                moveType = 'special';
                break;
            case 'ArrowUp':
                moveType = 'up';
                break;
            case 'ArrowDown':
                moveType = 'down';
                break;
            case 'ArrowLeft':
                moveType = 'left';
                break;
            case 'ArrowRight':
                moveType = 'right';
                break;
            default:
                moveType = 'notype';
                break;
        }
        if (moveType !== 'notype') {
            animation(moveType);
        }
    });
    window.addEventListener('resize', function(e) {
        resize();
    });

    let data1 = document.getElementById('data1');
    let data2 = document.getElementById('data2');
    let data3 = document.getElementById('data3');
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function(e) {
            data1.innerHTML = Math.ceil(event.alpha);
            data2.innerHTML = Math.ceil(event.beta);
            data3.innerHTML = Math.ceil(event.gamma);
        });
    }

    ///////////////////////////////////////////////////// - camera modes

    let modesWrapper = document.getElementsByClassName('camera-modes')[0],
        trackBallWrap = document.getElementsByClassName('track-ball')[0];
    modesWrapper.addEventListener('click', function(e) {
        if (e.target.className === 'mode') {
            Array.prototype.forEach.call(modesWrapper.children, function(item) {
                item.classList.remove('active');
            });
            e.target.classList.add('active');
            cameraMode = parseInt(e.target.dataset.mode);
            if (cameraMode === 1) {
                controls.reset();
                camera.position.set(0, 615, 700);
                camera.rotation.set(-0.72, 0, 0);
                controls.enabled = false;
                scene.rotation.y = 0;
                checkTrackBall();
            }
            if (cameraMode === 2) {}
        }
    });
    trackBallWrap.addEventListener('click', function(e) {
        controls.enabled = !controls.enabled;
        checkTrackBall();
    });

    function checkTrackBall() {
        controls.enabled ? trackBallWrap.classList.add('active') : trackBallWrap.classList.remove('active');
    }


    // window.addEventListener(deviceorientation, function() {
    //  var orientation = Math.abs(window.orientation) == 90 ? 'landscape' : 'portrait';
    //        console.log(orientation);
    //  // Применяем нужные нам стили
    // }, false);


    ///////// FUNCTIONS CALL

    // let helper = new THREE.DirectionalLightHelper(light,5);
    // scene.add(helper);

    scene.add(createSpaceScene());
    createEdges(scene);
    targetObject = createTargetObject(),
    scene.add(targetObject);
    scene.add(createPlane());
    createRobot();
    shaderMaterial = createEnemyRobot(scene);
    

    rendering();
    console.timeEnd('userTime');
};