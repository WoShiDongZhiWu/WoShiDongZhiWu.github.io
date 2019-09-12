// author wudong
// date 20190912

function mark_2d(view, dir_path, scene) {
    
    // snow
    var snowParticleSize = scene.drawingBufferWidth / 100.0;
    var snowRadius = 100000.0;
    var minimumSnowImageSize = new Cesium.Cartesian2(snowParticleSize, snowParticleSize);
    var maximumSnowImageSize = new Cesium.Cartesian2(snowParticleSize * 2.0, snowParticleSize * 2.0);
    var snowSystem;

    var snowGravityScratch = new Cesium.Cartesian3();
    var snowUpdate = function (particle, dt) {
        snowGravityScratch = Cesium.Cartesian3.normalize(particle.position, snowGravityScratch);
        Cesium.Cartesian3.multiplyByScalar(snowGravityScratch, Cesium.Math.randomBetween(-30.0, -300.0), snowGravityScratch);
        particle.velocity = Cesium.Cartesian3.add(particle.velocity, snowGravityScratch, particle.velocity);

        var distance = Cesium.Cartesian3.distance(scene.camera.position, particle.position);
        if (distance > snowRadius) {
            particle.endColor.alpha = 0.0;
        } else {
            particle.endColor.alpha = snowSystem.endColor.alpha / (distance / snowRadius + 0.1);
        }
    };

    snowSystem = new Cesium.ParticleSystem({
        modelMatrix: new Cesium.Matrix4.fromTranslation(scene.camera.position),
        minimumSpeed: -1.0,
        maximumSpeed: 0.0,
        lifetime: 15.0,
        emitter: new Cesium.SphereEmitter(snowRadius),
        startScale: 1,
        endScale: 1.0,
        image: 'data/colors.png',
        emissionRate: 7000.0,
        startColor: Cesium.Color.WHITE.withAlpha(0.0),
        endColor: Cesium.Color.WHITE.withAlpha(1.0),
        minimumImageSize: minimumSnowImageSize,
        maximumImageSize: maximumSnowImageSize,
        updateCallback: snowUpdate
    });
    scene.primitives.add(snowSystem);



    positionArr = [[116.40, 39.90], [116.50, 40.90], [121.43, 37.45], [112.15, 37.55], [118.5, 34.5]];
    str_text = ["栋哥", "栋哥的姐姐", "琦宝", "栋哥的爸妈", "琦宝的爸妈"];
    image_path = "data/love.png";
    for (i = 0; i < 5; i++) {
        add_2d_mark(view, positionArr[i], str_text[i], image_path);
    }
    for (i = 0; i < 11; i++) {
        ran = Math.random()-0.5;
        a = 121.43+ran;
        ran = Math.random()-0.5;
        b =  37.45+ran;
        add_flower(view, [a,b]);
    }
    // create_firework();
    /*
          流纹纹理线
          color 颜色
          duration 持续时间 毫秒
       */
    function PolylineTrailLinkMaterialProperty(color, duration) {
        this._definitionChanged = new Cesium.Event();
        this._color = undefined;
        this._colorSubscription = undefined;
        this.color = color;
        this.duration = duration;
        this._time = (new Date()).getTime();
    }
    Cesium.defineProperties(PolylineTrailLinkMaterialProperty.prototype, {
        isConstant: {
            get: function () {
                return false;
            }
        },
        definitionChanged: {
            get: function () {
                return this._definitionChanged;
            }
        },
        color: Cesium.createPropertyDescriptor('color')
    });
    PolylineTrailLinkMaterialProperty.prototype.getType = function (time) {
        return 'PolylineTrailLink';
    }
    PolylineTrailLinkMaterialProperty.prototype.getValue = function (time, result) {
        if (!Cesium.defined(result)) {
            result = {};
        }
        result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
        result.image = Cesium.Material.PolylineTrailLinkImage;
        result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
        return result;
    }
    PolylineTrailLinkMaterialProperty.prototype.equals = function (other) {
        return this === other ||
            (other instanceof PolylineTrailLinkMaterialProperty &&
                Cesium.Property.equals(this._color, other._color))
    }
    Cesium.PolylineTrailLinkMaterialProperty = PolylineTrailLinkMaterialProperty;
    Cesium.Material.PolylineTrailLinkType = 'PolylineTrailLink';
    Cesium.Material.PolylineTrailLinkImage = "data/colors.png";
    Cesium.Material.PolylineTrailLinkSource = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
                                                  {\n\
                                                       czm_material material = czm_getDefaultMaterial(materialInput);\n\
                                                       vec2 st = materialInput.st;\n\
                                                       vec4 colorImage = texture2D(image, vec2(fract(st.s - time), st.t));\n\
                                                       material.alpha = colorImage.a * color.a;\n\
                                                       material.diffuse = (colorImage.rgb+color.rgb)/2.0;\n\
                                                       return material;\n\
                                                   }";
    Cesium.Material._materialCache.addMaterial(Cesium.Material.PolylineTrailLinkType, {
        fabric: {
            type: Cesium.Material.PolylineTrailLinkType,
            uniforms: {
                color: new Cesium.Color(1.0, 0.0, 0.0, 0.5),
                image: Cesium.Material.PolylineTrailLinkImage,
                time: 0
            },
            source: Cesium.Material.PolylineTrailLinkSource
        },
        translucent: function (material) {
            return true;
        }
    });
    material = new Cesium.PolylineTrailLinkMaterialProperty(Cesium.Color.ORANGE, 1000);
    add_line(view, [116.40, 39.90, 116.50, 40.90], material);
    add_line(view, [116.40, 39.90, 121.43, 37.45], material);
    add_line(view, [116.40, 39.90, 112.15, 37.55], material);
    add_line(view, [116.40, 39.90, 118.5, 34.5], material);

    add_line(view, [116.50, 40.90, 121.43, 37.45], material);
    add_line(view, [116.50, 40.90, 112.15, 37.55], material);
    add_line(view, [116.50, 40.90, 118.5, 34.5], material);

    add_line(view, [121.43, 37.45, 112.15, 37.55], material);
    add_line(view, [121.43, 37.45, 118.5, 34.5], material);

    add_line(view, [112.15, 37.55, 118.5, 34.5], material);


    view.camera.flyTo({
        destination : Cesium.Cartesian3.fromDegrees(116.5, 32.7, 1500000.0),
        orientation : {
            heading : Cesium.Math.toRadians(0.0),
            pitch : Cesium.Math.toRadians(-70.0),
            roll : 0.0
        }
    });

}


function add_2d_mark(viewer, positionArr, str_text) {
    height = 100;
    var mark = viewer.entities.add({
        name: ' mark',
        position: Cesium.Cartesian3.fromDegrees(positionArr[0], positionArr[1], height),
        billboard: {
            image: image_path,
            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        label: {
            show: true,
            showBackground: true,
            font: '20px monospace',
            horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            text: str_text,
            pixelOffset: new Cesium.Cartesian2(15.0, 0.0)

        },
        polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([positionArr[0], positionArr[1], height,
            positionArr[0], positionArr[1], 0]),
            width: 2,
            material: new Cesium.PolylineOutlineMaterialProperty({
                color: Cesium.Color.YELLOW,
                outlineWidth: 0,
            })
        }
    });
    // view.zoomTo(point);
}

function add_line(viewer, positionArr, material) {
    var glowingLine = viewer.entities.add({
        name: 'Glowing blue line on the surface',
        polyline: {
            positions: Cesium.Cartesian3.fromDegreesArray([positionArr[0], positionArr[1],
            positionArr[2], positionArr[3]]),
            width: 10,
            material: material
        }
    });

}

function create_firework() {
    Cesium.Math.setRandomNumberSeed(315);

    var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(116.40, 40.03883));
    var emitterInitialLocation = new Cesium.Cartesian3(0.0, 0.0, 100.0);

    var particleCanvas;

    function getImage() {
        if (!Cesium.defined(particleCanvas)) {
            particleCanvas = document.createElement('canvas');
            particleCanvas.width = 200;
            particleCanvas.height = 200;
            var context2D = particleCanvas.getContext('2d');
            context2D.beginPath();
            context2D.arc(8, 8, 8, 0, Cesium.Math.TWO_PI, true);
            context2D.closePath();
            context2D.fillStyle = 'rgb(255, 255, 255)';
            context2D.fill();
        }
        return particleCanvas;
    }

    var minimumExplosionSize = 30.0;
    var maximumExplosionSize = 100.0;
    var particlePixelSize = new Cesium.Cartesian2(7.0, 7.0);
    var burstSize = 40.0;
    var lifetime = 10.0;
    var numberOfFireworks = 20.0;

    var emitterModelMatrixScratch = new Cesium.Matrix4();

    function createFirework(offset, color, bursts) {
        var position = Cesium.Cartesian3.add(emitterInitialLocation, offset, new Cesium.Cartesian3());
        var emitterModelMatrix = Cesium.Matrix4.fromTranslation(position, emitterModelMatrixScratch);
        var particleToWorld = Cesium.Matrix4.multiply(modelMatrix, emitterModelMatrix, new Cesium.Matrix4());
        var worldToParticle = Cesium.Matrix4.inverseTransformation(particleToWorld, particleToWorld);

        var size = Cesium.Math.randomBetween(minimumExplosionSize, maximumExplosionSize);
        var particlePositionScratch = new Cesium.Cartesian3();
        var force = function (particle) {
            var position = Cesium.Matrix4.multiplyByPoint(worldToParticle, particle.position, particlePositionScratch);
            if (Cesium.Cartesian3.magnitudeSquared(position) >= size * size) {
                Cesium.Cartesian3.clone(Cesium.Cartesian3.ZERO, particle.velocity);
            }
        };

        var normalSize = (size - minimumExplosionSize) / (maximumExplosionSize - minimumExplosionSize);
        var minLife = 0.3;
        var maxLife = 1.0;
        var life = normalSize * (maxLife - minLife) + minLife;

        scene.primitives.add(new Cesium.ParticleSystem({
            image: getImage(),
            startColor: color,
            endColor: color.withAlpha(0.0),
            particleLife: life,
            speed: 100.0,
            imageSize: particlePixelSize,
            emissionRate: 0,
            emitter: new Cesium.SphereEmitter(0.1),
            bursts: bursts,
            lifetime: lifetime,
            updateCallback: force,
            modelMatrix: modelMatrix,
            emitterModelMatrix: emitterModelMatrix
        }));
    }

    var xMin = -100.0;
    var xMax = 100.0;
    var yMin = -80.0;
    var yMax = 100.0;
    var zMin = -50.0;
    var zMax = 50.0;

    var colorOptions = [{
        minimumRed: 0.75,
        green: 0.0,
        minimumBlue: 0.8,
        alpha: 1.0
    }, {
        red: 0.0,
        minimumGreen: 0.75,
        minimumBlue: 0.8,
        alpha: 1.0
    }, {
        red: 0.0,
        green: 0.0,
        minimumBlue: 0.8,
        alpha: 1.0
    }, {
        minimumRed: 0.75,
        minimumGreen: 0.75,
        blue: 0.0,
        alpha: 1.0
    }];

    for (var i = 0; i < numberOfFireworks; ++i) {
        var x = Cesium.Math.randomBetween(xMin, xMax);
        var y = Cesium.Math.randomBetween(yMin, yMax);
        var z = Cesium.Math.randomBetween(zMin, zMax);
        var offset = new Cesium.Cartesian3(x, y, z);
        var color = Cesium.Color.fromRandom(colorOptions[i % colorOptions.length]);

        var bursts = [];
        for (var j = 0; j < 3; ++j) {
            bursts.push(new Cesium.ParticleBurst({
                time: Cesium.Math.nextRandomNumber() * lifetime,
                minimum: burstSize,
                maximum: burstSize
            }));
        }

        createFirework(offset, color, bursts);
    }
}

function add_flower(viewer, positionArr) {
    height = 100;
    var mark = viewer.entities.add({
        name: ' mark',
        position: Cesium.Cartesian3.fromDegrees(positionArr[0], positionArr[1], height),
        billboard: {
            image: "data/flower_map.png",
            scaleByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e7, 0.5),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
        polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([positionArr[0], positionArr[1], height,
            positionArr[0], positionArr[1], 0]),
            width: 2,
            material: new Cesium.PolylineOutlineMaterialProperty({
                color: Cesium.Color.YELLOW,
                outlineWidth: 0,
            })
        }
    });
}